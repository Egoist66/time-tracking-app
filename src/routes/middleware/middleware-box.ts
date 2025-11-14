import type { Middleware } from "./middleware-wrapper"
import { routeTitle } from "./route-title/route-title"
import { routeLogger } from "./route-logger/route-logger"


const devMiddlewares: Middleware[] = [
    routeLogger,
    routeTitle,

]

const prodMiddlewares: Middleware[] = [
    routeTitle,
]

export const middleWareBox: Middleware[] = [
    ...(import.meta.env.DEV ? devMiddlewares : prodMiddlewares),
]