import { describe, expect, it } from 'vitest'

import {
  clearAuthToken,
  getAuthToken,
  hasAuthPersistence,
  hasAuthToken,
  saveAuthToken,
  saveRefreshedAuthToken,
} from '@/features/auth/token-storage'

describe('token-storage', () => {
  it('saves persistent tokens in localStorage and clears sessionStorage', () => {
    window.sessionStorage.setItem('projectscene.auth.token', 'old-session-token')
    window.sessionStorage.setItem('projectscene.auth.persistence', 'session')

    saveAuthToken('local-token', true)

    expect(window.localStorage.getItem('projectscene.auth.token')).toBe('local-token')
    expect(window.localStorage.getItem('projectscene.auth.persistence')).toBe('local')
    expect(window.sessionStorage.getItem('projectscene.auth.token')).toBeNull()
    expect(window.sessionStorage.getItem('projectscene.auth.persistence')).toBeNull()
    expect(getAuthToken()).toBe('local-token')
    expect(hasAuthToken()).toBe(true)
    expect(hasAuthPersistence()).toBe(true)
  })

  it('saves session tokens in sessionStorage and clears localStorage', () => {
    window.localStorage.setItem('projectscene.auth.token', 'old-local-token')
    window.localStorage.setItem('projectscene.auth.persistence', 'local')

    saveAuthToken('session-token', false)

    expect(window.sessionStorage.getItem('projectscene.auth.token')).toBe('session-token')
    expect(window.sessionStorage.getItem('projectscene.auth.persistence')).toBe('session')
    expect(window.localStorage.getItem('projectscene.auth.token')).toBeNull()
    expect(window.localStorage.getItem('projectscene.auth.persistence')).toBeNull()
    expect(getAuthToken()).toBe('session-token')
  })

  it('keeps the current persistence mode when saving a refreshed token', () => {
    saveAuthToken('old-token', true)

    saveRefreshedAuthToken('new-token')

    expect(window.localStorage.getItem('projectscene.auth.token')).toBe('new-token')
    expect(window.localStorage.getItem('projectscene.auth.persistence')).toBe('local')
    expect(window.sessionStorage.getItem('projectscene.auth.token')).toBeNull()
  })

  it('defaults refreshed tokens to sessionStorage without persisted mode', () => {
    saveRefreshedAuthToken('new-token')

    expect(window.sessionStorage.getItem('projectscene.auth.token')).toBe('new-token')
    expect(window.localStorage.getItem('projectscene.auth.token')).toBeNull()
  })

  it('clears tokens and persistence from both storages', () => {
    saveAuthToken('local-token', true)
    window.sessionStorage.setItem('projectscene.auth.token', 'session-token')
    window.sessionStorage.setItem('projectscene.auth.persistence', 'session')

    clearAuthToken()

    expect(getAuthToken()).toBe('')
    expect(hasAuthToken()).toBe(false)
    expect(hasAuthPersistence()).toBe(false)
  })
})
