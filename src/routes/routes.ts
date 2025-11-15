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
      path: '/time-entries',
      name: 'time-entries',
      meta: {
        title: 'Time Entries',
        requiresAuth: true,
      },
      component: () => import('@/pages/TimeEntries.vue'),
    },
    {
      path: '/projects',
      name: 'projects',
      meta: {
        title: 'Projects',
        requiresAuth: true,
      },
      component: () => import('@/pages/Projects.vue'),
    },
    {
      path: '/reports',
      name: 'reports',
      meta: {
        title: 'Reports',
        requiresAuth: true,
      },
      component: () => import('@/pages/Reports.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      meta: {
        title: 'Settings',
        requiresAuth: true,
      },
      component: () => import('@/pages/Settings.vue'),
    },
    {
      path: '/projects/:id',
      name: 'project',
      meta: {
        title: 'Project',
        requiresAuth: true,
      },
      component: () => import('@/pages/Project.vue'),
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