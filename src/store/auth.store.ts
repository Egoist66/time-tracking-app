import { defineStore } from "pinia";
import { ref, computed } from "vue";

interface AsanaUser {
  gid: string;
  email: string;
  name: string;
  photo?: {
    image_21x21?: string;
    image_27x27?: string;
    image_36x36?: string;
    image_60x60?: string;
    image_128x128?: string;
  };
  workspaces?: Array<{
    gid: string;
    name: string;
  }>;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  user: AsanaUser | null;
}

const AUTH_STORAGE_KEY = "asana_auth";

export const useAuthStore = defineStore("auth", () => {
  // State
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const expiresAt = ref<number | null>(null);
  const user = ref<AsanaUser | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const isAuthenticated = computed(() => {
    return !!accessToken.value && !!user.value && !isTokenExpired();
  });

  const isTokenExpired = () => {
    if (!expiresAt.value) return true;
    return Date.now() >= expiresAt.value;
  };

  // Actions
  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const data: AuthState = JSON.parse(stored);
        accessToken.value = data.accessToken;
        refreshToken.value = data.refreshToken;
        expiresAt.value = data.expiresAt;
        user.value = data.user;
      }
    } catch (err) {
      console.error("Ошибка загрузки данных авторизации:", err);
      clearStorage();
    }
  };

  const saveToStorage = () => {
    try {
      const data: AuthState = {
        accessToken: accessToken.value,
        refreshToken: refreshToken.value,
        expiresAt: expiresAt.value,
        user: user.value,
      };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error("Ошибка сохранения данных авторизации:", err);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const setTokens = (
    access: string,
    refresh: string | null,
    expiresIn: number
  ) => {
    accessToken.value = access;
    refreshToken.value = refresh;
    expiresAt.value = Date.now() + expiresIn * 1000;
    saveToStorage();
  };

  const setUser = (userData: AsanaUser) => {
    user.value = userData;
    saveToStorage();
  };

  const exchangeCodeForToken = async (code: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const params = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: import.meta.env.VITE_ASANA_CLIENT_ID,
        client_secret: import.meta.env.VITE_ASANA_CLIENT_SECRET,
        redirect_uri: import.meta.env.VITE_ASANA_REDIRECT_URI,
        code: code,
      });

      const response = await fetch("https://app.asana.com/-/oauth_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error("Не удалось обменять код на токен");
      }

      const data = await response.json();
      setTokens(data.access_token, data.refresh_token, data.expires_in);

      // Получаем информацию о пользователе
      await fetchUser();

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Ошибка авторизации";
      console.error("Ошибка обмена токена:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchUser = async () => {
    if (!accessToken.value) return;

    try {
      const response = await fetch("https://app.asana.com/api/1.0/users/me", {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      });

      if (!response.ok) {
        throw new Error("Не удалось получить данные пользователя");
      }

      const data = await response.json();
      setUser(data.data);
    } catch (err) {
      console.error("Ошибка получения данных пользователя:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "Не удалось получить данные пользователя";
    }
  };

  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      logout();
      return false;
    }

    try {
      const params = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: import.meta.env.VITE_ASANA_CLIENT_ID,
        client_secret: import.meta.env.VITE_ASANA_CLIENT_SECRET,
        refresh_token: refreshToken.value,
      });

      const response = await fetch("https://app.asana.com/-/oauth_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error("Не удалось обновить токен");
      }

      const data = await response.json();
      setTokens(data.access_token, data.refresh_token, data.expires_in);

      return true;
    } catch (err) {
      console.error("Ошибка обновления токена:", err);
      logout();
      return false;
    }
  };

  const logout = () => {
    accessToken.value = null;
    refreshToken.value = null;
    expiresAt.value = null;
    user.value = null;
    error.value = null;
    clearStorage();
  };

  // Генерация OAuth URL
  const generateOAuthUrl = () => {
    const clientId = import.meta.env.VITE_ASANA_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_ASANA_REDIRECT_URI;

    // Генерируем state для защиты от CSRF
    const state = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem("oauth_state", state);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      state: state,
      scope: "default",
    });

    return `https://app.asana.com/-/oauth_authorize?${params.toString()}`;
  };

  // Авторизация через Personal Access Token (для разработки)
  const loginWithToken = async (token?: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const tokenToUse = token || import.meta.env.VITE_ASANA_TOKEN;

      if (!tokenToUse) {
        throw new Error("Personal Access Token не найден");
      }

      // Устанавливаем токен
      accessToken.value = tokenToUse;
      // PAT не истекает автоматически, устанавливаем далекую дату
      expiresAt.value = Date.now() + 365 * 24 * 60 * 60 * 1000; // 1 год

      // Получаем данные пользователя
      const response = await fetch("https://app.asana.com/api/1.0/users/me", {
        headers: {
          Authorization: `Bearer ${tokenToUse}`,
        },
      });

      if (!response.ok) {
        throw new Error("Не удалось получить данные пользователя");
      }

      const data = await response.json();
      setUser(data.data);
      saveToStorage();

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Ошибка авторизации";
      console.error("Ошибка входа через токен:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const verifyState = (state: string) => {
    const savedState = sessionStorage.getItem("oauth_state");
    sessionStorage.removeItem("oauth_state");
    return state === savedState;
  };

  // Инициализация при загрузке store
  loadFromStorage();

  return {
    // State
    accessToken,
    user,
    isLoading,
    error,

    // Computed
    isAuthenticated,

    // Actions
    exchangeCodeForToken,
    fetchUser,
    refreshAccessToken,
    logout,
    generateOAuthUrl,
    verifyState,
    isTokenExpired,
    loginWithToken,
  };
});
