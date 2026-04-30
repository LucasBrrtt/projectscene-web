import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { AuthError, login } from '@/features/auth/auth.service'
import { createLoginForm, type LoginForm } from '@/features/auth/login-form'
import { saveAuthToken } from '@/features/auth/token-storage'

export function useLoginForm() {
  const router = useRouter()
  const form = reactive<LoginForm>(createLoginForm())
  const isSubmitting = ref(false)
  const errorMessage = ref('')

  const isSubmitDisabled = computed(() => {
    // Impede envio com campos vazios e bloqueia duplo clique
    // enquanto a requisicao de login ainda esta em andamento.
    return !form.username.trim() || !form.password.trim() || isSubmitting.value
  })

  async function submit() {
    if (isSubmitDisabled.value) return null

    isSubmitting.value = true
    errorMessage.value = ''

    try {
      // Criamos um payload novo para nao depender diretamente do objeto reativo,
      // o que deixa mais claro o que realmente vai para a API.
      const payload: LoginForm = {
        username: form.username.trim(),
        password: form.password,
        rememberMe: form.rememberMe,
      }

      const { accessToken } = await login(payload)
      saveAuthToken(accessToken, payload.rememberMe)

      // A navegacao so acontece depois que o token ja foi salvo,
      // assim o guarda de rotas encontra a sessao pronta.
      await router.push({ name: 'test' })

      return payload
    } catch (error) {
      errorMessage.value =
        error instanceof AuthError ? error.message : 'Falha ao conectar com o servidor.'
      return null
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    form,
    isSubmitting,
    isSubmitDisabled,
    errorMessage,
    submit,
  }
}
