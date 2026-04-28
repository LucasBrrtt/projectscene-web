<script setup lang="ts">
const model = defineModel<string>({ required: true })

defineProps<{
  id: string
  label: string
  type?: string
  placeholder?: string
  autocomplete?: string
}>()
</script>

<template>
  <div>
    <label class="form-label fw-semibold" :for="id">{{ label }}</label>
    <input
      :id="id"
      v-model="model"
      class="form-control form-control-lg"
      :type="type || 'text'"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
    />
  </div>
</template>
