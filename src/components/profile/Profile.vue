<script setup lang="ts">
import { computed } from 'vue'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-vue-next"
import { useAuthStore } from '@/store/auth.store'

const authStore = useAuthStore()

const emit = defineEmits<{
    (e: 'toggleSidebar'): void
}>()

const userInitials = computed(() => {
  if (!authStore.user?.name) return 'U'
  return authStore.user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})
</script>

<template>
    <div class="p-4 border-t border-gray-800">
        <div class="flex items-center gap-3">
          <Avatar class="w-8 h-8">
            <AvatarImage 
              v-if="authStore.user?.photo?.image_60x60" 
              :src="authStore.user.photo.image_60x60" 
              :alt="authStore.user?.name || 'User'" 
            />
            <AvatarFallback class="bg-[#5B52FF] text-white">
              {{ userInitials }}
            </AvatarFallback>
          </Avatar>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-white truncate">
              {{ authStore.user?.name || 'Загрузка...' }}
            </p>
            <p class="text-xs text-gray-400 truncate">
              {{ authStore.user?.email || '' }}
            </p>
          </div>
          <Button
            @click="emit('toggleSidebar')"
            variant="ghost"
            size="icon-sm"
            class="cursor-pointer text-gray-400 hover:text-white"
          >
            <Menu :size="16" />
          </Button>
        </div>
      </div>
</template>