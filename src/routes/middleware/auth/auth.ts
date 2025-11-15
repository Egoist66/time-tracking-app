import type { RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/store/auth.store'

export async function authMiddleware(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized
) {
  const authStore = useAuthStore()
  
  const requiresAuth = to.meta.requiresAuth

  if (requiresAuth) {
    // Если токен истек, пытаемся обновить его
    if (authStore.isTokenExpired() && authStore.accessToken) {
      authStore.isLoading = true
      await authStore.refreshAccessToken()
      authStore.isLoading = false
    }

    if (!authStore.isAuthenticated) {
      sessionStorage.setItem('redirect_after_login', to.fullPath)
      
      return {
        name: 'login',
      }
    }
  }

  // Если пользователь авторизован и пытается попасть на страницу логина
  if (authStore.isAuthenticated && to.name === 'login') {
    return { name: 'dashboard' }
  }
}

