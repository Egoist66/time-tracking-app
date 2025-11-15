<script setup lang="ts">
import { Button } from "@/components/ui/button";
import ModalDialog from "@/components/ui/dialog/ModalDialog.vue";
</script>

<template>
  <section class="p-8">
    <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

    <div class="flex gap-4">
      <Button @click="console.log('click')">Click me</Button>

      <ModalDialog
        title="Добавить задачу"
        description="Создайте новую задачу для отслеживания времени"
      />
    </div>
  </section>
</template>
