<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Clock, Menu, Plus } from "lucide-vue-next";
import Timer from "@/components/timer/Timer.vue"

import { computed } from "vue";
import { useTimerStore } from "@/store/timer.store";
import { useProjectsStore } from "@/store/projects.store";
import Navigation from "./Navigation.vue";
import Profile from "../profile/Profile.vue";

const timerStore = useTimerStore();
const projectsStore = useProjectsStore();

// Не загружаем проекты здесь - они загружаются в Dashboard.vue или при инициализации auth
// onMounted убран, чтобы избежать дублирования запросов

// Преобразуем проекты из Asana в формат, ожидаемый компонентами
const sidebarProjects = computed(() => {
  // Берем первые 5 активных проектов для сайдбара
  return projectsStore.activeProjects.slice(0, 5).map(project => ({
    id: project.gid,
    name: project.name,
    color: project.color || 'bg-gray-500', // fallback цвет
  }));
});

// Все проекты для таймера и других компонентов
const allProjects = computed(() => {
  return projectsStore.activeProjects.map(project => ({
    id: project.gid,
    name: project.name,
    color: project.color || 'bg-gray-500',
  }));
});

const emit = defineEmits<{
  (e: "toggleSidebar"): void;
}>();

defineProps<{
  isOpen?: boolean;
}>();

</script>

<template>
  <aside
    :class="isOpen ? 'w-64' : 'w-0 overflow-hidden'"
    class="bg-gray-900 dark:bg-gray-950 text-white flex flex-col transition-all duration-300"
  >
    <div class="p-4 flex items-center gap-3">
      <div
        class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"
      >
        <Clock :size="20" />
      </div>
      <span
        @click="$router.push('/')"
        class="text-lg cursor-pointer font-semibold"
        >Hive</span
      >
      <Button
        @click="emit('toggleSidebar')"
        variant="ghost"
        size="icon-sm"
        class="ml-auto cursor-pointer text-gray-400 hover:text-black"
      >
        <Menu :size="20" />
      </Button>
    </div>

    <div class="px-4 mb-4">
      <Button
        @click="timerStore.toggleTimerDialog"
        class="w-full bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white"
      >
        <Plus :size="16" class="mr-2" />
        Запустить таймер
      </Button>
    </div>

    <Timer
      :is-timer-dialog-open="timerStore.isTimerDialogOpen"
      :projects="allProjects"
      @update:is-timer-dialog-open="timerStore.toggleTimerDialog"
      @start-timer="timerStore.startTimer"
    />

    <Navigation :projects="sidebarProjects" />
    <Profile @toggleSidebar="$emit('toggleSidebar')" />
   
  </aside>
</template>
