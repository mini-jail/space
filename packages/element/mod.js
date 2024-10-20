import { Computed, Effect, onCleanup, Root, State } from "space/signal"
/**
 * @typedef {typeof propType[keyof propType]} PropType
 */
/**
 * @template Element, Type
 * @typedef {(elt: Element, value: Type) => void} Directive
 */
/**
 * @typedef {"area" | "base" | "br" | "col" | "embed" | "hr" | "img" | "input" | "link" | "meta" | "param" | "source" | "track" | "wbr"} VoidElements
 */
/**
 * @typedef {{ toString(): string } | State<{ toString(): string }> | (() => { toString(): string })} ToString
 */
/**
 * @typedef {{ [Symbol.iterator](): Iterable<Child> }} IterableChild
 */
/**
 * @typedef {(() => Child)} FunctionChild
 */
/**
 * @typedef {{ render(): Child }} RenderableChild
 */
/**
 * @typedef {State<Child>} StateChild
 */
/**
 * @typedef {{ [key: string]: any }} ObjectChild
 */
/**
 * @typedef {undefined | null | boolean | string | number | Node | Element | StateChild | IterableChild | FunctionChild | RenderableChild | ObjectChild} Child
 */
/**
 * @template Type
 * @typedef {Type | null | undefined | { value: Type | null }} Value
 */
/**
 * @template {{ [name: string]: any }} Type
 * @typedef {{ [Name in keyof Type]: Value<Type[Name]> }} Values
 */
const propType = /** @type {const} */ ({
  ATTR: 0,
  PROP: 1,
  EVENT: 2,
  STYLE: 3,
  DIR: 4,
})
export class Application {
  /**
   * @protected
   * @type {Root?}
   */
  root = null
  /**
   * @protected
   * @type {ParentNode}
   */
  element
  /**
   * @param {ParentNode} element
   */
  constructor(element) {
    this.element = element
  }
  /**
   * @param {Child} child
   */
  render(child) {
    this.unmount()
    this.root = new Root(() => mount(this.element, child))
    return this
  }
  unmount() {
    this.root?.clean()
    this.root = null
  }
}
/**
 * @template {keyof HTMLElementTagNameMap} TagName
 */
export class ElementHTML {
  /**
   * @protected
   * @type {TagName}
   */
  tagName
  /**
   * @protected
   * @type {any[]?}
   */
  props = null
  /**
   * @protected
   * @type {Child[]?}
   */
  children = null
  /**
   * @param {TagName} tagName
   */
  constructor(tagName) {
    this.tagName = tagName
  }
  /**
   * @template Type
   * @param {Directive<HTMLElementTagNameMap[TagName], Type>} directive
   * @param {Type} value
   */
  use(directive, value) {
    if (this.props === null) {
      this.props = []
    }
    updateProperty(this.props, propType.DIR, directive, value)
    return this
  }
  /**
   * @template {keyof GlobalEventHandlersEventMap} Name
   * @overload
   * @param {Name} name
   * @param {((event: GlobalEventHandlersEventMap[Name]) => void)} eventListener
   * @return {this}
   */
  /**
   * @overload
   * @param {string} name
   * @param {(event: Event) => void} eventListener
   * @return {this}
   */
  /**
   * @param {string} name
   * @param {EventListener} eventListener
   * @returns {this}
   */
  on(name, eventListener) {
    if (this.props === null) {
      this.props = []
    }
    updateProperty(this.props, propType.EVENT, name, eventListener)
    return this
  }
  /**
   * @param {string} name
   * @param {Value<ToString>} value
   */
  attribute(name, value) {
    if (this.props === null) {
      this.props = []
    }
    updateProperty(this.props, propType.ATTR, name, value)
    return this
  }
  /**
   * @param {Values<{ [name: string]: string }>} attributes
   */
  attributes(attributes) {
    for (const name in attributes) {
      this.attribute(name, attributes[name])
    }
    return this
  }
  /**
   * @param {string} name
   * @param {Value<unknown>} value
   */
  property(name, value) {
    if (this.props === null) {
      this.props = []
    }
    updateProperty(this.props, propType.PROP, name, value)
    return this
  }
  /**
   * @param {Values<{ [name: string]: unknown }>} properties
   */
  properties(properties) {
    for (const name in properties) {
      this.property(name, properties[name])
    }
    return this
  }
  /**
   * @param {string} name
   * @param {Value<ToString>} value
   */
  style(name, value) {
    if (this.props === null) {
      this.props = []
    }
    updateProperty(this.props, propType.STYLE, name, value)
    return this
  }
  /**
   * @param {Values<{ [name: string]: string }>} styles
   */
  styles(styles) {
    for (const name in styles) {
      this.style(name, styles[name])
    }
    return this
  }
  /**
   * @param {...Child} children
   */
  add(...children) {
    if (this.children === null) {
      this.children = []
    }
    this.children.push(...children)
    return this
  }
  /**
   * @returns {HTMLElementTagNameMap[TagName]}
   */
  render() {
    const elt = document.createElement(this.tagName)
    ElementHTML.consume(elt, this)
    return elt
  }
  /**
   * @protected
   * @param {Element} elt
   * @param {ElementHTML} instance
   */
  static consume(elt, instance) {
    while (instance.props?.length) {
      const value = instance.props.pop()
      const nameOrDir = instance.props.pop()
      const type = /** @type {PropType} */ (instance.props.pop())
      if (type === propType.EVENT) {
        elt.addEventListener(nameOrDir, value)
      } else if (type === propType.DIR) {
        new Effect(() => nameOrDir(elt, value))
      } else if (isResolvable(value)) {
        new Effect(() => setProperty(elt, type, nameOrDir, resolve(value)))
      } else {
        setProperty(elt, type, nameOrDir, value)
      }
    }
    if (instance.children !== null) {
      elt.append(...render(false, ...instance.children))
    }
    instance.props = null
    instance.children = null
    return elt
  }
}
/**
 * @template {PropType} Type
 * @param {Element} elt
 * @param {Type} type
 * @param {string} name
 * @param {any} value
 */
function setProperty(elt, type, name, value) {
  if (type === propType.ATTR) {
    if (value == null) {
      elt.removeAttribute(name)
    } else {
      elt.setAttribute(name, String(value))
    }
  } else if (type === propType.PROP) {
    elt[name] = value
  } else if (type === propType.STYLE) {
    elt["style"][name] = value ?? null
  }
}
/**
 * @template {PropType} Type
 * @param {any[]} props
 * @param {Type} type
 * @param {string | Directive<any, any>} name
 * @param {Type extends 2 ? EventListener : unknown} value
 */
function updateProperty(props, type, name, value) {
  let i = props.length, _name, _type
  while (i--) {
    _name = props[--i]
    _type = props[--i]
    if (_name === name && _type === type) {
      props[i + 2] = value
      return
    }
  }
  props.push(type, name, value)
}
/**
 * @param {unknown} value
 * @returns {value is State | Function}
 */
function isResolvable(value) {
  return value instanceof State || typeof value === "function"
}
/**
 * @param {unknown} value
 */
function resolve(value) {
  if (typeof value === "function") {
    return value()
  }
  return value instanceof State ? value.value : value
}
/**
 * @param {boolean} immediate
 * @param  {...Child} children
 * @returns {Generator<ChildNode | string>}
 */
export function* render(immediate, ...children) {
  for (const child of children) {
    if (child == null || typeof child === "boolean") {
      continue
    } else if (typeof child === "string" || typeof child === "number") {
      yield child + ""
    } else if (child instanceof Node) {
      yield /** @type {ChildNode} */ (child)
    } else if (child instanceof ElementHTML) {
      yield child.render()
    } else if (isResolvable(child)) {
      if (immediate) {
        yield* render(immediate, resolve(child))
      } else {
        const before = new Text()
        mount(null, child, before)
        yield before
      }
    } else if (Symbol.iterator in child) {
      yield* render(immediate, ...child[Symbol.iterator]())
    } else {
      yield String(child)
    }
  }
}
/**
 * @param {Node | undefined | null} targetNode
 * @param {Child} child
 * @param {ChildNode | undefined | null} [before]
 */
export function mount(targetNode, child, before) {
  const children = new Computed(() => {
    const nodes = reconcile(
      targetNode ?? before?.parentElement,
      before,
      children.value,
      Array.from(render(true, child)),
    )
    return nodes
  })
  onCleanup(() => {
    before?.remove()
    children.value?.forEach((child) => child.remove())
  })
}
/**
 * @param {Node | null | undefined} parentNode
 * @param {ChildNode | null | undefined} before
 * @param {ChildNode[] | null | undefined} children
 * @param {(ChildNode | string)[] | null | undefined} nodes
 * @returns {ChildNode[] | null}
 */
function reconcile(parentNode, before, children, nodes) {
  nodes?.forEach((node, i) => {
    const child = children?.[i]
    children?.some((child, j) => {
      let isEqualNode = false
      if (
        child.nodeType === 3 &&
        (typeof node === "string" || node.nodeType === 3)
      ) {
        child["data"] = typeof node === "string" ? node : node["data"]
        isEqualNode = true
      } else if (typeof node !== "string" && child.isEqualNode(node)) {
        isEqualNode = true
      }
      if (isEqualNode) {
        nodes[i] = child
        children.splice(j, 1)
      }
      return isEqualNode
    })
    if (child !== nodes[i]) {
      if (typeof nodes[i] === "string") {
        nodes[i] = new Text(nodes[i])
      }
      parentNode?.insertBefore(nodes[i], child?.nextSibling ?? before ?? null)
    }
  })
  while (children?.length) {
    children.pop()?.remove()
  }
  return nodes?.length ? /** @type {ChildNode[]} */ (nodes) : null
}
/**
 * @template {keyof HTMLElementTagNameMap} TagName
 * @param {TagName} tagName
 * @returns {ElementHTML<TagName>}
 */
export function createElement(tagName) {
  return new ElementHTML(tagName)
}
/**
 * @template {keyof HTMLElementTagNameMap} TagName
 * @overload
 * @param {TagName} tagName
 * @returns {ElementHTML<TagName>}
 */
/**
 * @template {keyof HTMLElementTagNameMap} TagName
 * @overload
 * @param {TagName} tagName
 * @param {Values<{ [name: string]: unknown }>} props
 * @returns {ElementHTML<TagName>}
 */
/**
 * @template {keyof HTMLElementTagNameMap} TagName
 * @overload
 * @param {TagName} tagName
 * @param {Child[]} children
 * @returns {ElementHTML<TagName>}
 */
/**
 * @template {keyof HTMLElementTagNameMap} TagName
 * @overload
 * @param {TagName} tagName
 * @param {Values<{ [name: string]: unknown }>?} [props]
 * @param {...Child} children
 * @returns {ElementHTML<TagName>}
 */
export function h(type, props, ...children) {
  const elt = new ElementHTML(type)
  if (Array.isArray(props)) {
    elt.add(...props)
  } else if (props) {
    elt.properties(props)
  }
  if (children.length) {
    elt.add(...children)
  }
  return elt
}
/**
 * @param {ParentNode} element
 * @returns {Application}
 */
export function createApp(element) {
  return new Application(element)
}
