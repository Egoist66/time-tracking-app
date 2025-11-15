<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  LayoutDashboard, 
  Clock, 
  FolderKanban, 
  FileBarChart, 
  Settings,
  Plus,
  Menu,
  type LucideIcon
} from 'lucide-vue-next'
import {shallowRef } from 'vue'

const projects = shallowRef([
  { id: 1, name: 'Website Redesign', color: 'bg-blue-500' },
  { id: 2, name: 'Mobile App', color: 'bg-purple-500' },
  { id: 3, name: 'Marketing Campaign', color: 'bg-green-500' },
  { id: 4, name: 'Client Meeting', color: 'bg-orange-500' }
])

const appLinks = shallowRef<{ icon: LucideIcon, to: string, label: string }[]>( [
  { icon: LayoutDashboard, to: '/dashboard', label: 'Dashboard' },
  { icon: Clock, to: '/time-entries', label: 'Time Entries' },
  { icon: FolderKanban, to: '/projects', label: 'Projects' },
  { icon: FileBarChart, to: '/reports', label: 'Reports' },
  { icon: Settings, to: '/settings', label: 'Settings' },
])

const emit = defineEmits<{
  (e: 'toggleSidebar'): void
}>()

defineProps<{
  isOpen?: boolean
}>()

</script>

<template>
  <aside :class="isOpen ? 'w-64' : 'w-0 overflow-hidden'" class="bg-gray-900 dark:bg-gray-950 text-white flex flex-col transition-all duration-300">
    <div class="p-4 flex items-center gap-3">
      <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
        <Clock :size="20" />
      </div>
      <span @click="$router.push('/')" class="text-lg cursor-pointer font-semibold">TimeTrack</span>
      <Button @click="emit('toggleSidebar')" variant="ghost" size="icon-sm" class="ml-auto cursor-pointer text-gray-400 hover:text-black">
        <Menu :size="20" />
      </Button>
    </div>

    <div class="px-4 mb-4">
      <Button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
        <Plus :size="16" class="mr-2" />
        Start Timer
      </Button>
    </div>

    <nav class="flex-1 px-2 space-y-1 overflow-y-auto">
      <template v-for="link in appLinks" :key="link.to">
        <RouterLink active-class="bg-gray-800 text-white" :to="link.to" class="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">
          <component :is="link.icon" :size="18" />
          {{ link.label }}
        </RouterLink>
      </template>
     
      <div class="pt-4">
        <Separator class="bg-gray-800 mb-4" />
        <div class="px-3 mb-2">
          <span class="text-xs font-semibold text-gray-500 uppercase">Projects</span>
        </div>
        <div class="space-y-1">
          <RouterLink
            v-for="project in projects"
            :key="project.id"
            :to="`/projects/${project.id}`"
            class="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <div :class="[project.color, 'w-2 h-2 rounded-full']" />
            {{ project.name }}
          </RouterLink>
        </div>
      </div>
    </nav>

    <!-- User Profile -->
    <div class="p-4 border-t border-gray-800">
      <div class="flex items-center gap-3">
        <Avatar class="w-8 h-8">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-white truncate">John Davis</p>
          <p class="text-xs text-gray-400 truncate">john@company.com</p>
        </div>
        <Button @click="emit('toggleSidebar')" variant="ghost" size="icon-sm" class="cursor-pointer text-gray-400 hover:text-black">
          <Menu :size="16" />
        </Button>
      </div>
    </div>
  </aside>
</template>

