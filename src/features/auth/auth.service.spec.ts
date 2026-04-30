import { beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthError, login, logout, refreshAccessToken } from '@/features/auth/auth.service'

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
}

describe('auth.service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  it('posts normalized login payload with credentials', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ accessToken: 'token' }))

    await expect(
      login({ username: '  lucas  ', password: 'secret', rememberMe: true }),
    ).resolves.toEqual({ accessToken: 'token' })

    expect(fetch).toHaveBeenCalledWith('undefined/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ username: 'lucas', password: 'secret', rememberMe: true }),
    })
  })

  it('refreshes access token through the refresh endpoint', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ accessToken: 'fresh-token' }))

    await expect(refreshAccessToken()).resolves.toEqual({ accessToken: 'fresh-token' })

    expect(fetch).toHaveBeenCalledWith(
      'undefined/api/auth/refresh',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: undefined,
      }),
    )
  })

  it('turns auth failures into AuthError using the API message', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ message: 'Credenciais invalidas' }, { status: 400 }))

    await expect(
      login({ username: 'lucas', password: 'wrong', rememberMe: false }),
    ).rejects.toMatchObject({
      name: 'AuthError',
      message: 'Credenciais invalidas',
      status: 400,
    })
  })

  it('uses fallback AuthError message when error response is not JSON', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response('nope', { status: 500 }))

    await expect(
      login({ username: 'lucas', password: 'secret', rememberMe: false }),
    ).rejects.toEqual(new AuthError('Nao foi possivel concluir a autenticacao.', 500))
  })

  it('does not throw on logout 401', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 401 }))

    await expect(logout()).resolves.toBeUndefined()
  })

  it('throws AuthError on logout failures other than 401', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(jsonResponse({ title: 'Erro no logout' }, { status: 503 }))

    await expect(logout()).rejects.toMatchObject({
      name: 'AuthError',
      message: 'Erro no logout',
      status: 503,
    })
  })
})
