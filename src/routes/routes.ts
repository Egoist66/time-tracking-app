import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
    {
      path: '/',
      alias: '/home',
      name: 'home',
      component: () => import('@/pages/Home.vue'),
    },
  ]