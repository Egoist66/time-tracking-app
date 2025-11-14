import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { middlewareWrapper } from './middleware/middleware-wrapper'
import { middleWareBox } from './middleware/middleware-box'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: (to) => {
    return to.hash ? { el: to.hash } : { top: 0 }
  },
  routes
})




router.beforeEach(middlewareWrapper(...middleWareBox))
export default router