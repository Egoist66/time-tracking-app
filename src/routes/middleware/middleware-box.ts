import { routeTitle } from "./route-title/route-title"
import { routeLogger } from "./route-logger/route-logger"
import { authMiddleware } from "./auth/auth"
import type { Middleware } from "./types/middleware.types"


const devMiddlewares: Middleware[] = [
    routeLogger,
    authMiddleware,
    routeTitle,

]

const prodMiddlewares: Middleware[] = [
    authMiddleware,
    routeTitle,
]

export const middleWareBox: Middleware[] = [
    ...(import.meta.env.DEV ? devMiddlewares : prodMiddlewares),
]