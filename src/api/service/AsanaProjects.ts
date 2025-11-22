/**
 * AsanaProjects class provides methods to interact with Asana Projects API.
 */

import { asanaBaseUrl } from "../constants";
import type {
  FetchProjectsOptions,
  AsanaProjectsResponse,
  AsanaProject,
  AsanaWorkspacesResponse,
  AsanaProjectMembershipsResponse,
} from "../types/projects.type";

// Re-export types for convenience
export type { AsanaProject, AsanaWorkspace } from "../types/projects.type";

export class AsanaProjects {
  /**
   * Получить список workspaces пользователя
   * Необходимо для получения workspace_gid перед запросом проектов
   */
  static async fetchUserWorkspaces(
    accessToken: string
  ): Promise<AsanaWorkspacesResponse> {
    try {
      const url = `${asanaBaseUrl}/workspaces`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Asana API Error (workspaces):", {
          status: response.status,
          statusText: response.statusText,
          url,
          errorData,
        });
        throw new Error(
          errorData.errors?.[0]?.message ||
            `Не удалось загрузить workspace'ы (${response.status})`
        );
      }

      const data = await response.json();
      return data as AsanaWorkspacesResponse;
    } catch (error) {
      console.error("fetchUserWorkspaces error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить workspace'ы"
      );
    }
  }
  /**
   * Получить все проекты workspace (где текущий пользователь может иметь доступ)
   * Использовать для Dashboard
   * 
   * ВАЖНО: Asana API не имеет отдельного endpoint для "моих" проектов.
   * Используется endpoint /workspaces/{workspace_gid}/projects который возвращает 
   * все проекты workspace доступные текущему пользователю.
   */
  static async fetchMyProjects(
    accessToken: string,
    options: FetchProjectsOptions = {}
  ): Promise<AsanaProjectsResponse> {
    try {
      if (!options.workspace) {
        throw new Error("workspace обязателен для получения проектов");
      }

      const params = new URLSearchParams();

      if (options.archived !== undefined) {
        params.append("archived", String(options.archived));
      }

      if (options.limit) {
        params.append("limit", String(Math.min(options.limit, 100)));
      }

      if (options.offset) {
        params.append("offset", options.offset);
      }

      const queryString = params.toString();
      // Правильный Asana API endpoint: /workspaces/{workspace_gid}/projects
      const url = `${asanaBaseUrl}/workspaces/${options.workspace}/projects${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Asana API Error (my projects):", {
          status: response.status,
          statusText: response.statusText,
          url,
          errorData
        });
        throw new Error(
          errorData.errors?.[0]?.message ||
            `Не удалось загрузить проекты (${response.status})`
        );
      }

      const data = await response.json();
      return data as AsanaProjectsResponse;
    } catch (error) {
      console.error("fetchMyProjects error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить проекты"
      );
    }
  }

  /**
   * Получить ВСЕ проекты workspace
   * Использовать для страницы Projects
   * 
   * Использует тот же endpoint что и fetchMyProjects, так как в Asana API
   * /workspaces/{workspace_gid}/projects уже возвращает все доступные проекты
   */
  static async fetchAllWorkspaceProjects(
    accessToken: string,
    options: FetchProjectsOptions = {}
  ): Promise<AsanaProjectsResponse> {
    try {
      if (!options.workspace) {
        throw new Error("workspace обязателен для получения проектов");
      }

      const params = new URLSearchParams();

      if (options.archived !== undefined) {
        params.append("archived", String(options.archived));
      }

      if (options.limit) {
        params.append("limit", String(Math.min(options.limit, 100)));
      }

      if (options.offset) {
        params.append("offset", options.offset);
      }

      const queryString = params.toString();
      // Правильный Asana API endpoint: /workspaces/{workspace_gid}/projects
      const url = `${asanaBaseUrl}/workspaces/${options.workspace}/projects${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Asana API Error (all projects):", {
          status: response.status,
          statusText: response.statusText,
          url,
          errorData
        });
        throw new Error(
          errorData.errors?.[0]?.message ||
            `Не удалось загрузить проекты workspace (${response.status})`
        );
      }

      const data = await response.json();
      return data as AsanaProjectsResponse;
    } catch (error) {
      console.error("fetchAllWorkspaceProjects error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить проекты workspace"
      );
    }
  }

  /**
   * @deprecated Используйте fetchMyProjects или fetchAllWorkspaceProjects
   */
  static async fetchUserProjects(
    accessToken: string,
    options: FetchProjectsOptions = {}
  ): Promise<AsanaProjectsResponse> {
    // По умолчанию используем fetchMyProjects для обратной совместимости
    return this.fetchMyProjects(accessToken, options);
  }


  static async fetchProjectsByUserGid(
    accessToken: string,
    userGid: string,
    options: FetchProjectsOptions = {}
  ): Promise<AsanaProjectsResponse> {
    try {
      const params = new URLSearchParams();

      if (options.workspace) {
        params.append("workspace", options.workspace);
      }

      if (options.archived !== undefined) {
        params.append("archived", String(options.archived));
      }

      if (options.limit) {
        params.append("limit", String(Math.min(options.limit, 100)));
      }

      if (options.offset) {
        params.append("offset", options.offset);
      }

      const queryString = params.toString();
      const url = `${asanaBaseUrl}/users/${userGid}/projects${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.errors?.[0]?.message ||
            "Не удалось загрузить проекты пользователя"
        );
      }

      const data = await response.json();
      return data as AsanaProjectsResponse;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить проекты пользователя"
      );
    }
  }

  
  static async fetchWorkspaceProjects(
    accessToken: string,
    workspaceGid: string,
    options: Omit<FetchProjectsOptions, "workspace"> = {}
  ): Promise<AsanaProjectsResponse> {
    try {
      const params = new URLSearchParams();

      if (options.archived !== undefined) {
        params.append("archived", String(options.archived));
      }

      if (options.limit) {
        params.append("limit", String(Math.min(options.limit, 100)));
      }

      if (options.offset) {
        params.append("offset", options.offset);
      }

      const queryString = params.toString();
      // Правильный Asana API endpoint: /workspaces/{workspace_gid}/projects
      const url = `${asanaBaseUrl}/workspaces/${workspaceGid}/projects${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.errors?.[0]?.message ||
            "Не удалось загрузить проекты workspace"
        );
      }

      const data = await response.json();
      return data as AsanaProjectsResponse;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить проекты workspace"
      );
    }
  }


  static async fetchProjectDetails(
    accessToken: string,
    projectGid: string
  ): Promise<AsanaProject> {
    try {
      const url = `${asanaBaseUrl}/projects/${projectGid}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.errors?.[0]?.message ||
            "Не удалось загрузить информацию о проекте"
        );
      }

      const data = await response.json();
      return data.data as AsanaProject;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить информацию о проекте"
      );
    }
  }

  /**
   * Получить членство в проекте (project memberships)
   * Используется для определения, является ли пользователь участником проекта
   */
  static async fetchProjectMemberships(
    accessToken: string,
    projectGid: string
  ): Promise<AsanaProjectMembershipsResponse> {
    try {
      const url = `${asanaBaseUrl}/projects/${projectGid}/project_memberships`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.errors?.[0]?.message ||
            "Не удалось загрузить членство в проекте"
        );
      }

      const data = await response.json();
      return data as AsanaProjectMembershipsResponse;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить членство в проекте"
      );
    }
  }

  /**
   * Получить только проекты, где текущий пользователь является участником
   * Алгоритм:
   * 1. Получить все проекты воркспейса
   * 2. Для каждого проекта проверить project_memberships
   * 3. Отфильтровать те, где user.gid совпадает с нужным пользователем
   * 
   * ВНИМАНИЕ: Этот метод делает N+1 запросов (1 для списка проектов + по 1 для каждого проекта)
   * Запросы к project_memberships выполняются параллельно для оптимизации
   */
  static async fetchMyProjectsWithMembership(
    accessToken: string,
    userGid: string,
    options: FetchProjectsOptions = {}
  ): Promise<AsanaProjectsResponse> {
    try {
      if (!options.workspace) {
        throw new Error("workspace обязателен для получения проектов");
      }

      // Используем максимальный лимит для загрузки большего количества проектов
      const fetchOptions = {
        ...options,
        limit: options.limit || 100, // Максимальный лимит Asana API = 100
      };

      // Шаг 1: Получаем ВСЕ проекты выбранного воркспейса (до 100 за раз)
      const allProjects = await this.fetchAllWorkspaceProjects(accessToken, fetchOptions);

      // Шаг 2: Для каждого проекта проверяем project_memberships параллельно
      const membershipChecks = allProjects.data.map(async (project) => {
        try {
          // GET https://app.asana.com/api/1.0/projects/{project_gid}/project_memberships
          const memberships = await this.fetchProjectMemberships(
            accessToken,
            project.gid
          );
          
          // Шаг 3: Отфильтровать те, где user.gid совпадает с нужным пользователем
          const isMember = memberships.data.some(
            (membership) => membership.user.gid === userGid
          );
          
          return isMember ? project : null;
        } catch (error) {
          // Если не удалось получить memberships, пропускаем проект
          console.warn(`Не удалось проверить членство для проекта ${project.gid}:`, error);
          return null;
        }
      });

      // Все проверки выполняются параллельно через Promise.all
      const resolvedProjects = await Promise.all(membershipChecks);
      const filteredProjects = resolvedProjects.filter(
        (project): project is AsanaProject => project !== null
      );

      return {
        data: filteredProjects,
        next_page: allProjects.next_page,
      };
    } catch (error) {
      console.error("fetchMyProjectsWithMembership error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить мои проекты с проверкой членства"
      );
    }
  }

  /**
   * Загрузить ВСЕ проекты с проверкой членства (с автоматической пагинацией)
   * Используется для Dashboard, чтобы загрузить все проекты воркспейса с проверкой участия
   * 
   * Этот метод автоматически загружает все страницы проектов и проверяет членство для каждого
   */
  static async fetchAllMyProjectsWithMembership(
    accessToken: string,
    userGid: string,
    options: FetchProjectsOptions = {}
  ): Promise<AsanaProject[]> {
    try {
      if (!options.workspace) {
        throw new Error("workspace обязателен для получения проектов");
      }

      const allMyProjects: AsanaProject[] = [];
      let offset: string | undefined = options.offset;
      const limit = 100; // Максимальный лимит Asana API

      // Загружаем все страницы проектов с проверкой членства
      do {
        const response = await this.fetchMyProjectsWithMembership(accessToken, userGid, {
          ...options,
          limit,
          offset,
        });

        // Добавляем найденные проекты
        allMyProjects.push(...response.data);

        // Проверяем, есть ли следующая страница
        offset = response.next_page?.offset;
      } while (offset);

      return allMyProjects;
    } catch (error) {
      console.error("fetchAllMyProjectsWithMembership error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить все мои проекты с проверкой членства"
      );
    }
  }

  /**
   * Загрузить ВСЕ проекты workspace с автоматической пагинацией
   * Используется для страницы Projects, чтобы загрузить все проекты воркспейса
   */
  static async fetchAllWorkspaceProjectsPaginated(
    accessToken: string,
    options: FetchProjectsOptions = {}
  ): Promise<AsanaProject[]> {
    try {
      if (!options.workspace) {
        throw new Error("workspace обязателен для получения проектов");
      }

      const allProjects: AsanaProject[] = [];
      let offset: string | undefined = options.offset;
      const limit = 100; // Максимальный лимит Asana API

      // Загружаем все страницы проектов
      do {
        const response = await this.fetchAllWorkspaceProjects(accessToken, {
          ...options,
          limit,
          offset,
        });

        // Добавляем проекты
        allProjects.push(...response.data);

        // Проверяем, есть ли следующая страница
        offset = response.next_page?.offset;
      } while (offset);

      return allProjects;
    } catch (error) {
      console.error("fetchAllWorkspaceProjectsPaginated error:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Не удалось загрузить все проекты workspace"
      );
    }
  }
}
