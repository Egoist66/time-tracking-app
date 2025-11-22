<script setup lang="ts">
import { onMounted } from 'vue';
import { useProjectsStore } from '@/store/projects.store';
import WorkspaceSelector from '@/components/workspace/WorkspaceSelector.vue';
import ProjectsList from '@/components/projects/ProjectsList.vue';

const projectsStore = useProjectsStore();

onMounted(async () => {
  // Загружаем workspaces при входе на дашборд
  await projectsStore.fetchWorkspaces();
  
  // Загружаем ТОЛЬКО МОИ проекты (где я участвую) с проверкой project memberships
  if (projectsStore.currentWorkspaceGid) {
    await projectsStore.fetchUserProjects();
  }
});
</script>

<template>
  <div class="container mx-auto space-y-6">
    <!-- Workspace Selector (только мои проекты) -->
    <WorkspaceSelector :show-all-projects="false" />
    
    <!-- Projects List (мои проекты) -->
    <div class="space-y-4">
      <ProjectsList :show-all-projects="false" />
    </div>
  </div>
</template>
