<script setup lang="ts">

import {
  LayoutDashboard,
  Clock,
  FolderKanban,
  FileBarChart,
  Settings,
  type LucideIcon,
} from "lucide-vue-next";
import Separator from "../ui/separator/Separator.vue";
import { shallowRef } from "vue";

const appLinks = shallowRef<{ icon: LucideIcon; to: string; label: string }[]>([
  { icon: LayoutDashboard, to: "/dashboard", label: "Дашборд" },
  { icon: Clock, to: "/time-entries", label: "Учет времени" },
  { icon: FolderKanban, to: "/projects", label: "Проекты" },
  { icon: FileBarChart, to: "/reports", label: "Отчеты" },
  { icon: Settings, to: "/settings", label: "Настройки" },
]);


defineProps<{
  projects: Array<{ id: number; name: string; color: string }>;
}>();

</script>

<template>
    <nav class="flex-1 px-2 space-y-1 overflow-y-auto">
        <template v-for="link in appLinks" :key="link.to">
          <RouterLink
            active-class="bg-gray-800 text-white"
            :to="link.to"
            class="flex items-center gap-3 px-3 py-2 text-sm rounded-md text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <component :is="link.icon" :size="18" />
            {{ link.label }}
          </RouterLink>
        </template>
  
        <div class="pt-4">
          <Separator class="bg-gray-800 mb-4" />
          <div class="px-3 mb-2">
            <span class="text-xs font-semibold text-gray-500 uppercase"
              >Проекты</span
            >
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
  
</template>

<style scoped>
</style>