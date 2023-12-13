import html from "space/dom"
import { onMount, onUnmount } from "space/signal"

export default function NotFound() {
  const { backgroundColor } = document.body.style
  onMount(() => document.body.style.backgroundColor = "indianred")
  onUnmount(() => document.body.style.backgroundColor = backgroundColor)

  return html`
    <article>
      <h4>
        Page not found :(
        <sub>(ha-ha!)</sub>
      </h4>
      <p>There is no content for "${location}".</p>
    </article>
  `
}
