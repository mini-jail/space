import { computed, state } from "space/signal"
import html, { DOMEvent, For } from "space/dom"

type ToDoItem = {
  id: number
  done: boolean
  text: string
}

let itemID = 0

const list = state<ToDoItem[]>([
  { id: itemID++, done: true, text: "eat cornflakes without soymilk" },
  { id: itemID++, done: false, text: "buy soymilk" },
])

const Item = (props: ToDoItem) => {
  const deleteItem = (_ev: Event) => {
    list.value = list.value.filter((item) => item.id !== props.id)
  }
  const toggleItem = (_ev: Event) => {
    const item = list.value.find((item) => item.id === props.id)
    // can't simply "props.done = !props.done", because this is readonly
    if (item) {
      item.done = !item.done
      list.value = list.value.slice()
    }
  }
  return html`
    <div class="todo-item" id="${"item_" + props.id}">
      <div
        @click=${toggleItem}
        class="todo-item-text"
        style="${props.done ? "color: grey; font-style: italic;" : null}">
        ${props.text}
      </div>
      <div
        @click=${deleteItem}
        class="todo-item-delete"
        style:display=${props.done ? null : "none"}>
        delete
      </div>
    </div>
  `
}

export default function ToDo() {
  const text = state("")
  const addItem = () => {
    list.value = list.value.concat({
      id: itemID++,
      done: false,
      text: text.value,
    })
    text.value = ""
  }
  const onInput = (ev: DOMEvent<HTMLInputElement>) => {
    text.value = ev.target.value
  }
  const length = computed(() => list.value.length)
  const done = computed(() => {
    return list.value.filter((item) => item.done).length
  })

  return html`
    <article>
      <h4>
        todo
        <sub>(no-one ever have done that, i promise!)</sub>
      </h4>
      <div class="todo-app-container">
        <form @submit.prevent=${addItem}>
          <input
            type="text"
            placeholder="...milk?"
            required
            class="todo_input"
            .value=${text}
            @input=${onInput}
          />
        </form>
        <div class="todo-items">
          <${For} each=${list} fallback="No Items" children=${Item} />
        </div>
        <label>progress: ${done}/${length}</label>
        <progress max=${length} value=${done}></progress>
      </div>
    </article>
  `
}
