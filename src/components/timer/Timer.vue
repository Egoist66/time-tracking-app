<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Clock } from "lucide-vue-next";
import { useTimerStore } from "@/store/timer.store";

const {
  isTimerDialogOpen,
  projects,
} = defineProps<{
  isTimerDialogOpen: boolean;   
  projects: any[];
}>();

const timerStore = useTimerStore()
</script>

<template>
  <Dialog
  
    :open="isTimerDialogOpen"
    @update:open="$emit('update:isTimerDialogOpen', $event)"
  >
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Time Entry</DialogTitle>
        <DialogDescription>
          Start tracking your time for a new task
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- Task Name -->
        <div class="space-y-2">
          <label class="text-sm font-medium leading-none" for="task-name">
            What are you working on?
          </label>
          <Input
            id="task-name"
            v-model="timerStore.timerTaskName"
            placeholder="Enter task name..."
            class="w-full"
          />
        </div>

        <!-- Project Selection -->
        <div class="space-y-2">
          <label class="text-sm font-medium leading-none" for="project">
            Project
          </label>
          <Select v-model="timerStore.timerProject">
            <SelectTrigger id="project" class="w-full">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="project in projects"
                :key="project.id"
                :value="project.id.toString()"
              >
                <div class="flex items-center gap-2">
                  <div :class="[project.color, 'w-2 h-2 rounded-full']" />
                  {{ project.name }}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Description (Optional) -->
        <div class="space-y-2">
          <label class="text-sm font-medium leading-none" for="description">
            Description <span class="text-gray-400">(optional)</span>
          </label>
          <Input
            id="description"
            v-model="timerStore.timerDescription"
            placeholder="Add details..."
            class="w-full"
          />
        </div>

        <!-- Timer Display -->
        <div class="flex items-center justify-center py-2">
          <div
            class="text-3xl font-mono font-bold text-gray-600 dark:text-gray-400"
          >
            00:00:00
          </div>
        </div>
      </div>

      <DialogFooter class="gap-5 sm:gap-5">
        <Button
          type="button"
          variant="outline"
          class="cursor-pointer"
          @click="$emit('update:isTimerDialogOpen', false)"
        >
          Cancel
        </Button>
        <Button
          type="button"
          class="cursor-pointer bg-indigo-600 hover:bg-indigo-700"
          @click="$emit('startTimer')"
        >
          <Clock :size="16" class="mr-2" />
          Start Timer
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
