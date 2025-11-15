<script setup lang="ts">
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'

defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <!-- Dialog Example -->
  <Dialog>
    <DialogTrigger as-child>
      <Button variant="outline">Open Dialog</Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ title || 'Добавить задачу' }}</DialogTitle>
        <DialogDescription>
          {{ description || 'Создайте новую задачу для отслеживания времени' }}
        </DialogDescription>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-4 items-center gap-4">
          <label for="name" class="text-right text-sm font-medium">
            Название
          </label>
          <input
            id="name"
            class="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Название задачи"
          />
        </div>
        <div class="grid grid-cols-4 items-center gap-4">
          <label for="description" class="text-right text-sm font-medium">
            Описание
          </label>
          <textarea
            id="description"
            class="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Описание задачи"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit">Сохранить</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
