<script setup lang="ts">
import Sidebar from "./Sidebar.vue";
import Header from "./Header.vue";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-vue-next";
import { shallowRef } from "vue";

const isSidebarOpen = shallowRef<boolean>(true);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<template>
  <div class="flex h-screen bg-gray-50 dark:bg-gray-900">
    <Sidebar :is-open="isSidebarOpen" @toggleSidebar="toggleSidebar" />

    <!-- Floating Toggle Button (visible when sidebar is closed) -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-x-2"
      enter-to-class="opacity-100 translate-x-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-x-0"
      leave-to-class="opacity-0 -translate-x-2"
    >
      <Button
        v-if="!isSidebarOpen"
        @click="toggleSidebar"
        variant="default"
        size="icon"
        class="fixed cursor-pointer left-4 top-1/2 -translate-y-1/2 z-50 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg rounded-lg"
      >
        <ChevronRight :size="20" />
      </Button>
    </Transition>

    <main class="flex-1 flex flex-col overflow-hidden">
      <Header />

      <section
        :class="
          $route.name === 'not-found'
            ? 'absolute inset-0 flex items-center w-full h-full bg-white justify-center'
            : ''
        "
        class="flex-1 overflow-y-auto p-6"
      >
        <slot />
      </section>
    </main>
  </div>
</template>
