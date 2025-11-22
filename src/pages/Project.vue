<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProjectsStore } from '@/store/projects.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageLoader } from '@/components/ui/loader';
import type { AsanaProject } from '@/api/types/projects.type';

const route = useRoute();
const router = useRouter();
const projectsStore = useProjectsStore();

const project = ref<AsanaProject | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const projectId = computed(() => route.params.id as string);

onMounted(async () => {
  loading.value = true;
  error.value = null;

  try {
    // Сначала проверяем, есть ли проект в store
    const cachedProject = projectsStore.getProjectById(projectId.value);
    
    if (cachedProject) {
      project.value = cachedProject;
      // Все равно загружаем свежие данные в фоне
      projectsStore.fetchProjectDetails(projectId.value).then((freshProject) => {
        if (freshProject) {
          project.value = freshProject;
        }
      });
      loading.value = false;
    } else {
      // Загружаем проект с сервера
      const loadedProject = await projectsStore.fetchProjectDetails(projectId.value);
      if (loadedProject) {
        project.value = loadedProject;
      } else {
        error.value = 'Проект не найден';
      }
      loading.value = false;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Ошибка загрузки проекта';
    loading.value = false;
  }
});

const handleBack = () => {
  router.push({ name: 'projects' });
};

const openInAsana = () => {
  if (project.value?.permalink_url) {
    window.open(project.value.permalink_url, '_blank');
  }
};
</script>

<template>
  <div class="container mx-auto py-6 px-4">
    <!-- Loading state -->
    <PageLoader v-if="loading" />

    <!-- Error state -->
    <Card v-else-if="error">
      <CardHeader>
        <CardTitle>Ошибка</CardTitle>
        <CardDescription>{{ error }}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button @click="handleBack" variant="outline">
          Вернуться к списку проектов
        </Button>
      </CardContent>
    </Card>

    <!-- Project details -->
    <div v-else-if="project" class="space-y-6">
      <!-- Header -->
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-2">
          <Button @click="handleBack" variant="ghost" size="sm" class="mb-2">
            ← Назад к проектам
          </Button>
          <div class="flex items-center gap-3">
            <h1 class="text-3xl font-bold tracking-tight">{{ project.name }}</h1>
            <Badge v-if="project.archived" variant="secondary">Архивный</Badge>
            <Badge 
              v-if="project.color" 
              :style="{ backgroundColor: project.color }"
            >
              {{ project.color }}
            </Badge>
          </div>
        </div>
        <Button @click="openInAsana" variant="outline">
          Открыть в Asana
        </Button>
      </div>

      <Separator />

      <!-- Project info -->
      <div class="grid gap-6 md:grid-cols-2">
        <!-- Main info -->
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-if="project.owner">
              <p class="text-sm font-medium text-muted-foreground">Владелец</p>
              <p class="text-base">{{ project.owner.name }}</p>
            </div>

            <div v-if="project.workspace">
              <p class="text-sm font-medium text-muted-foreground">Workspace</p>
              <p class="text-base">{{ project.workspace.name }}</p>
            </div>

            <div v-if="project.due_date || project.due_on">
              <p class="text-sm font-medium text-muted-foreground">Дедлайн</p>
              <p class="text-base">
                {{ new Date(project.due_date || project.due_on!).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) }}
              </p>
            </div>

            <div>
              <p class="text-sm font-medium text-muted-foreground">Доступ</p>
              <p class="text-base">{{ project.public ? 'Публичный' : 'Приватный' }}</p>
            </div>

            <div>
              <p class="text-sm font-medium text-muted-foreground">Создан</p>
              <p class="text-base">
                {{ new Date(project.created_at).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) }}
              </p>
            </div>

            <div>
              <p class="text-sm font-medium text-muted-foreground">Последнее изменение</p>
              <p class="text-base">
                {{ new Date(project.modified_at).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) }}
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Status and Notes -->
        <div class="space-y-6">
          <!-- Current Status -->
          <Card v-if="project.current_status">
            <CardHeader>
              <CardTitle>Текущий статус</CardTitle>
            </CardHeader>
            <CardContent>
              <div class="flex items-start gap-3">
                <div 
                  v-if="project.current_status.color"
                  class="w-3 h-3 rounded-full mt-1"
                  :style="{ backgroundColor: project.current_status.color }"
                />
                <p class="text-base">{{ project.current_status.text }}</p>
              </div>
            </CardContent>
          </Card>

          <!-- Notes -->
          <Card v-if="project.notes">
            <CardHeader>
              <CardTitle>Описание</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-base whitespace-pre-wrap">{{ project.notes }}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>
