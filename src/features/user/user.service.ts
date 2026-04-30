import { apiFetch } from '@/lib/api/client'

export type RegisterUserRequest = {
  fullName: string
  email: string
  username: string
  password: string
}

export type RegisterUserResponse = {
  id: number
  fullName: string
  email: string
  username: string
}

export async function registerUser(payload: RegisterUserRequest): Promise<RegisterUserResponse> {
  // Cadastro e publico, por isso essa chamada nao exige bearer token.
  return apiFetch<RegisterUserResponse>('/api/user', {
    method: 'POST',
    requiresAuth: false,
    body: payload,
  })
}
