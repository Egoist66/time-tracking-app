import type { RouteLocationNormalized } from "vue-router";
import type { Middleware } from "./types/middleware.types";



export function middlewareWrapper(...middlewares: Middleware[]): Middleware {
  return async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    for (const middleware of middlewares) {
      await middleware(to, from);
    }
  };
}
