import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
    {
      path: '/login',
      name: 'login',
      meta: {
        title: 'Вход в систему',
      },
      component: () => import('@/pages/Login.vue'),
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      meta: {
        title: 'Авторизация...',
      },
      component: () => import('@/pages/AuthCallback.vue'),
    },
    {
      path: '/',
      alias: '/dashboard',
      name: 'dashboard',
      meta: {
        title: 'Дашборд',
        requiresAuth: true,
      

      },
      component: () => import('@/pages/Dashboard.vue'),
    },
    {
      path: '/time-entries',
      name: 'time-entries',
      meta: {
        title: 'Учет времени',
        requiresAuth: true,
      },
      component: () => import('@/pages/TimeEntries.vue'),
    },
    {
      path: '/projects',
      name: 'projects',
      meta: {
        title: 'Проекты',
        requiresAuth: true,
      },
      component: () => import('@/pages/Projects.vue'),
    },
    {
      path: '/reports',
      name: 'reports',
      meta: {
        title: 'Отчеты',
        requiresAuth: true,
      },
      component: () => import('@/pages/Reports.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      meta: {
        title: 'Настройки',
        requiresAuth: true,
      },
      component: () => import('@/pages/Settings.vue'),
    },
    {
      path: '/projects/:id',
      name: 'project',
      meta: {
        title: 'Проект',
        requiresAuth: true,
      },
      component: () => import('@/pages/Project.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      meta: {
        title: '404 Страница не найдена',
        requiresAuth: true,
      },
      component: () => import('@/pages/404.vue'),
    },
  ]