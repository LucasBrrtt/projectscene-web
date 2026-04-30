import { createRouter, createWebHistory } from 'vue-router'

import { refreshAccessToken } from '@/features/auth/auth.service'
import { clearAuthToken, hasAuthPersistence, hasAuthToken, saveRefreshedAuthToken } from '@/features/auth/token-storage'
import LoginView from '@/views/LoginView/LoginView.vue'
import TestView from '@/views/TestView/TestView.vue'

// As metas das rotas sao usadas pelo guarda global logo abaixo
// para decidir quem pode entrar em cada tela.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: {
        guestOnly: true,
      },
    },
    {
      path: '/teste',
      name: 'test',
      component: TestView,
      meta: {
        requiresAuth: true,
      },
    },
  ],
})

let restoreSessionRequest: Promise<boolean> | null = null

async function tryRestoreSession() {
  // Evita disparar varios refresh em paralelo quando a aplicacao
  // faz mais de uma navegacao protegida ao mesmo tempo.
  if (restoreSessionRequest) {
    return restoreSessionRequest
  }

  restoreSessionRequest = (async () => {
    try {
      const { accessToken } = await refreshAccessToken()
      saveRefreshedAuthToken(accessToken)
      return true
    } catch {
      clearAuthToken()
      return false
    } finally {
      restoreSessionRequest = null
    }
  })()

  return restoreSessionRequest
}

router.beforeEach((to) => {
  const isAuthenticated = hasAuthToken()
  const canRestoreSession = hasAuthPersistence()

  if (to.meta.requiresAuth) {
    // Quando existe persistencia, revalidamos a sessao antes de liberar
    // a rota protegida para nao confiar em um access token antigo salvo no storage.
    if (canRestoreSession) {
      return tryRestoreSession().then((restored) => (restored ? true : { name: 'login' }))
    }

    return isAuthenticated ? true : { name: 'login' }
  }

  if (to.meta.guestOnly) {
    if (canRestoreSession) {
      // A tela publica tambem revalida a sessao persistida para evitar
      // redirecionar com base em um token salvo mas ja invalido.
      return tryRestoreSession().then((restored) => (restored ? { name: 'test' } : true))
    }

    // Quem ja esta autenticado sem sessao restauravel nao precisa
    // voltar para a tela de login.
    return isAuthenticated ? { name: 'test' } : true
  }

  return true
})

export default router
