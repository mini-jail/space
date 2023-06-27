const RegisteredEvents = {}
const Events = Symbol("Events")

/**
 * @param {string} data
 * @returns {string}
 */
export function toCamelCase(data) {
  return data.replace(/-[a-z]/g, (match) => match.slice(1).toUpperCase())
}

/**
 * @param {string} data
 * @returns {string}
 */
export function toKebabCase(data) {
  return data.replace(/([A-Z])/g, "-$1").toLowerCase()
}

/**
 * @param {Event} event
 */
function eventLoop(event) {
  const type = event.type
  let elt = event.target
  while (elt !== null) {
    elt?.[Events]?.[type]?.call(elt, event)
    elt = elt.parentNode
  }
}

/**
 * @param {jail.DOMElement} elt
 * @param {jail.Binding<jail.DOMElement>} binding
 */
function ref(elt, binding) {
  if (typeof binding.rawValue === "function") {
    binding.rawValue(elt)
  }
  if ("value" in binding.rawValue) {
    binding.rawValue.value = elt
  }
}

/**
 * @param {jail.DOMElement} elt
 * @param {jail.Binding<string>} binding
 */
function style(elt, binding) {
  elt.style[binding.arg] = binding.value || null
}

/**
 * @param {jail.DOMElement} elt
 * @param {jail.Binding} binding
 */
function bind(elt, binding) {
  let prop = binding.arg
  if (binding.modifiers?.camel) {
    prop = toCamelCase(prop)
  }
  if (binding.modifiers?.attr) {
    prop = toKebabCase(prop)
  }
  if (
    binding.modifiers?.prop === true ||
    (prop in elt && binding.modifiers?.attr === false)
  ) {
    elt[prop] = binding.value
  } else {
    elt.setAttribute(prop, String(binding.value))
  }
}

/**
 * @param {jail.DOMElement} elt
 * @param {jail.Binding<string>} binding
 */
function html(elt, binding) {
  elt.innerHTML = binding.value
}

/**
 * @param {jail.DOMElement} elt
 * @param {jail.Binding<string>} binding
 */
function text(elt, binding) {
  elt.textContent = binding.value
}

/**
 * @param {jail.DOMElement} elt
 * @param {jail.Binding<boolean>} binding
 */
function show(elt, binding) {
  elt.style.display = binding.value ? null : "none"
}

/**
 * @param {jail.DOMElement} elt
 * @param {jail.Binding<(event: Event) => void>} binding
 */
function on(elt, binding) {
  if (binding.arg === null) {
    console.info(`missing name: [d-|prefix]on:[arg=name]...`)
    return
  }
  const name = binding.arg
  const modifiers = binding.modifiers
  let identifier = name,
    listener = binding.rawValue,
    eventOptions
  if (modifiers) {
    if (modifiers.prevent) {
      identifier += "-prevent"
      const listenerCopy = listener
      listener = function (event) {
        event.preventDefault()
        listenerCopy.call(elt, event)
      }
    }
    if (modifiers.stop) {
      identifier += "-stop"
      const listenerCopy = listener
      listener = function (event) {
        event.stopPropagation()
        listenerCopy.call(elt, event)
      }
    }
    if (modifiers.once) {
      identifier += "-once"
      eventOptions = eventOptions || {}
      eventOptions.once = true
    }
    if (modifiers.capture) {
      identifier += "-capture"
      eventOptions = eventOptions || {}
      eventOptions.capture = true
    }
    if (modifiers.passive) {
      identifier += "-passive"
      eventOptions = eventOptions || {}
      eventOptions.passive = true
    }
  }
  if (modifiers?.delegate) {
    elt[Events] = elt[Events] || {}
    if (elt[Events][name]) {
      const listenerCopy = elt[Events][name]
      elt[Events][name] = function (event) {
        listenerCopy.call(elt, event)
        listener.call(elt, event)
      }
    } else {
      elt[Events][name] = listener
    }
    if (RegisteredEvents[identifier] === undefined) {
      addEventListener(name, eventLoop, eventOptions)
      RegisteredEvents[identifier] = true
    }
  } else {
    elt.addEventListener(name, listener, eventOptions)
  }
}

/**
 * @type {{ [key: string]: jail.Directive }}
 */
export const directives = { on, ref, show, html, text, style, bind }
