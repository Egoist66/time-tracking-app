import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
    {
      path: '/',
      alias: '/dashboard',
      name: 'dashboard',
      meta: {
        title: 'Dashboard',
        requiresAuth: true,
      

      },
      component: () => import('@/pages/Dashboard.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      meta: {
        title: '404 Page Not Found',
      },
      component: () => import('@/pages/404.vue'),
    },
  ]