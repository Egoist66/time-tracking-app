<script setup lang="ts">
import { RouterView } from "vue-router";
import AppLayout from "@/components/layout/AppLayout.vue";
import Loader from "@/components/ui/loader/Loader.vue";

// Страницы, которые не должны показывать layout
const noLayoutPages = ['login', 'auth-callback']
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <Suspense>
      <template #default>
        <AppLayout v-if="!noLayoutPages.includes(route.name as string)">
          <transition v-if="route.name !== 'not-found'" name="route" mode="out-in">
            <component :is="Component" />
          </transition>
          <component v-else :is="Component" />
        </AppLayout>
        
        <component v-else :is="Component" />
      </template>
      <template #fallback>
        <Loader />
      </template>
    </Suspense>
  </RouterView>
</template>

<style scoped></style>
