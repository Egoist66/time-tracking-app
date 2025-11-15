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
  const isInitializing = ref(true);
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
      // Используем наш backend endpoint вместо прямого запроса к Asana
      // Это безопасно, т.к. client_secret остается на сервере
      const apiUrl = import.meta.env.DEV 
        ? 'https://time-tracking-app-sigma.vercel.app/api/auth/token'
        : '/api/auth/token';

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "authorization_code",
          code: code,
        }),
      });

      // Читаем тело ответа как текст для диагностики
      const responseText = await response.text();
      console.log('Server response status:', response.status);
      console.log('Server response:', responseText);

      if (!response.ok) {
        // Пытаемся распарсить как JSON
        try {
          const errorData = JSON.parse(responseText);
          throw new Error(errorData.error_description || errorData.error || `Server error: ${response.status}`);
        } catch (parseError) {
          // Если не JSON, показываем текст ошибки
          throw new Error(`Server error (${response.status}): ${responseText.substring(0, 100)}`);
        }
      }

      const data = JSON.parse(responseText);
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
      // Используем наш backend endpoint для обновления токена
      const apiUrl = import.meta.env.DEV 
        ? 'https://time-tracking-app-sigma.vercel.app/api/auth/token'
        : '/api/auth/token';

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          grant_type: "refresh_token",
          refresh_token: refreshToken.value,
        }),
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

    // Используем правильные scopes как в Asana OAuth
    // openid - OpenID Connect authentication
    // email - доступ к email пользователя
    // profile - доступ к профилю пользователя
    // default - базовый доступ к Asana API
    // identity - доступ к идентификационным данным
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "openid email profile default identity",
      state: state,
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

  // Инициализация авторизации при загрузке приложения
  const initializeAuth = async () => {
    isInitializing.value = true;
    
    try {
      // Загружаем данные из localStorage
      loadFromStorage();
      
      // Если есть токен, проверяем его валидность
      if (accessToken.value) {
        // Если токен истек, пытаемся обновить
        if (isTokenExpired()) {
          await refreshAccessToken();
        } else if (!user.value) {
          // Если токен валиден, но нет данных пользователя, загружаем их
          await fetchUser();
        }
      }
    } catch (err) {
      console.error("Ошибка инициализации авторизации:", err);
    } finally {
      // Даем небольшую задержку для плавной анимации (минимум 500ms)
      await new Promise(resolve => setTimeout(resolve, 500));
      isInitializing.value = false;
    }
  };

  // Инициализация при загрузке store
  loadFromStorage();

  return {
    // State
    accessToken,
    user,
    isLoading,
    isInitializing,
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
    initializeAuth,
  };
});
