<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useProjectsStore } from '@/store/projects.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader } from '@/components/ui/loader';

const props = defineProps<{
  showAllProjects?: boolean; // true = все проекты workspace, false = только мои (по умолчанию)
}>();

const router = useRouter();
const projectsStore = useProjectsStore();

const handleProjectClick = (projectGid: string) => {
  router.push({ name: 'project', params: { id: projectGid } });
};

const handleLoadMore = () => {
  projectsStore.loadMoreProjects();
};

const handleRefresh = () => {
  // Загружаем проекты в зависимости от контекста
  if (props.showAllProjects) {
    projectsStore.fetchAllProjects();
  } else {
    projectsStore.fetchUserProjects();
  }
};
</script>

<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 v-if="!showAllProjects" class="text-2xl font-bold tracking-tight">Мои проекты</h2>
        <p class="text-muted-foreground">
          {{ projectsStore.projectsCount }} {{ projectsStore.projectsCount === 1 ? 'проект' : 'проектов' }}
        </p>
      </div>
      <Button 
        @click="handleRefresh" 
        :disabled="projectsStore.loading"
        variant="outline"
      >
        Обновить
      </Button>
    </div>

    <!-- Loading state -->
    <div 
      v-if="projectsStore.loading && projectsStore.projects.length === 0" 
      class="flex items-center justify-center min-h-[400px]"
    >
      <Loader />
    </div>

    <!-- Error state -->
    <Card v-else-if="projectsStore.error" variant="destructive">
      <CardHeader>
        <CardTitle>Ошибка</CardTitle>
        <CardDescription>{{ projectsStore.error }}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button @click="handleRefresh" variant="outline">
          Попробовать снова
        </Button>
      </CardContent>
    </Card>

    <!-- Projects list -->
    <div v-else-if="projectsStore.activeProjects.length > 0" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card 
        v-for="project in projectsStore.activeProjects" 
        :key="project.gid"
        class="hover:shadow-lg transition-shadow cursor-pointer"
        @click="handleProjectClick(project.gid)"
      >
        <CardHeader>
          <div class="flex items-start justify-between gap-2">
            <CardTitle class="line-clamp-2">{{ project.name }}</CardTitle>
            <Badge 
              v-if="project.color" 
              :style="{ backgroundColor: project.color }"
              class="shrink-0"
            >
              {{ project.color }}
            </Badge>
          </div>
          <CardDescription v-if="project.owner">
            Владелец: {{ project.owner.name }}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-2 text-sm">
            <div v-if="project.due_date" class="flex items-center gap-2">
              <span class="text-muted-foreground">Дедлайн:</span>
              <span>{{ new Date(project.due_date).toLocaleDateString() }}</span>
            </div>
            <div v-if="project.workspace" class="flex items-center gap-2">
              <span class="text-muted-foreground">Workspace:</span>
              <span>{{ project.workspace.name }}</span>
            </div>
            <div v-if="project.notes" class="text-muted-foreground line-clamp-3">
              {{ project.notes }}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Empty state -->
    <Card v-else>
      <CardHeader>
        <CardTitle>Нет проектов</CardTitle>
        <CardDescription>
          У вас пока нет активных проектов в Asana
        </CardDescription>
      </CardHeader>
    </Card>

    <!-- Load more button -->
    <div 
      v-if="projectsStore.nextPageOffset && !projectsStore.loading" 
      class="flex justify-center"
    >
      <Button @click="handleLoadMore" variant="outline">
        Загрузить еще
      </Button>
    </div>

    <!-- Loading more indicator -->
    <div 
      v-if="projectsStore.loading && projectsStore.projects.length > 0" 
      class="flex justify-center py-4"
    >
      <Loader />
    </div>
  </div>
</template>

