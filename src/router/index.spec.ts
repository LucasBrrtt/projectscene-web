import { beforeEach, describe, expect, it, vi } from 'vitest'

type RouterMocks = {
  refreshAccessToken: ReturnType<typeof vi.fn>
  clearAuthToken: ReturnType<typeof vi.fn>
  hasAuthPersistence: ReturnType<typeof vi.fn>
  hasAuthToken: ReturnType<typeof vi.fn>
  saveRefreshedAuthToken: ReturnType<typeof vi.fn>
}

async function loadRouter(mocks: RouterMocks) {
  vi.doMock('@/features/auth/auth.service', () => ({
    refreshAccessToken: mocks.refreshAccessToken,
  }))

  vi.doMock('@/features/auth/token-storage', () => ({
    clearAuthToken: mocks.clearAuthToken,
    hasAuthPersistence: mocks.hasAuthPersistence,
    hasAuthToken: mocks.hasAuthToken,
    saveRefreshedAuthToken: mocks.saveRefreshedAuthToken,
  }))

  const { default: router } = await import('@/router')
  return router
}

describe('router guards', () => {
  let mocks: RouterMocks

  beforeEach(() => {
    vi.resetModules()
    window.history.replaceState({}, '', '/')
    mocks = {
      refreshAccessToken: vi.fn(),
      clearAuthToken: vi.fn(),
      hasAuthPersistence: vi.fn(() => false),
      hasAuthToken: vi.fn(() => false),
      saveRefreshedAuthToken: vi.fn(),
    }
  })

  it('redirects unauthenticated users away from protected routes', async () => {
    const router = await loadRouter(mocks)

    await router.push('/teste')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('login')
  })

  it('allows protected routes when a token exists and no restore is required', async () => {
    mocks.hasAuthToken.mockReturnValue(true)
    const router = await loadRouter(mocks)

    await router.push('/teste')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('test')
    expect(mocks.refreshAccessToken).not.toHaveBeenCalled()
  })

  it('restores persisted sessions before entering protected routes', async () => {
    mocks.hasAuthPersistence.mockReturnValue(true)
    mocks.refreshAccessToken.mockResolvedValueOnce({ accessToken: 'fresh-token' })
    const router = await loadRouter(mocks)

    await router.push('/teste')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('test')
    expect(mocks.saveRefreshedAuthToken).toHaveBeenCalledWith('fresh-token')
  })

  it('clears auth and returns to login when session restore fails', async () => {
    mocks.hasAuthPersistence.mockReturnValue(true)
    mocks.refreshAccessToken.mockRejectedValueOnce(new Error('expired'))
    const router = await loadRouter(mocks)

    await router.push('/teste')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('login')
    expect(mocks.clearAuthToken).toHaveBeenCalled()
  })

  it('redirects guest users with a valid persisted session to the test route', async () => {
    window.history.replaceState({}, '', '/login-start')
    mocks.hasAuthPersistence.mockReturnValue(true)
    mocks.refreshAccessToken.mockResolvedValue({ accessToken: 'fresh-token' })
    const router = await loadRouter(mocks)

    await router.push('/')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('test')
  })

  it('keeps guest users on login when persisted session cannot be restored', async () => {
    window.history.replaceState({}, '', '/login-start')
    mocks.hasAuthPersistence.mockReturnValue(true)
    mocks.refreshAccessToken.mockRejectedValueOnce(new Error('expired'))
    const router = await loadRouter(mocks)

    await router.push('/')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('login')
    expect(mocks.clearAuthToken).toHaveBeenCalled()
  })
})
