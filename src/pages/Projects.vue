<script setup lang="ts">
import { onMounted } from 'vue';
import { useProjectsStore } from '@/store/projects.store';
import WorkspaceSelector from '@/components/workspace/WorkspaceSelector.vue';
import ProjectsList from '@/components/projects/ProjectsList.vue';

const projectsStore = useProjectsStore();

onMounted(async () => {
  // Загружаем workspaces если их еще нет
  if (projectsStore.workspaces.length === 0) {
    await projectsStore.fetchWorkspaces();
  }
  
  // Загружаем ВСЕ проекты workspace при входе на страницу
  if (projectsStore.currentWorkspaceGid) {
    await projectsStore.fetchAllProjects();
  }
});
</script>

<template>
  <div class="container mx-auto py-6 px-4 space-y-6">
    <!-- Workspace Selector (все проекты) -->
    <WorkspaceSelector :show-all-projects="true" />
    
    <!-- Projects List (все проекты workspace без фильтрации по членству) -->
    <div class="space-y-4">
      <ProjectsList :show-all-projects="true" />
    </div>
  </div>
</template>

