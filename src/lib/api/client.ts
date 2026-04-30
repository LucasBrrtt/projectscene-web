import router from '@/router'
import { refreshAccessToken } from '@/features/auth/auth.service'
import { clearAuthToken, getAuthToken, saveRefreshedAuthToken } from '@/features/auth/token-storage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type ApiRequestOptions = {
  method?: ApiMethod
  body?: unknown
  headers?: HeadersInit
  requiresAuth?: boolean
  skipAuthRefresh?: boolean
}

type ApiErrorPayload = {
  message?: string
  title?: string
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function parseErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as ApiErrorPayload
    if (typeof data.message === 'string' && data.message.trim()) return data.message
    if (typeof data.title === 'string' && data.title.trim()) return data.title
  } catch {
    // Mantem a mensagem padrao quando a resposta nao vier em JSON.
  }

  return 'Nao foi possivel concluir a requisicao.'
}

async function handleUnauthorizedResponse(status: number) {
  clearAuthToken()

  const currentRoute = router.currentRoute.value
  if (currentRoute.name !== 'login') {
    await router.push({
      name: 'login',
      query: {
        reason: status === 401 ? 'expired' : 'forbidden',
      },
    })
  }
}

let refreshRequest: Promise<string | null> | null = null

async function tryRefreshAccessToken() {
  // Centraliza a renovacao do token para que varias requisicoes 401
  // compartilhem a mesma tentativa em vez de competir entre si.
  if (refreshRequest) {
    return refreshRequest
  }

  refreshRequest = (async () => {
    try {
      const { accessToken } = await refreshAccessToken()
      saveRefreshedAuthToken(accessToken)
      return accessToken
    } catch {
      return null
    } finally {
      refreshRequest = null
    }
  })()

  return refreshRequest
}

export async function apiFetch<TResponse>(path: string, options: ApiRequestOptions = {}): Promise<TResponse> {
  const { method = 'GET', body, headers, requiresAuth = true, skipAuthRefresh = false } = options

  async function performRequest(token: string) {
    const requestHeaders = new Headers(headers)

    if (body !== undefined && !requestHeaders.has('Content-Type')) {
      requestHeaders.set('Content-Type', 'application/json')
    }

    if (requiresAuth && token) {
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }

    return fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  }

  let response = await performRequest(getAuthToken())

  if (response.status === 401 && requiresAuth && !skipAuthRefresh) {
    // Ao receber 401 em uma rota autenticada, tentamos renovar o access token
    // e repetimos a chamada original uma unica vez.
    const refreshedToken = await tryRefreshAccessToken()

    if (refreshedToken) {
      response = await performRequest(refreshedToken)

      if (response.status === 401 || response.status === 403) {
        await handleUnauthorizedResponse(response.status)
      }
    } else {
      await handleUnauthorizedResponse(401)
    }
  } else if (requiresAuth && (response.status === 401 || response.status === 403)) {
    await handleUnauthorizedResponse(response.status)
  }

  if (!response.ok) {
    const message = await parseErrorMessage(response)
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    // Algumas rotas nao devolvem corpo; nesse caso o chamador
    // recebe apenas undefined tipado.
    return undefined as TResponse
  }

  return (await response.json()) as TResponse
}
