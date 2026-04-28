<script setup lang="ts">
import BaseTextField from '@/components/BaseTextField.vue'

defineProps<{
  email: string
  password: string
  rememberMe: boolean
  isSubmitting: boolean
  isSubmitDisabled: boolean
}>()

const emit = defineEmits<{
  'update:email': [value: string]
  'update:password': [value: string]
  'update:rememberMe': [value: boolean]
  submit: []
}>()
</script>

<template>
  <section class="card shadow-sm border-0 rounded-4 login-card">
    <div class="card-body p-4 p-md-5">
      <div class="text-center mb-4">
        <h1 class="h3 fw-bold mb-2 login-title">Entrar</h1>
        <p class="mb-0 login-copy">Acesse sua conta para continuar.</p>
      </div>

      <form class="d-grid gap-3" @submit.prevent="emit('submit')">
        <BaseTextField
          id="email"
          :model-value="email"
          label="Email"
          type="email"
          autocomplete="email"
          placeholder="voce@empresa.com"
          @update:model-value="emit('update:email', $event)"
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
          <label class="form-check m-0 text-muted">
            <input
              class="form-check-input"
              type="checkbox"
              :checked="rememberMe"
              @change="emit('update:rememberMe', ($event.target as HTMLInputElement).checked)"
            />
            <span class="ms-1">Manter conectado</span>
          </label>

          <button class="btn btn-link p-0 align-self-start text-decoration-none forgot-link" type="button">
            Esqueci minha senha
          </button>
        </div>

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

<style scoped>
.login-card {
  background: linear-gradient(180deg, rgba(24, 33, 38, 0.96), rgba(18, 25, 28, 0.98));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: var(--color-shadow);
}

.login-title {
  color: var(--color-text);
}

.login-copy,
.form-footer {
  color: var(--color-text-muted);
}

.form-control,
.btn,
.form-check-input {
  box-shadow: none !important;
}

.form-control {
  border-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.9rem;
  background-color: rgba(255, 255, 255, 0.03);
  color: var(--color-text);
  padding-top: 0.85rem;
  padding-bottom: 0.85rem;
}

.form-control::placeholder {
  color: rgba(237, 246, 246, 0.38);
}

.form-control:focus {
  border-color: var(--color-accent);
  background-color: rgba(255, 255, 255, 0.05);
  color: var(--color-text);
}

.forgot-link {
  color: var(--color-accent);
}

.submit-button {
  border: 1px solid transparent;
  border-radius: 0.9rem;
  background-color: var(--color-accent);
  color: #061415;
}

.submit-button:hover,
.submit-button:focus-visible {
  background-color: var(--color-accent-strong);
  color: #061415;
}

.submit-button:disabled {
  background-color: rgba(0, 183, 181, 0.35);
  color: rgba(6, 20, 21, 0.65);
}

.form-check {
  color: var(--color-text-muted);
}

.form-check-input {
  border-color: rgba(255, 255, 255, 0.2);
  background-color: transparent;
}

.form-check-input:checked {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
}

.form-check-input:focus {
  border-color: var(--color-accent);
}

.form-label {
  color: var(--color-text);
}
</style>
