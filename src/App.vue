<script setup lang="ts">
import { RouterView } from "vue-router";
import { onMounted } from "vue";
import AppLayout from "@/components/layout/AppLayout.vue";
import Loader from "@/components/ui/loader/Loader.vue";
import { PageLoader } from "@/components/ui/loader";
import { useAuthStore } from "@/store/auth.store";

// Страницы, которые не должны показывать layout
const noLayoutPages = ['login', 'auth-callback']

// Инициализация авторизации
const authStore = useAuthStore();

onMounted(async () => {
  await authStore.initializeAuth();
});
</script>

<template>
  <!-- Прелоадер при инициализации авторизации -->
  <PageLoader 
    v-if="authStore.isInitializing" 
    message="Инициализация..." 
  />
  
  <!-- Основное приложение -->
  <RouterView v-else v-slot="{ Component, route }">
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
