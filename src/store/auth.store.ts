import { defineStore } from "pinia";
import { computed, shallowRef } from "vue";
import { delay } from "@/lib/utils";
import type { AsanaUser } from "@/api/types/user.type";
import type { AuthState } from "@/api/types/authstate.type";
import {
  AUTH_STORAGE_KEY,
  asanaToken,
} from "@/api/constants";
import { AsanaAuth } from "@/api/service/AsanaAuth";

export const useAuthStore = defineStore("auth", () => {
  const accessToken = shallowRef<string | null>(null);
  const refreshToken = shallowRef<string | null>(null);
  const expiresAt = shallowRef<number | null>(null);
  const user = shallowRef<AsanaUser | null>(null);
  const isLoading = shallowRef(false);
  const isInitializing = shallowRef(true);
  const error = shallowRef<string | null>(null);

  const isAuthenticated = computed(() => {
    return !!accessToken.value && !!user.value && !isTokenExpired();
  });

  const isTokenExpired = () => {
    if (!expiresAt.value) return true;
    return Date.now() >= expiresAt.value;
  };

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
      const responseData = await AsanaAuth.exchangeCodeForToken(code);

      setTokens(
        responseData.access_token,
        responseData.refresh_token,
        responseData.expires_in
      );
      await fetchUser();
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Ошибка авторизации";
      console.error("Ошибка обмена токена:", err);
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchUser = async () => {
    if (!accessToken.value) return;

    try {
      const userData = await AsanaAuth.fetchUser(accessToken.value);
      setUser(userData);
    } catch (err) {
      console.error("Ошибка получения данных пользователя:", err);
      error.value =
        err instanceof Error
          ? err.message
          : "Не удалось получить данные пользователя";
      throw err;
    }
  };

  const refreshAccessToken = async () => {
    if (!refreshToken.value) {
      logout();
      return false;
    }

    try {
      const responseData = await AsanaAuth.refreshAccessToken(
        refreshToken.value
      );
      setTokens(
        responseData.access_token,
        responseData.refresh_token,
        responseData.expires_in
      );
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

  const generateOAuthUrl = () => {
    return AsanaAuth.generateOAuthUrl();
  };

  // Авторизация через Personal Access Token (для разработки)
  const loginWithToken = async (token?: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const tokenToUse = token || asanaToken;

      if (!tokenToUse) {
        throw new Error("Personal Access Token не найден");
      }

      accessToken.value = tokenToUse;
      expiresAt.value = Date.now() + 365 * 24 * 60 * 60 * 1000;

      const userData = await AsanaAuth.fetchUser(tokenToUse);
      setUser(userData);
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
    return AsanaAuth.verifyState(state);
  };

  const initializeAuth = async () => {
    isInitializing.value = true;

    try {
      loadFromStorage();

      if (accessToken.value) {
        if (isTokenExpired()) {
          await refreshAccessToken();
        } else if (!user.value) {
          await fetchUser();
        }
      }
    } catch (err) {
      console.error("Ошибка инициализации авторизации:", err);
    } finally {
      await delay(500);
      isInitializing.value = false;
    }
  };

  loadFromStorage();

  return {
    accessToken,
    refreshToken,
    expiresAt,
    user,
    isLoading,
    isInitializing,
    error,
    isAuthenticated,

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
