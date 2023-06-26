declare global {
  namespace jail {
    type RouteHandler<T = unknown> = {
      (): T
    }

    type Params = {
      [param: string]: string
    }

    type Route<T = unknown> = {
      path: string
      regexp: RegExp
      handler: RouteHandler<T>
    }

    type RouteMap<T = unknown> = {
      [path: string]: RouteHandler<T>
    }
  }
}

export const path: jail.Signal<string>

export function getParams(): jail.Params

export function createRouter<T>(
  routeMap: jail.RouteMap<T>,
): () => T | undefined