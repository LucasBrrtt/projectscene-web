<script setup lang="ts">
import './LoginFormCard.css'

import BaseTextField from '@/components/BaseTextField.vue'

defineProps<{
  username: string
  password: string
  rememberMe: boolean
  isSubmitting: boolean
  isSubmitDisabled: boolean
  errorMessage: string
  statusMessage?: string
}>()

const emit = defineEmits<{
  'update:username': [value: string]
  'update:password': [value: string]
  'update:rememberMe': [value: boolean]
  submit: []
}>()
</script>

<template>
  <!-- Componente puramente visual: recebe estado pronto da view
       e apenas redispara eventos de interacao para o container. -->
  <section class="card shadow-sm border-0 rounded-4 login-card">
    <div class="card-body p-4 p-md-5">
      <div class="text-center mb-4">
        <h1 class="h3 fw-bold mb-2 login-title">Entrar</h1>
        <p class="mb-0 login-copy">Acesse sua conta para continuar.</p>
      </div>

      <p v-if="statusMessage" class="mb-3 form-status" role="status">{{ statusMessage }}</p>

      <form class="d-grid gap-3" @submit.prevent="emit('submit')">
        <BaseTextField
          id="username"
          :model-value="username"
          label="Usuario"
          autocomplete="username"
          placeholder="Digite seu usuario"
          @update:model-value="emit('update:username', $event)"
        />

        <BaseTextField
          id="password"
          :model-value="password"
          label="Senha"
          type="password"
          autocomplete="current-password"
          placeholder="Digite sua senha"
          @update:model-value="emit('update:password', $event)"
        />

        <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 small">
          <label class="m-0 remember-toggle">
            <input
              class="form-check-input"
              type="checkbox"
              :checked="rememberMe"
              @change="emit('update:rememberMe', ($event.target as HTMLInputElement).checked)"
            />
            <span class="ms-1 remember-toggle__label">Manter conectado</span>
          </label>

          <button class="btn btn-link p-0 align-self-start text-decoration-none forgot-link" type="button">
            Esqueci minha senha
          </button>
        </div>

        <p v-if="errorMessage" class="mb-0 form-error" role="alert">{{ errorMessage }}</p>

        <button
          class="btn btn-lg fw-semibold submit-button"
          type="submit"
          :disabled="isSubmitDisabled"
        >
          {{ isSubmitting ? 'Preparando acesso...' : 'Entrar' }}
        </button>
      </form>
    </div>

    <div class="card-footer bg-transparent border-0 pt-0 pb-4 px-4 px-md-5 text-center">
      <small class="form-footer">Seu acesso em um painel simples e direto.</small>
    </div>
  </section>
</template>
