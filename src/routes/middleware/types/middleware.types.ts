import type { RouteLocationNormalized, RouteLocationRaw } from "vue-router";

export type Middleware = (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ) => Promise<void | RouteLocationRaw>;
  