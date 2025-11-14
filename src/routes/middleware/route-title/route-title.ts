import type { RouteLocationNormalized } from "vue-router";


export async function routeTitle(to: RouteLocationNormalized) {
  const title = to.meta.title as string;
  if (title) {
    document.title = `${import.meta.env.VITE_APP_NAME} - ${title}`;
  }
}