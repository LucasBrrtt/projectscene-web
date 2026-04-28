import { computed, reactive, ref } from 'vue'

import { login } from '../services/auth.service'
import { createLoginForm, type LoginForm } from '../types/login-form'

export function useLoginForm() {
  const form = reactive<LoginForm>(createLoginForm())
  const isSubmitting = ref(false)

  const isSubmitDisabled = computed(() => {
    return !form.email.trim() || !form.password.trim() || isSubmitting.value
  })

  async function submit() {
    if (isSubmitDisabled.value) return null

    isSubmitting.value = true

    try {
      const payload: LoginForm = {
        email: form.email.trim(),
        password: form.password,
        rememberMe: form.rememberMe,
      }

      await login(payload)

      return payload
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    form,
    isSubmitting,
    isSubmitDisabled,
    submit,
  }
}
