import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { AsanaProjects } from "@/api/service/AsanaProjects";
import { useAuthStore } from "./auth.store";
import type { AsanaProject, AsanaWorkspace } from "@/api/types/projects.type";

const WORKSPACE_STORAGE_KEY = "selected_workspace_gid";

export const useProjectsStore = defineStore("projects", () => {
  // State
  const projects = ref<AsanaProject[]>([]);
  const workspaces = ref<AsanaWorkspace[]>([]);
  const currentWorkspaceGid = ref<string | null>(
    localStorage.getItem(WORKSPACE_STORAGE_KEY)
  );
  const loading = ref(false);
  const error = ref<string | null>(null);
  const nextPageOffset = ref<string | null>(null);
  // Флаг для отслеживания типа загружаемых проектов (true = все проекты, false = только мои)
  const isLoadingAllProjects = ref(false);

  // Getters
  const activeProjects = computed(() =>
    projects.value.filter((p) => !p.archived)
  );

  const archivedProjects = computed(() =>
    projects.value.filter((p) => p.archived)
  );

  const projectsCount = computed(() => projects.value.length);

  // Actions
  async function fetchWorkspaces() {
    const authStore = useAuthStore();

    if (!authStore.accessToken) {
      error.value = "Отсутствует токен авторизации";
      return;
    }

    try {
      const response = await AsanaProjects.fetchUserWorkspaces(
        authStore.accessToken
      );
      workspaces.value = response.data;

      // Проверяем, существует ли сохраненный workspace
      if (currentWorkspaceGid.value) {
        const savedWorkspaceExists = workspaces.value.some(
          w => w.gid === currentWorkspaceGid.value
        );
        
        // Если сохраненный workspace не найден, выбираем первый
        if (!savedWorkspaceExists && workspaces.value.length > 0 && workspaces.value[0]) {
          currentWorkspaceGid.value = workspaces.value[0].gid;
          localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaces.value[0].gid);
        }
      } else {
        // Если workspace не выбран, автоматически выбираем первый
        if (workspaces.value.length > 0 && workspaces.value[0]) {
          currentWorkspaceGid.value = workspaces.value[0].gid;
          localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaces.value[0].gid);
        }
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Ошибка загрузки workspace'ов";
      console.error("Failed to fetch workspaces:", err);
    }
  }

  /**
   * Загрузить ТОЛЬКО МОИ проекты (где я являюсь участником)
   * Использовать для Dashboard
   */
  async function fetchUserProjects(options?: {
    workspace?: string;
    archived?: boolean;
    limit?: number;
  }) {
    const authStore = useAuthStore();

    if (!authStore.accessToken) {
      error.value = "Отсутствует токен авторизации";
      return;
    }

    if (!authStore.user?.gid) {
      error.value = "Отсутствует информация о пользователе";
      return;
    }

    // Если workspace не указан, сначала загружаем workspaces
    if (!options?.workspace && !currentWorkspaceGid.value) {
      await fetchWorkspaces();
    }

    const workspaceGid = options?.workspace || currentWorkspaceGid.value;

    if (!workspaceGid) {
      error.value = "Не удалось определить workspace";
      return;
    }

    loading.value = true;
    error.value = null;
    isLoadingAllProjects.value = false; // Загружаем только мои проекты

    try {
      // Используем метод для загрузки ВСЕХ проектов с проверкой членства (автоматическая пагинация)
      // Это загрузит все проекты воркспейса и проверит членство для каждого
      const allMyProjects = await AsanaProjects.fetchAllMyProjectsWithMembership(
        authStore.accessToken,
        authStore.user.gid,
        {
          workspace: workspaceGid,
          archived: options?.archived ?? false, // по умолчанию только активные проекты
          ...options,
        }
      );

      projects.value = allMyProjects;
      // После загрузки всех проектов пагинация больше не нужна
      nextPageOffset.value = null;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Ошибка загрузки проектов";
      console.error("Failed to fetch projects:", err);
    } finally {
      loading.value = false;
    }
  }

  /**
   * Загрузить ВСЕ проекты workspace (не только мои)
   * Используется на странице Projects
   */
  async function fetchAllProjects(options?: {
    workspace?: string;
    archived?: boolean;
    limit?: number;
  }) {
    const authStore = useAuthStore();

    if (!authStore.accessToken) {
      error.value = "Отсутствует токен авторизации";
      return;
    }

    // Если workspace не указан, сначала загружаем workspaces
    if (!options?.workspace && !currentWorkspaceGid.value) {
      await fetchWorkspaces();
    }

    const workspaceGid = options?.workspace || currentWorkspaceGid.value;

    if (!workspaceGid) {
      error.value = "Не удалось определить workspace";
      return;
    }

    loading.value = true;
    error.value = null;
    isLoadingAllProjects.value = true; // Загружаем все проекты

    try {
      // Используем метод для загрузки ВСЕХ проектов workspace с автоматической пагинацией
      const allProjects = await AsanaProjects.fetchAllWorkspaceProjectsPaginated(
        authStore.accessToken,
        {
          workspace: workspaceGid,
          archived: options?.archived ?? false, // по умолчанию только активные проекты
          ...options,
        }
      );

      projects.value = allProjects;
      // После загрузки всех проектов пагинация больше не нужна
      nextPageOffset.value = null;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Ошибка загрузки всех проектов";
      console.error("Failed to fetch all projects:", err);
    } finally {
      loading.value = false;
    }
  }

  async function loadMoreProjects() {
    if (!nextPageOffset.value || !currentWorkspaceGid.value) return;

    const authStore = useAuthStore();

    if (!authStore.accessToken) {
      error.value = "Отсутствует токен авторизации";
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      let response;

      // Загружаем проекты в зависимости от текущего типа
      if (isLoadingAllProjects.value) {
        // Загружаем все проекты workspace
        response = await AsanaProjects.fetchAllWorkspaceProjects(
          authStore.accessToken,
          {
            workspace: currentWorkspaceGid.value,
            archived: false,
            offset: nextPageOffset.value,
          }
        );
      } else {
        // Для "моих" проектов пагинация сложнее из-за проверки memberships
        // Просто загружаем следующие проекты без фильтрации по memberships
        // чтобы не делать N+1 запросов для каждой страницы
        response = await AsanaProjects.fetchAllWorkspaceProjects(
          authStore.accessToken,
          {
            workspace: currentWorkspaceGid.value,
            archived: false,
            offset: nextPageOffset.value,
          }
        );
      }

      projects.value = [...projects.value, ...response.data];
      nextPageOffset.value = response.next_page?.offset || null;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Ошибка загрузки проектов";
      console.error("Failed to load more projects:", err);
    } finally {
      loading.value = false;
    }
  }

  async function fetchProjectDetails(
    projectGid: string
  ): Promise<AsanaProject | null> {
    const authStore = useAuthStore();

    if (!authStore.accessToken) {
      error.value = "Отсутствует токен авторизации";
      return null;
    }

    loading.value = true;
    error.value = null;

    try {
      const project = await AsanaProjects.fetchProjectDetails(
        authStore.accessToken,
        projectGid
      );

      // Обновляем проект в списке, если он там есть
      const index = projects.value.findIndex((p) => p.gid === projectGid);
      if (index !== -1) {
        projects.value[index] = project;
      }

      return project;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Ошибка загрузки проекта";
      console.error("Failed to fetch project details:", err);
      return null;
    } finally {
      loading.value = false;
    }
  }

  function clearProjects() {
    projects.value = [];
    nextPageOffset.value = null;
    error.value = null;
    isLoadingAllProjects.value = false;
  }

  function getProjectById(gid: string): AsanaProject | undefined {
    return projects.value.find((p) => p.gid === gid);
  }

  function setWorkspace(workspaceGid: string) {
    currentWorkspaceGid.value = workspaceGid;
    // Сохраняем выбранный workspace в localStorage
    localStorage.setItem(WORKSPACE_STORAGE_KEY, workspaceGid);
    clearProjects(); // Очищаем проекты при смене workspace
  }

  return {
    // State
    projects,
    workspaces,
    currentWorkspaceGid,
    loading,
    error,
    nextPageOffset,

    // Getters
    activeProjects,
    archivedProjects,
    projectsCount,

    // Actions
    fetchWorkspaces,
    fetchUserProjects, // Загружает ТОЛЬКО МОИ проекты (алиас для fetchMyProjects)
    fetchAllProjects, // Загружает ВСЕ проекты workspace
    loadMoreProjects,
    fetchProjectDetails,
    clearProjects,
    getProjectById,
    setWorkspace,
  };
});
