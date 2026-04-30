<script setup lang="ts">
import './LoginView.css'

import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useLoginForm } from '@/features/auth/useLoginForm'
import LoginFormCard from '@/components/LoginFormCard/LoginFormCard.vue'

const route = useRoute()
const { form, isSubmitting, isSubmitDisabled, errorMessage, submit } = useLoginForm()

const statusMessage = computed(() => {
  // A tela de login reaproveita o motivo vindo da rota para mostrar
  // um retorno mais claro depois de expiracao ou falta de permissao.
  if (route.query.reason === 'expired') {
    return 'Sua sessao expirou. Entre novamente para continuar.'
  }

  if (route.query.reason === 'forbidden') {
    return 'Seu acesso atual nao permite abrir essa tela.'
  }

  return ''
})

async function handleSubmit() {
  // A view so orquestra o submit; a logica de autenticacao fica no composable.
  await submit()
}
</script>

<template>
  <section class="login-view">
    <div class="container py-4 py-md-5">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-11 col-md-9 col-lg-6 col-xl-5">
          <LoginFormCard
            :username="form.username"
            :password="form.password"
            :remember-me="form.rememberMe"
            :is-submitting="isSubmitting"
            :is-submit-disabled="isSubmitDisabled"
            :error-message="errorMessage"
            :status-message="statusMessage"
            @update:username="form.username = $event"
            @update:password="form.password = $event"
            @update:remember-me="form.rememberMe = $event"
            @submit="handleSubmit"
          />
        </div>
      </div>
    </div>
  </section>
</template>
