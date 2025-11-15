<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Clock, Menu, Plus } from "lucide-vue-next";
import Timer from "@/components/timer/Timer.vue"

import { shallowRef } from "vue";
import { useTimerStore } from "@/store/timer.store";
import Navigation from "./Navigation.vue";
import Profile from "../profile/Profile.vue";

const projects = shallowRef([
  { id: 1, name: "Website Redesign", color: "bg-blue-500" },
  { id: 2, name: "Mobile App", color: "bg-purple-500" },
  { id: 3, name: "Marketing Campaign", color: "bg-green-500" },
  { id: 4, name: "Client Meeting", color: "bg-orange-500" },
]);


const emit = defineEmits<{
  (e: "toggleSidebar"): void;
}>();

defineProps<{
  isOpen?: boolean;
}>();


const timerStore = useTimerStore()

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
        Start Timer
      </Button>
    </div>

    <Timer
      :is-timer-dialog-open="timerStore.isTimerDialogOpen"
      :projects="projects"
      @update:is-timer-dialog-open="timerStore.toggleTimerDialog"
      @start-timer="timerStore.startTimer"
    />

    <Navigation :projects="projects" />
    <Profile @toggleSidebar="$emit('toggleSidebar')" />
   
  </aside>
</template>
