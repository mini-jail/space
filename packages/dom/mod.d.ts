declare global {
  namespace jail {
    type DOMElement = HTMLElement | SVGElement
    type TemplateResult = Node | Node[] | undefined

    interface Binding<T = unknown> {
      readonly value: T
      readonly rawValue: (() => T) | T
      readonly arg: string | null
      readonly modifiers: Modifiers | null
    }

    type Modifiers = { [key: string]: boolean }

    interface AppInjection {
      directives: Directives
      components: Components
    }

    interface Directive<T = unknown> {
      (elt: DOMElement, binding: Binding<T>): void
    }

    interface Component<P extends object = {}> {
      (props: P & Props): any
    }

    type Props = {
      children?: any
    }

    type Fragment = {
      querySelectorAll(selectors: string): Iterable<DOMElement>
      cloneNode(deep?: boolean): Fragment
    } & DocumentFragment

    interface Directives {
      on: (this: DOMElement, event: Event) => void
      ref: (elt: DOMElement) => void
      show: boolean
      if: boolean
      html: string
      text: string
      style: string
      bind: any
    }

    interface Injections {}

    interface Components {}
  }
}

export function createDirective<K extends keyof jail.Directives>(
  name: K,
  directive: jail.Directive<jail.Directives[K]>,
): void
export function createDirective<T>(
  name: string,
  directive: jail.Directive<T>,
): void
export function createDirective(name: string, directive: jail.Directive): void

export function createComponent<K extends keyof jail.Components>(
  name: K,
  component: jail.Component<jail.Components[K]>,
): void
export function createComponent<T extends object>(
  name: string,
  component: jail.Component<T>,
): void
export function createComponent(name: string, component: jail.Component): void

export function mount(
  rootElement: jail.DOMElement,
  rootComponent: jail.Component,
): jail.Cleanup

export function template(strings: TemplateStringsArray): jail.TemplateResult
export function template(
  strings: TemplateStringsArray,
  ...args: unknown[]
): jail.TemplateResult

export function createTemplateString(strings: TemplateStringsArray): string
export function createTemplateString(strings: string[]): string
