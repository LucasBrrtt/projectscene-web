const AUTH_TOKEN_KEY = 'projectscene.auth.token'
const AUTH_PERSISTENCE_KEY = 'projectscene.auth.persistence'

// "local" mantem a sessao ao fechar o navegador.
// "session" dura apenas enquanto a aba estiver aberta.
type PersistenceMode = 'local' | 'session'

export function getAuthToken(): string {
  return (
    window.localStorage.getItem(AUTH_TOKEN_KEY)
    ?? window.sessionStorage.getItem(AUTH_TOKEN_KEY)
    ?? ''
  )
}

export function hasAuthToken(): boolean {
  return Boolean(getAuthToken())
}

export function hasAuthPersistence(): boolean {
  return Boolean(
    window.localStorage.getItem(AUTH_PERSISTENCE_KEY)
    ?? window.sessionStorage.getItem(AUTH_PERSISTENCE_KEY),
  )
}

export function saveAuthToken(token: string, rememberMe: boolean) {
  const mode: PersistenceMode = rememberMe ? 'local' : 'session'
  const storage = mode === 'local' ? window.localStorage : window.sessionStorage
  const otherStorage = mode === 'local' ? window.sessionStorage : window.localStorage

  // Garante que o token exista em apenas um storage por vez,
  // evitando estados inconsistentes entre sessao e persistencia local.
  otherStorage.removeItem(AUTH_TOKEN_KEY)
  otherStorage.removeItem(AUTH_PERSISTENCE_KEY)
  storage.setItem(AUTH_TOKEN_KEY, token)
  storage.setItem(AUTH_PERSISTENCE_KEY, mode)
}

export function saveRefreshedAuthToken(token: string) {
  const mode = getPersistenceMode()
  const storage = mode === 'local' ? window.localStorage : window.sessionStorage
  const otherStorage = mode === 'local' ? window.sessionStorage : window.localStorage

  // Durante o refresh mantemos o mesmo modo de persistencia escolhido no login.
  otherStorage.removeItem(AUTH_TOKEN_KEY)
  storage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY)
  window.sessionStorage.removeItem(AUTH_TOKEN_KEY)
  window.localStorage.removeItem(AUTH_PERSISTENCE_KEY)
  window.sessionStorage.removeItem(AUTH_PERSISTENCE_KEY)
}

function getPersistenceMode(): PersistenceMode {
  const storedMode =
    window.localStorage.getItem(AUTH_PERSISTENCE_KEY)
    ?? window.sessionStorage.getItem(AUTH_PERSISTENCE_KEY)

  return storedMode === 'local' ? 'local' : 'session'
}
