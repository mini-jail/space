/// <reference path="./types.d.ts" />
import { cleanup, effect, root } from "space/signal"
import {
  isResolvable,
  resolve,
  setPropertyOrAttribute,
} from "../helpers/mod.js"
import { placeholderRegExp } from "../regexp/mod.js"
import { createTemplate } from "../template/mod.js"
import namespaces from "../namespaces/mod.js"
import components from "../components/mod.js"

/**
 * @param {space.DocumentFragment} fragment
 * @param {space.Template} template
 * @param {space.Slot[]} slots
 * @returns {space.RenderResult}
 */
function createRenderResult(fragment, template, slots) {
  fragment.querySelectorAll(`[${template.hash}]`)
    .forEach((elt) => renderElement(elt, template, slots))
  switch (fragment.childNodes.length) {
    case 0:
      return
    case 1:
      return fragment.childNodes[0]
    default:
      return Array.from(fragment.childNodes)
  }
}

/**
 * @param {space.TemplateElement} elt
 * @param {space.Template} template
 * @param {space.Slot[]} slots
 */
function renderElement(elt, template, slots) {
  const data = template.data[elt.getAttribute(template.hash)]
  if (typeof data === "number") {
    renderChild(elt, slots[data])
  } else if (Array.isArray(data)) {
    elt.removeAttribute(template.hash)
    for (const attribute of data) {
      setElementData(elt, attribute, slots)
    }
  } else {
    const component = typeof data.name === "string"
      ? components[data.name]
      : slots[data.name]
    if (typeof component !== "function") {
      throw new TypeError(`Component is not a function!`)
    }
    root(() => {
      const props = component.length
        ? createProps(elt, data, template, slots)
        : undefined
      renderChild(elt, component(props))
    })
  }
}

/**
 * @param {space.TemplateElement} elt
 * @param {space.ComponentData} data
 * @param {space.Template} template
 * @param {space.Slot[]} slots
 * @returns {object}
 */
function createProps(elt, data, template, slots) {
  const props = { children: createRenderResult(elt.content, template, slots) }
  for (const prop in data.props) {
    const type = data.props[prop]
    let value = typeof type === "number" ? slots[type] : type
    if (prop === "children" && props.children) {
      value = [props.children, value]
    }
    Object.defineProperty(props, prop, {
      get() {
        return resolve(value)
      },
    })
  }
  return props
}

/**
 * @param {space.Element} elt
 * @param {space.AttributeData} attribute
 * @param {space.Slot[]} slots
 */
function setElementData(elt, attribute, slots) {
  const value = createValue(attribute, slots), name = attribute.name
  if (attribute.namespace !== null) {
    /**
     * @type {space.Namespace | undefined}
     */
    // @ts-expect-error: hi ts, i'm sorry
    const namespace = typeof attribute.namespace === "string"
      ? namespaces[attribute.namespace]
      : slots[attribute.namespace]
    if (typeof namespace !== "function") {
      throw new TypeError(`Namespace is not a function!`)
    }
    const arg = typeof name === "string" ? name : slots[name]
    effect(() => namespace(elt, resolve(arg), resolve(value)))
  } else if (isResolvable(value)) {
    effect((currentValue) => {
      const nextValue = value.value
      if (currentValue !== nextValue) {
        // @ts-expect-error: name can be only a string here
        setPropertyOrAttribute(elt, name, nextValue)
      }
      return nextValue
    })
  } else {
    // @ts-expect-error: name can be only a string here... too
    setPropertyOrAttribute(elt, name, value)
  }
}

/**
 * @param {space.AttributeData} attribute
 * @param {space.Slot[]} slots
 * @returns {space.Slot}
 */
function createValue(attribute, slots) {
  if (typeof attribute.value === "boolean") {
    return attribute.value
  } else if (typeof attribute.value === "number") {
    return slots[attribute.value]
  } else if (attribute.slots === null) {
    return attribute.value
  } else if (attribute.slots.some((slot) => isResolvable(slots[slot]))) {
    return {
      get value() {
        return String.prototype.replace.call(
          attribute.value,
          placeholderRegExp,
          (_match, slot) => resolve(slots[slot]) + "",
        )
      },
    }
  }
  return String.prototype.replace.call(
    attribute.value,
    placeholderRegExp,
    (_match, slot) => slots[slot] + "",
  )
}

/**
 * @param {Node[]} nodeArray
 * @param  {...any} elements
 * @returns {Node[]}
 */
export function createNodeArray(nodeArray, ...elements) {
  for (const elt of elements) {
    if (elt == null || typeof elt === "boolean") {
      continue
    } else if (elt instanceof Node) {
      nodeArray.push(elt)
    } else if (typeof elt === "string" || typeof elt === "number") {
      nodeArray.push(new Text(elt + ""))
    } else if (typeof elt === "function") {
      createNodeArray(nodeArray, elt())
    } else if (Symbol.iterator in elt) {
      createNodeArray(nodeArray, ...elt)
    } else if (isResolvable(elt)) {
      createNodeArray(nodeArray, elt.value)
    }
  }
  return nodeArray
}

/**
 * @param {space.Element} targetElt
 * @param {any} child
 */
function renderChild(targetElt, child) {
  if (child == null || typeof child === "boolean") {
    targetElt.remove()
  } else if (child instanceof Node) {
    targetElt.replaceWith(child)
  } else if (typeof child === "string" || typeof child === "number") {
    targetElt.replaceWith(child + "")
  } else if (
    isResolvable(child) ||
    Symbol.iterator in child ||
    typeof child === "function"
  ) {
    const anchor = new Text()
    targetElt.replaceWith(anchor)
    mount(null, () => child, anchor)
  } else {
    targetElt.replaceWith(String(child))
  }
}

/**
 * @param {TemplateStringsArray} templateStringsArray
 * @param  {...space.Slot} slots
 * @returns {space.RenderResult}
 */
export function template(templateStringsArray, ...slots) {
  const template = createTemplate(templateStringsArray)
  return createRenderResult(
    template.fragment.cloneNode(true),
    template,
    slots,
  )
}

/**
 * @param {Element | null} rootElement
 * @param {() => any} code
 * @param {ChildNode | null} [anchor]
 */
export function mount(rootElement, code, anchor) {
  effect(() => {
    let children = []
    cleanup(() => {
      children.forEach((node) => node.remove())
      anchor?.remove()
    })
    effect(() => {
      const nextNodes = createNodeArray([], code())
      reconcile(
        rootElement ?? anchor?.parentElement ?? null,
        anchor ?? null,
        children,
        nextNodes,
      )
      children = nextNodes
    })
  })
}

/**
 * @param {ParentNode | null} rootElement
 * @param {(ChildNode & { data?: string }) | null} anchor
 * @param {(ChildNode & { data?: string })[] | undefined} currentNodes
 * @param {(Node & { data?: string })[] | undefined} nextNodes
 */
function reconcile(rootElement, anchor, currentNodes, nextNodes) {
  nextNodes?.forEach((nextNode, i) => {
    const child = currentNodes?.[i]
    currentNodes?.some((currentNode, j) => {
      if (currentNode.nodeType === 3 && nextNode.nodeType === 3) {
        currentNode.data = nextNode.data
      } else if (currentNode.nodeType === 8 && nextNode.nodeType === 8) {
        currentNode.data = nextNode.data
      }
      if (currentNode.isEqualNode(nextNode)) {
        nextNodes[i] = currentNode
        currentNodes.splice(j, 1)
        return true
      }
      return false
    })
    if (nextNodes[i] !== child) {
      rootElement?.insertBefore(nextNodes[i], child?.nextSibling ?? anchor)
    }
  })
  currentNodes?.forEach((childNode) => childNode.remove())
}
