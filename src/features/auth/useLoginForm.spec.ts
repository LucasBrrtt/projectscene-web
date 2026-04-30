import { describe, expect, it, vi } from 'vitest'

import { AuthError } from '@/features/auth/auth.service'
import { useLoginForm } from '@/features/auth/useLoginForm'

const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  saveAuthToken: vi.fn(),
  routerPush: vi.fn(),
}))

vi.mock('@/features/auth/auth.service', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/features/auth/auth.service')>(),
  login: mocks.login,
}))

vi.mock('@/features/auth/token-storage', () => ({
  saveAuthToken: mocks.saveAuthToken,
}))

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mocks.routerPush,
  }),
}))

describe('useLoginForm', () => {
  it('starts with an empty login form and disabled submit', () => {
    const { form, isSubmitting, isSubmitDisabled, errorMessage } = useLoginForm()

    expect(form).toEqual({
      username: '',
      password: '',
      rememberMe: true,
    })
    expect(isSubmitting.value).toBe(false)
    expect(isSubmitDisabled.value).toBe(true)
    expect(errorMessage.value).toBe('')
  })

  it('submits normalized credentials, saves token, and navigates to test route', async () => {
    mocks.login.mockResolvedValueOnce({ accessToken: 'access-token' })
    mocks.routerPush.mockResolvedValueOnce(undefined)
    const { form, submit } = useLoginForm()
    form.username = '  lucas  '
    form.password = 'secret'
    form.rememberMe = false

    await expect(submit()).resolves.toEqual({
      username: 'lucas',
      password: 'secret',
      rememberMe: false,
    })

    expect(mocks.login).toHaveBeenCalledWith({
      username: 'lucas',
      password: 'secret',
      rememberMe: false,
    })
    expect(mocks.saveAuthToken).toHaveBeenCalledWith('access-token', false)
    expect(mocks.routerPush).toHaveBeenCalledWith({ name: 'test' })
  })

  it('does not submit while required fields are blank', async () => {
    const { form, submit } = useLoginForm()
    form.username = 'lucas'
    form.password = '   '

    await expect(submit()).resolves.toBeNull()

    expect(mocks.login).not.toHaveBeenCalled()
  })

  it('shows AuthError messages from the API', async () => {
    mocks.login.mockRejectedValueOnce(new AuthError('Credenciais invalidas', 401))
    const { form, errorMessage, submit } = useLoginForm()
    form.username = 'lucas'
    form.password = 'wrong'

    await expect(submit()).resolves.toBeNull()

    expect(errorMessage.value).toBe('Credenciais invalidas')
  })

  it('shows a connection fallback for unknown errors', async () => {
    mocks.login.mockRejectedValueOnce(new Error('network down'))
    const { form, errorMessage, submit } = useLoginForm()
    form.username = 'lucas'
    form.password = 'secret'

    await expect(submit()).resolves.toBeNull()

    expect(errorMessage.value).toBe('Falha ao conectar com o servidor.')
  })

  it('blocks a second submit while the first one is still pending', async () => {
    let resolveLogin: (value: { accessToken: string }) => void = () => {}
    mocks.login.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveLogin = resolve
      }),
    )
    mocks.routerPush.mockResolvedValueOnce(undefined)
    const { form, isSubmitting, submit } = useLoginForm()
    form.username = 'lucas'
    form.password = 'secret'

    const firstSubmit = submit()
    const secondSubmit = submit()

    expect(isSubmitting.value).toBe(true)
    await expect(secondSubmit).resolves.toBeNull()
    expect(mocks.login).toHaveBeenCalledTimes(1)

    resolveLogin({ accessToken: 'access-token' })
    await expect(firstSubmit).resolves.toEqual({
      username: 'lucas',
      password: 'secret',
      rememberMe: true,
    })
    expect(isSubmitting.value).toBe(false)
  })
})
