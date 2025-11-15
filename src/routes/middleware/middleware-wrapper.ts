import type { RouteLocationNormalized, RouteLocationRaw } from "vue-router";
import type { Middleware } from "./types/middleware.types";



export function middlewareWrapper(...middlewares: Middleware[]): Middleware {
  return async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
    for (const middleware of middlewares) {
      const result = await middleware(to, from);
      // Если middleware вернул редирект, прерываем цепочку и возвращаем его
      if (result) {
        return result as RouteLocationRaw;
      }
    }
  };
}
