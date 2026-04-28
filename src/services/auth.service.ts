import type { LoginForm } from '../types/login-form'

export type LoginRequest = LoginForm

export async function login(_: LoginRequest) {
  // Placeholder para integrar a chamada real da API de autenticacao.
  return Promise.resolve()
}
