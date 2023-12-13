// deno-lint-ignore-file no-explicit-any
import { paramsSymbol, routesSymbol } from "./router.js"

declare global {
  namespace space {
    type RouterType = "pathname" | "hash"
    type Params = { readonly [param: string]: string | undefined }
    type Route = {
      path: string
      regexp: RegExp
      children: Slot
    }
    interface Injections {
      [paramsSymbol]: Params
      [routesSymbol]: Set<Route>
    }
    type RouterProps = ComponentProps<{
      type: RouterType
      fallback?: Slot
    }>
    type RouteProps = ComponentProps<{
      path: string
      component: Component<Record<string, any>>
    }>
    type ForProps = ComponentProps<{
      each: Record<string, any>[]
      do: Component<Record<string, any>>
    }>
    type PortalProps = ComponentProps<{
      selector?: string
      mount?: Element | null
    }>
    type ShowProps = ComponentProps<{
      when: BooleanLike
      fallback?: Slot
    }>
    interface Components {
      For: Component<ForProps>
      Router: Component<RouterProps>
      Route: Component<RouteProps>
      Portal: Component<PortalProps>
      Show: Component<ShowProps>
    }
  }
}

export {}