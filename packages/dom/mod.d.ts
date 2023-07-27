import type { Cleanup, Getter } from "jail/signal"

declare global {
  interface Injections {
    [AppInjectionKey]?: App
  }
  interface Directives {
    on: DOMListener
    ref: (elt: DOMElement) => void
    show: boolean
    if: boolean
    html: string
    text: string
    style: string
    bind: any
    [name: string]: any
  }
  interface Components {
    [name: string]: Properties
  }
}

export type DOMElement = (HTMLElement | SVGElement) & AnyObject
export type DOMNode = (Node & AnyObject) | DOMElement
export type DOMEventTarget = DOMElement & EventTarget
export interface DOMEvent extends Event {
  target: DOMEventTarget | null
  currentTarget: DOMEventTarget
}
export type DOMListener = (this: DOMElement, event: DOMEvent) => void
export type NodeSlot =
  | string
  | number
  | DOMNode
  | boolean
  | null
  | undefined
export type AttrSlot =
  | NodeSlot
  | NodeSlot[]
  | (() => NodeSlot)
  | DOMListener
  | AnyObject
export type Slot =
  | NodeSlot
  | AttrSlot
  | (NodeSlot | AttrSlot)[]
  | (() => NodeSlot | AttrSlot)
export type RenderResult = DOMNode | DOMNode[] | undefined
export interface RenderTypeMap {
  attr(elt: DOMElement, slots: Slot[]): void
  slot(elt: HTMLSlotElement, slots: Slot[]): void
  comp(elt: HTMLTemplateElement, slots: Slot[]): void
}
export type AnyObject = {
  [key: string]: any
}
export interface Modifiers {
  readonly [key: string]: boolean
}
export interface Binding<Type = any> {
  readonly value: Type
  readonly rawValue: Getter<Type> | Type
  readonly arg: string | null
  readonly modifiers: Modifiers | null
}
export interface Properties {
  children?: RenderResult | unknown
  [property: string]: any
}
export type Directive<Type = any> = (
  elt: DOMElement,
  binding: Binding<Type>,
) => void
export type Component<Props extends Properties = Properties> = (
  props: Props,
) => any
export type RootComponent = () => any
export interface App {
  directives: Directives
  components: Components
}
export const AppInjectionKey: unique symbol
export function createDirective<Name extends keyof Directives>(
  name: Name,
  directive: Directive<Directives[Name]>,
): void
export function createDirective<Type>(
  name: string,
  directive: Directive<Type>,
): void
export function createComponent<Name extends keyof Components>(
  name: Name,
  component: Component<Components[Name]>,
): void
export function createComponent<Props extends Properties>(
  name: string,
  component: Component<Props>,
): void
export function mount(
  rootElement: DOMElement,
  rootComponent: RootComponent,
): Cleanup
export function template(
  strings: TemplateStringsArray,
  ...slots: Slot[]
): RenderResult
export function createTemplateString(strings: TemplateStringsArray): string
export function createTemplateString(strings: string[]): string
