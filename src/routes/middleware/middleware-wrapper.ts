import type { RouteLocationNormalized } from "vue-router";

export type Middleware = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
) => Promise<void>;


export function middlewareWrapper(...middlewares: Middleware[]): Middleware {
  return async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    for (const middleware of middlewares) {
      await middleware(to, from);
    }
  };
}
