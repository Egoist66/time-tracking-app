import type { RouteLocationNormalized } from "vue-router";

export type Middleware = (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized
  ) => Promise<void>;
  