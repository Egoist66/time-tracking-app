import type { RouteLocationNormalized } from "vue-router";


export async function routeLogger(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
) {
  const timestamp = new Date().toLocaleTimeString();
  
  console.group(`🚦 Route Navigation [${timestamp}]`);
  console.log('From:', {
    name: from.name || 'N/A',
    path: from.path,
    params: from.params,
    query: from.query,
  });
  console.log('To:', {
    name: to.name || 'N/A',
    path: to.path,
    params: to.params,
    query: to.query,
    meta: to.meta,
  });
  console.groupEnd();
}

