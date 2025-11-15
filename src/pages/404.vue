<script setup lang="ts">
import { RouterLink } from "vue-router";
</script>

<template>
  <div>
    <h1 class="text-6xl mb-10 text-center font-bold">404 <br/>Page Not Found</h1>
    <p class="text-center">The page you are looking for does not exist.</p>
    <RouterLink class="text-blue-500 hover:text-blue-600 text-center block" to="/">Go to home</RouterLink>
  </div>
</template>

<style scoped lang="scss">
.text-blue-500 {
  @apply text-blue-500 hover:text-blue-600;
}
</style>
