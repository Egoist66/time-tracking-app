<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useProjectsStore } from '@/store/projects.store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Briefcase, RefreshCw } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

const props = defineProps<{
  showAllProjects?: boolean; // true = все проекты workspace, false = только мои
}>();

const projectsStore = useProjectsStore();

onMounted(async () => {
  // Загружаем workspaces при монтировании
  if (projectsStore.workspaces.length === 0) {
    await projectsStore.fetchWorkspaces();
  }
});

const handleWorkspaceChange = async (value: any) => {
  if (!value || typeof value === 'object') return;
  
  const workspaceGid = String(value);
  projectsStore.setWorkspace(workspaceGid);
  
  // Загружаем проекты для нового workspace
  if (props.showAllProjects) {
    await projectsStore.fetchAllProjects({ workspace: workspaceGid });
  } else {
    await projectsStore.fetchUserProjects({ workspace: workspaceGid });
  }
};

const handleRefresh = async () => {
  await projectsStore.fetchWorkspaces();
};

const currentWorkspace = computed(() => {
  return projectsStore.workspaces.find(
    w => w.gid === projectsStore.currentWorkspaceGid
  );
});
</script>

<template>
  <Card>
    <CardHeader>
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
            <Briefcase :size="20" class="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>Выберите workspace для отображения проектов</CardDescription>
          </div>
        </div>
        <Button 
          @click="handleRefresh" 
          variant="ghost" 
          size="icon-sm"
          :disabled="projectsStore.loading"
        >
          <RefreshCw :size="16" :class="{ 'animate-spin': projectsStore.loading }" />
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <!-- Workspace Selector -->
        <div class="space-y-2">
          <label class="text-sm font-medium leading-none">
            Активный workspace
          </label>
          <Select 
            :model-value="projectsStore.currentWorkspaceGid || undefined"
            @update:model-value="handleWorkspaceChange"
          >
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Выберите workspace" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="workspace in projectsStore.workspaces"
                :key="workspace.gid"
                :value="workspace.gid"
              >
                <div class="flex items-center gap-2">
                  <Briefcase :size="14" />
                  {{ workspace.name }}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Current Workspace Info -->
        <div v-if="currentWorkspace" class="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary">
            {{ projectsStore.projectsCount }} {{ projectsStore.projectsCount === 1 ? 'проект' : 'проектов' }}
          </Badge>
          <span>в workspace "{{ currentWorkspace.name }}"</span>
        </div>

        <!-- Empty State -->
        <div v-if="projectsStore.workspaces.length === 0 && !projectsStore.loading" 
             class="text-sm text-muted-foreground">
          Не найдено доступных workspace'ов
        </div>
      </div>
    </CardContent>
  </Card>
</template>

