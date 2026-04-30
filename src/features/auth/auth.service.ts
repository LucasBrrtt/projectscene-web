import type { LoginForm } from '@/features/auth/login-form'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export type LoginRequest = LoginForm

export type AuthTokenResponse = {
  accessToken: string
}

type AuthErrorPayload = {
  message?: string
  error?: string
  title?: string
}

export class AuthError extends Error {
  status: number

  constructor(message: string, status = 500) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

async function parseAuthError(response: Response) {
  let message = 'Nao foi possivel concluir a autenticacao.'

  try {
    const data = (await response.json()) as AuthErrorPayload

    if (typeof data.message === 'string' && data.message.trim()) {
      message = data.message
    } else if (typeof data.error === 'string' && data.error.trim()) {
      message = data.error
    } else if (typeof data.title === 'string' && data.title.trim()) {
      message = data.title
    }
  } catch {
    // Mantem a mensagem padrao quando a resposta nao vier em JSON.
  }

  return new AuthError(message, response.status)
}

async function authRequest(path: string, body?: unknown): Promise<AuthTokenResponse> {
  // O backend usa cookie HttpOnly para refresh e devolve um access token
  // novo no corpo da resposta, por isso sempre enviamos credentials.
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) {
    throw await parseAuthError(response)
  }

  return (await response.json()) as AuthTokenResponse
}

export async function login(payload: LoginRequest): Promise<AuthTokenResponse> {
  // Normaliza o username antes do envio para reduzir erro causado por espacos.
  return authRequest('/api/auth/login', {
    username: payload.username.trim(),
    password: payload.password,
    rememberMe: payload.rememberMe,
  })
}

export async function refreshAccessToken(): Promise<AuthTokenResponse> {
  // O refresh depende do cookie ja armazenado pelo navegador.
  return authRequest('/api/auth/refresh')
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok && response.status !== 401) {
    throw await parseAuthError(response)
  }
}
