<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app-layout">
    <RouterView v-slot="{ Component }">
      <transition name="route" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </div>
</template>

<style scoped>

</style>
