import { createComputed, createSignal } from "jail/signal"
import html, { Show } from "jail/dom"

const code = `
import { createSignal } from "jail/signal"
import html from "jail/dom"

function Counter() {
  const counter = createSignal(0)
  const up = (ev) => counter(value => ++value)
  const down = (ev) => counter(value => --value)

  return html\`
    <button on:click=\${down}>-</button>
    <span>current value: \${counter}</span>
    <button on:click=\${up}>+</button>
  \`
}`.trim()

export default function Component() {
  const counter = createSignal(0)
  const show = createSignal(false)
  const up = (_event: Event) => counter((value) => ++value)
  const down = (_event: Event) => counter((value) => --value)
  const clicked = createComputed((currentValue) => {
    counter()
    return currentValue + 1
  }, -1)

  return html`
    <article data-user="user has clicked ${clicked} times (counter equals ${counter})">
      <h4>
        counter example
        <sub>(...what else?)</sub>
        <button on:clickDelegate=${(_ev: Event) => show((value) => !value)}>
          ${() => (show() ? "hide" : "show")} code
        </button>
      </h4>
      <button on:clickDelegate=${down}>-</button>
      <span>current value: ${counter}</span>
      <button on:clickDelegate=${up}>+</button>
      <div>> you have clicked ${clicked} times.</div>
      ${() => clicked() >= 10 && html`<div>... why do you do this?????</div>`}
      ${() => clicked() >= 20 && html`<div>... pls stop T_T</div>`}
      ${() => clicked() >= 30 && html`<div>... enough :(</div>`}
      ${() => clicked() >= 40 && html`<div>... it hurts @_@</div>`}
      <code use:${Show}="${show}">
        ${code.split("\n").map((line) => html`<pre>${line}</pre>`)}
      </code>
    </article>
  `
}
