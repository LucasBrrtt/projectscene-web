import { beforeEach, describe, expect, it, vi } from 'vitest'

type ClientMocks = {
  clearAuthToken: ReturnType<typeof vi.fn>
  getAuthToken: ReturnType<typeof vi.fn>
  saveRefreshedAuthToken: ReturnType<typeof vi.fn>
  refreshAccessToken: ReturnType<typeof vi.fn>
  routerPush: ReturnType<typeof vi.fn>
  currentRouteName?: string
}

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

async function loadClient(mocks: ClientMocks) {
  vi.doMock('@/features/auth/token-storage', () => ({
    clearAuthToken: mocks.clearAuthToken,
    getAuthToken: mocks.getAuthToken,
    saveRefreshedAuthToken: mocks.saveRefreshedAuthToken,
  }))

  vi.doMock('@/features/auth/auth.service', () => ({
    refreshAccessToken: mocks.refreshAccessToken,
  }))

  vi.doMock('@/router', () => ({
    default: {
      currentRoute: {
        value: {
          name: mocks.currentRouteName ?? 'test',
        },
      },
      push: mocks.routerPush,
    },
  }))

  return import('@/lib/api/client')
}

describe('apiFetch', () => {
  let mocks: ClientMocks

  beforeEach(() => {
    vi.resetModules()
    vi.stubGlobal('fetch', vi.fn())
    mocks = {
      clearAuthToken: vi.fn(),
      getAuthToken: vi.fn(() => 'saved-token'),
      saveRefreshedAuthToken: vi.fn(),
      refreshAccessToken: vi.fn(),
      routerPush: vi.fn(),
    }
  })

  it('sends authorization and JSON body by default', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ ok: true }))
    const { apiFetch } = await loadClient(mocks)

    await expect(apiFetch('/api/projects', { method: 'POST', body: { name: 'Cena' } })).resolves.toEqual({
      ok: true,
    })

    const [, init] = vi.mocked(fetch).mock.calls[0]!
    const headers = init?.headers as Headers

    expect(fetch).toHaveBeenCalledWith(
      'undefined/api/projects',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({ name: 'Cena' }),
      }),
    )
    expect(headers.get('Authorization')).toBe('Bearer saved-token')
    expect(headers.get('Content-Type')).toBe('application/json')
  })

  it('does not add authorization when requiresAuth is false', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ public: true }))
    const { apiFetch } = await loadClient(mocks)

    await apiFetch('/api/public', { requiresAuth: false })

    const [, init] = vi.mocked(fetch).mock.calls[0]!
    const headers = init?.headers as Headers

    expect(headers.has('Authorization')).toBe(false)
  })

  it('refreshes once on 401 and retries the original request', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({ ok: true }))
    mocks.refreshAccessToken.mockResolvedValueOnce({ accessToken: 'fresh-token' })
    const { apiFetch } = await loadClient(mocks)

    await expect(apiFetch('/api/projects')).resolves.toEqual({ ok: true })

    expect(mocks.refreshAccessToken).toHaveBeenCalledTimes(1)
    expect(mocks.saveRefreshedAuthToken).toHaveBeenCalledWith('fresh-token')
    expect(fetch).toHaveBeenCalledTimes(2)

    const [, retryInit] = vi.mocked(fetch).mock.calls[1]!
    const retryHeaders = retryInit?.headers as Headers
    expect(retryHeaders.get('Authorization')).toBe('Bearer fresh-token')
  })

  it('shares the same refresh request between concurrent 401 responses', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({ id: 1 }))
      .mockResolvedValueOnce(jsonResponse({ id: 2 }))
    mocks.refreshAccessToken.mockResolvedValueOnce({ accessToken: 'fresh-token' })
    const { apiFetch } = await loadClient(mocks)

    await expect(Promise.all([apiFetch('/api/a'), apiFetch('/api/b')])).resolves.toEqual([
      { id: 1 },
      { id: 2 },
    ])

    expect(mocks.refreshAccessToken).toHaveBeenCalledTimes(1)
  })

  it('clears auth and redirects to login when refresh fails', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(jsonResponse({ message: 'Expirado' }, { status: 401 }))
      .mockResolvedValueOnce(jsonResponse({ message: 'Expirado' }, { status: 401 }))
    mocks.refreshAccessToken.mockRejectedValueOnce(new Error('refresh failed'))
    const { apiFetch, ApiError } = await loadClient(mocks)

    await expect(apiFetch('/api/projects')).rejects.toBeInstanceOf(ApiError)

    expect(mocks.clearAuthToken).toHaveBeenCalled()
    expect(mocks.routerPush).toHaveBeenCalledWith({
      name: 'login',
      query: {
        reason: 'expired',
      },
    })
  })

  it('redirects with forbidden reason on 403', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ title: 'Sem permissao' }, { status: 403 }))
    const { apiFetch } = await loadClient(mocks)

    await expect(apiFetch('/api/admin')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Sem permissao',
      status: 403,
    })

    expect(mocks.routerPush).toHaveBeenCalledWith({
      name: 'login',
      query: {
        reason: 'forbidden',
      },
    })
  })

  it('does not redirect again when already on login', async () => {
    mocks.currentRouteName = 'login'
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ message: 'Expirado' }, { status: 401 }))
    const { apiFetch } = await loadClient(mocks)

    await expect(apiFetch('/api/projects', { skipAuthRefresh: true })).rejects.toMatchObject({
      status: 401,
    })

    expect(mocks.clearAuthToken).toHaveBeenCalled()
    expect(mocks.routerPush).not.toHaveBeenCalled()
  })

  it('returns undefined for 204 responses', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 204 }))
    const { apiFetch } = await loadClient(mocks)

    await expect(apiFetch('/api/projects/1', { method: 'DELETE' })).resolves.toBeUndefined()
  })
})
