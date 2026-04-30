<script setup lang="ts">
import './TestView.css'

import { useRouter } from 'vue-router'

import { logout as logoutRequest } from '@/features/auth/auth.service'
import { clearAuthToken } from '@/features/auth/token-storage'

const router = useRouter()

async function logout() {
  try {
    await logoutRequest()
  } finally {
    // Mesmo se a API falhar, limpamos a sessao local para nao deixar
    // o frontend em um estado "logado" incorreto.
    clearAuthToken()
    await router.push({ name: 'login' })
  }
}
</script>

<template>
  <section class="test-view">
    <div class="container py-5">
      <div class="test-card">
        <span class="test-eyebrow">Tela de teste</span>
        <h1 class="test-title">Login realizado com sucesso.</h1>
        <p class="test-copy">
          O frontend autenticou na API e redirecionou para esta rota.
        </p>

        <button class="btn test-button" type="button" @click="logout">Sair</button>
      </div>
    </div>
  </section>
</template>
