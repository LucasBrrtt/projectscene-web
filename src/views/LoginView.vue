<script setup lang="ts">
import LoginFormCard from '../components/LoginFormCard.vue'
import { useLoginForm } from '../composables/useLoginForm'

const { form, isSubmitting, isSubmitDisabled, submit } = useLoginForm()

async function handleSubmit() {
  await submit()
}
</script>

<template>
  <section class="login-view">
    <div class="container py-4 py-md-5">
      <div class="row justify-content-center">
        <div class="col-12 col-sm-11 col-md-9 col-lg-6 col-xl-5">
          <LoginFormCard
            :email="form.email"
            :password="form.password"
            :remember-me="form.rememberMe"
            :is-submitting="isSubmitting"
            :is-submit-disabled="isSubmitDisabled"
            @update:email="form.email = $event"
            @update:password="form.password = $event"
            @update:remember-me="form.rememberMe = $event"
            @submit="handleSubmit"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.login-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
