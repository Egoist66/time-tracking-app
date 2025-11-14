import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: (to, from, savedPosition) => {
    return to.hash ? { el: to.hash } : { top: 0 }
  },
  routes
})

router.beforeEach((to, from, next) => {
 // console.log(to, from)
  next()
})

export default router