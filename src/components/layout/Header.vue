<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Bell } from 'lucide-vue-next'
import { computed } from 'vue'

const currentDate = computed(() => {
  const date = new Date()
  return date.toLocaleString(navigator.language, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})
</script>

<template>
  <header class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Title and Date -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ $route.meta.title || 'Dashboard' }}
        </h1>
        <p class="text-sm text-gray-500 dark:text-gray-400">{{ currentDate }}</p>
      </div>

      <!-- Search and Notifications -->
      <div class="flex items-center gap-4">
        <!-- Search -->
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
          <Input
            type="search"
            placeholder="Search..."
            class="pl-10 w-64 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          />
        </div>

        <!-- Notifications -->
        <Button variant="ghost" size="icon" class="relative">
          <Bell :size="20" />
          <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
      </div>
    </div>
  </header>
</template>

