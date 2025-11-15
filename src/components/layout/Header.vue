<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Search, Bell, LogOut } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'

const router = useRouter()
const authStore = useAuthStore()

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

const userInitials = computed(() => {
  if (!authStore.user?.name) return 'U'
  return authStore.user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const handleLogout = () => {
  authStore.logout()
  router.push({ name: 'login' })
}
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

      <!-- Search, Notifications and User -->
      <div class="flex items-center gap-4">
        <!-- Search -->
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="18" />
          <Input
            type="search"
            placeholder="Поиск..."
            class="pl-10 w-64 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          />
        </div>

        <!-- User Avatar and Logout -->
        <div v-if="authStore.user" class="flex items-center gap-2 pl-3 border-l border-gray-200 dark:border-gray-700">
          <Avatar class="w-8 h-8 cursor-pointer">
            <AvatarImage 
              v-if="authStore.user.photo?.image_60x60" 
              :src="authStore.user.photo.image_60x60" 
              :alt="authStore.user.name" 
            />
            <AvatarFallback class="bg-primary text-primary-foreground text-xs">
              {{ userInitials }}
            </AvatarFallback>
          </Avatar>
          
          <!-- Logout Button -->
          <Button 
            variant="ghost" 
            size="icon" 
            class="text-gray-500 hover:text-red-600 dark:hover:text-red-400"
            @click="handleLogout"
            title="Выйти"
          >
            <LogOut :size="18" />
          </Button>
        </div>
      </div>
    </div>
  </header>
</template>

