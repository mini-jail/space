import { createSignal } from "jail/signal"
import { template } from "jail/dom"

type ToDoItem = {
  id: number
  done: boolean
  text: string
}

const list = createSignal<ToDoItem[]>([
  { id: 0, done: true, text: "eat cornflakes without soymilk" },
  { id: 1, done: false, text: "buy soymilk" },
])

const Item = (props: ToDoItem) => {
  const deleteItem = () => list(list().filter((item) => item.id !== props.id))
  const toggleItem = () => list((items) => (props.done = !props.done, items))

  return template`
    <div class="todo-item" id=item_${props.id}>
      <div 
        class="todo-item-text" d-on:click.delegate=${toggleItem}
        style=${props.done ? "color: grey; font-style: italic;" : null}
      >
        ${props.text}
      </div>
      <div d-show=${props.done} class="todo-item-delete" d-on:click=${deleteItem}>
        delete
      </div>
    </div>
  `
}

export default () => {
  const textValue = createSignal("")

  const addItem = (ev: KeyboardEvent) => {
    if (ev.key === "Enter") {
      list(list().concat({ id: Date.now(), done: false, text: textValue() }))
      textValue("")
      return
    }
  }

  function onInput(this: HTMLInputElement) {
    textValue(this.value)
  }
  const length = () => list().length
  const done = () => list().filter((item) => item.done).length
  const ToDoItems = () => list().map((item) => Item(item))

  return template`
    <article class="todo-app">
      <h4>
        todo
        <sub>(no-one ever have done that, i promise!)</sub>
      </h4>
      <div class="todo-app-container">
        <input 
          type="text" placeholder="...milk?"
          required class="todo_input" value=${textValue}
          d-on:keyup=${addItem} d-on:input=${onInput}
        />
        <div class="todo-items">${ToDoItems}</div>
        <label>progress: ${done}/${length}</label>
        <progress max=${length} value=${done}></progress>
      </div>
    </article>
  `
}