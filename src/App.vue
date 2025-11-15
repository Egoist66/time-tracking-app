<script setup lang="ts">
import { RouterView } from "vue-router";
import AppLayout from "@/components/layout/AppLayout.vue";
import Loader from "@/components/ui/loader/Loader.vue";

</script>

<template>
  <AppLayout>
    <RouterView v-slot="{ Component, route }">
      <Suspense>
        <template v-if="route.name !== 'not-found'" #default>
          <transition name="route" mode="out-in">
            <component :is="Component" />
          </transition>
        </template>
        <template v-else #default>
          <component :is="Component" />
        </template>
        <template #fallback>
          <Loader />
        </template>
      </Suspense>
    </RouterView>
  </AppLayout>
</template>

<style scoped></style>
