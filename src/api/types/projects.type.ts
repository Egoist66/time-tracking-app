export interface AsanaProject {
  gid: string;
  name: string;
  archived: boolean;
  color: string | null;
  created_at: string;
  current_status: {
    color: string;
    text: string;
  } | null;
  due_date: string | null;
  due_on: string | null;
  modified_at: string;
  notes: string;
  public: boolean;
  owner: {
    gid: string;
    name: string;
  };
  workspace: {
    gid: string;
    name: string;
  };
  permalink_url: string;
}

export interface AsanaProjectsResponse {
  data: AsanaProject[];
  next_page: {
    offset: string;
    path: string;
    uri: string;
  } | null;
}

export interface FetchProjectsOptions {
  workspace?: string; // workspace_gid для фильтрации (обязательно для Asana API)
  archived?: boolean; // включить архивные проекты
  limit?: number; // количество проектов (макс 100)
  offset?: string; // для пагинации
}

export interface AsanaWorkspace {
  gid: string;
  name: string;
  resource_type: string;
}

export interface AsanaWorkspacesResponse {
  data: AsanaWorkspace[];
}

export interface AsanaProjectMembership {
  gid: string;
  user: {
    gid: string;
    name: string;
  };
  project: {
    gid: string;
    name: string;
  };
  write_access: string;
}

export interface AsanaProjectMembershipsResponse {
  data: AsanaProjectMembership[];
}
