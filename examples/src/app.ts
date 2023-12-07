import { createEffect } from "jail/signal"
import html, { createDirective, Directive, mount } from "jail/dom"
import { installDOMRouter, path } from "jail/dom-router"

import Home from "./routes/home.ts"
import Counter from "./routes/counter.ts"
import SimpleCounter from "./routes/simple-counter.ts"
import Sierpinski from "./routes/sierpinski.ts"
import About from "./routes/about.ts"
import ToDo from "./routes/todo.ts"
import NotFound from "./routes/notfound.ts"

const App = () => {
  createEffect(() => {
    document.title = `jail${path()}`
  })

  const routeMap = {
    "/": Home,
    "/counter": Counter,
    "/counter/simple": SimpleCounter,
    "/sierpinski": Sierpinski,
    "/sierpinski/:target": Sierpinski,
    "/sierpinski/:target/:size": Sierpinski,
    "/about": About,
    "/todo": ToDo,
  }

  const pathAnimation = (): Keyframe[] => {
    path()
    return [
      { opacity: 0, transform: "translateY(-10px)" },
      { opacity: 1, transform: "unset" },
    ]
  }

  const duration = () => `duration(${(Math.random() * 3000).toFixed(0)})`

  return html`
    <header>
      <h3>jail${path}</h3>
      <nav>
        <a href="/">home</a>
        <a href="/counter">counter</a>
        <a href="/sierpinski">sierpinski</a>
        <a href="/todo">todo</a>
        <a href="/about">about</a>
      </nav>
    </header>
    <main d-${animate}.fillBoth.${duration}=${pathAnimation}>
      <Router type="pathname" fallback=${NotFound} routeMap=${routeMap} />
    </main>
  `
}

const delayRegExp = /delay\((\d+)\)/
const durationRegExp = /duration\((\d+)\)/
const animate: Directive<Keyframe[]> = (elt, binding) => {
  const options: KeyframeAnimationOptions = {}
  const modifiers = binding.modifiers
  if (modifiers) {
    if (modifiers.fillBoth) {
      options.fill = "both"
    }
    for (const key in modifiers) {
      if (delayRegExp.test(key)) {
        options.delay = +(delayRegExp.exec(key)![1]!)
      } else if (durationRegExp.test(key)) {
        options.duration = +(durationRegExp.exec(key)![1]!)
      }
    }
  }
  elt.animate(binding.value, options)
}

mount(document.body, () => {
  installDOMRouter()
  return App()
})
