import {
  cleanup,
  effect,
  inject,
  provide,
  root,
  signal,
  untrack,
} from "space/signal"
const paramsKey = Symbol("Params")
const routesKey = Symbol("Routes")
export const path = signal("")

const routeTypeHandlerMap = {
  hash() {
    const hash = () => location.hash.slice(1) || "/"
    const hashChangeListener = () => path.value = hash()
    effect(() => {
      untrack(() => path.value = hash())
      addEventListener("hashchange", hashChangeListener)
    })
    cleanup(() => removeEventListener("hashchange", hashChangeListener))
  },
  pathname() {
    const url = new URL(location.toString())
    const clickListener = (event) => {
      let elt = event.target
      let pathname
      while (elt != null) {
        pathname = elt?.getAttribute?.("href")
        if (pathname?.startsWith("/")) {
          event.preventDefault()
          if (pathname !== url.pathname) {
            path.value = pathname
            url.pathname = pathname
            return history.pushState(null, "", url)
          }
        }
        elt = elt?.parentElement
      }
    }
    /**
     * @param {PopStateEvent} event
     */
    const popStateListener = (event) => {
      event.preventDefault()
      path.value = location.pathname
    }
    effect(() => {
      untrack(() => {
        path.value = location.pathname
      })
      addEventListener("click", clickListener)
      addEventListener("popstate", popStateListener)
    })
    cleanup(() => {
      removeEventListener("click", clickListener)
      removeEventListener("popstate", popStateListener)
    })
  },
}

/**
 * @returns {{ [field: string]: string | undefined } | undefined}
 */
export function getParams() {
  return inject(paramsKey)
}

/**
 * @param {string} path
 * @returns {RegExp}
 */
function createMatcher(path) {
  return RegExp(
    "^" + path.replace(/:([^/:]+)/g, (_, name) => `(?<${name}>[^/]+)`) + "$",
  )
}

/**
 * Allows usage of the following:
 * @example
 * ```javascript
 * template`
 *   <Router type="hash">
 *     Static Child
 *     <Route path="/" children="home" />
 *     <Route path="/about">
 *       about
 *     </Route>
 *     <Route path="/etc" children=${Component} />
 *   </Router>
 * `
 * ```
 * @param {{ type: string, children?: any, fallback?: any }} props
 */
export function Router(props) {
  routeTypeHandlerMap[props.type]()
  /**
   * @type {Set<{ path: string, regexp: RegExp, children?: any }>}
   */
  const routes = new Set()
  provide(routesKey, routes)
  return function* () {
    const nextPath = path.value
    yield props.children
    for (const route of routes) {
      if (route.regexp.test(nextPath)) {
        yield root(() => {
          provide(paramsKey, route.regexp.exec(nextPath)?.groups)
          return route.children
        })
        return
      }
    }
    yield props.fallback
  }
}

/**
 * @param {{ path: string, children?: any }} props
 */
export function Route(props) {
  effect(() => {
    inject(routesKey)?.add({
      path: props.path,
      regexp: createMatcher(props.path),
      get children() {
        return props.children
      },
    })
  })
}
