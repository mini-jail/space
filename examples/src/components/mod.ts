import { type Child, createElement, h } from "space/element"
import { Context } from "space/signal/context"
import { computed, effect, onCleanup, State, state } from "space/signal"

type TriangleProps = { x: number; y: number; target: number; size: number }
type DotProps = { x: number; y: number; target: number }
interface AnimateProps extends KeyframeAnimationOptions {
  state?: State
  keyframes: Keyframe[]
}
interface PageProps {
  title: string
  description: string
}

const counterContext = new Context({ value: 0 })

export function animate(elt: HTMLElement, props: AnimateProps) {
  const { keyframes, state, ...options } = props
  state?.value
  elt.animate(keyframes, options)
}

export function Page(props: PageProps, ...children: Child[]) {
  return h("article", [
    h("h4", [props.title, h("sub", [props.description]), ...children]),
  ])
}

export function Paragraph(
  stringArray: TemplateStringsArray,
  ...children: Child[]
) {
  return createElement("p").add(...stringArray.map((string, index) => {
    if (children[index] != null) {
      return [string, children[index]]
    }
    return string
  }))
}

export function Anchor(href: string, ...children: Child[]) {
  return createElement("a").property("href", href).add(...children)
}

function Dot({ x, y, target }: DotProps) {
  const counter = counterContext.inject()
  const hover = state(false)
  const text = computed(() => {
    return hover.value ? "*" + counter.value + "*" : counter.value + ""
  })
  const cssText = `
    width: ${target}px;
    height: ${target}px;
    line-height: ${target}px;
    left: ${x}px;
    top: ${y}px;
    font-size: ${(target / 2.5)}px;
    border-radius: ${target}px;
  `
  return createElement("div")
    .add(text)
    .attribute("class", "sierpinski-dot")
    .style("cssText", cssText)
    .style("backgroundColor", () => hover.value ? "lightpink" : "white")
    .on("mouseover", () => hover.value = true)
    .on("mouseout", () => hover.value = false)
}

function* Triangle({ x, y, target, size }: TriangleProps) {
  if (target <= size) {
    return yield Dot({ x, y, target })
  }
  target = target / 2
  yield* Triangle({ x, y: y - target / 2, target, size })
  yield* Triangle({ x: x - target, y: y + target / 2, target, size })
  yield* Triangle({ x: x + target, y: y + target / 2, target, size })
}

export function SierpinskiTriangle() {
  let id: number
  const elapsed = state(0)
  const count = state(0)
  const scale = computed(() => {
    const e = (elapsed.value / 1000) % 10
    return (1 + (e > 5 ? 10 - e : e) / 10) / 2
  })
  counterContext.provide(count)
  effect(() => {
    console.log("Sierpinski is alive")
    id = setInterval(() => count.value = (count.value % 10) + 1, 1000)
    const start = Date.now()
    const frame = () => {
      elapsed.value = Date.now() - start
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  })
  onCleanup(() => {
    clearInterval(id)
    console.log("Sierpinski is dead")
  })
  return createElement("div")
    .attribute("class", "sierpinski-wrapper")
    .style("transform", () => `scale(${scale.value}) translateZ(0.1px)`)
    .add(Triangle({ x: 0, y: 0, target: 750, size: 25 }))
}