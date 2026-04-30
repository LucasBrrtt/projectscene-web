<script setup lang="ts">
import './App.css'

import { RouterView } from 'vue-router'
</script>

<template>
  <!-- Shell visual global: mantem o fundo e o enquadramento
       consistentes enquanto as views trocam pelo RouterView. -->
  <div class="app-shell">
    <main class="content-shell">
      <RouterView />
    </main>
  </div>
</template>
