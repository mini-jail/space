import {
  createComputed,
  createEffect,
  createScope,
  createSignal,
  onDestroy,
  onMount,
} from "signal";
import { directive, template } from "signal/dom";
import { getParams } from "signal/router";

/**
 * @template T
 * @param {T & (fn: (...args: any[]) => any)} fn
 * @returns {T}
 */
const component = (fn) => (...args) => createScope(() => fn(...args));

directive("style", (elt, styles) => {
  createEffect(() => elt.setAttribute("style", styles()));
});

const Dot = component((x, y, target, counterSignal) => {
  const hover = createSignal(false);
  const onMouseOut = () => hover(false);
  const onMouseOver = () => hover(true);
  const text = () => hover() ? "*" + counterSignal() + "*" : counterSignal();

  const style = () => `
    width: ${target}px;
    height: ${target}px;
    line-height: ${target}px;
    background-color: ${hover() === true ? "cornflowerblue" : "thistle"};
    left: ${x}px;
    top: ${y}px;
    font-size: ${(target / 2.5)}px;
    border-radius: ${target}px;
  `;

  return template`
    <div class="dot"
        .textContent="${text}"
        *style="${style}"
        @mouseover.delegate="${onMouseOver}" 
        @mouseout.delegate="${onMouseOut}"></div>
  `;
});

const Triangle = component((x, y, target, size, counterSignal) => {
  if (target <= size) {
    return Dot(x, y, target, counterSignal);
  }
  target = target / 2;
  return template`
    ${Triangle(x, y - target / 2, target, size, counterSignal)}
    ${Triangle(x - target, y + target / 2, target, size, counterSignal)}
    ${Triangle(x + target, y + target / 2, target, size, counterSignal)}
  `;
});

export default () => {
  const { target = "750", size = "25" } = getParams() || {};
  let id;
  const elapsed = createSignal(0);
  const count = createSignal(0);
  const scale = createComputed(() => {
    const e = (elapsed() / 1000) % 10;
    return 1 + (e > 5 ? 10 - e : e) / 10;
  });

  onMount(() => {
    console.log("mount: TriangleDemo");
    id = setInterval(() => count((count() % 10) + 1), 1000);
    const start = Date.now();
    const frame = () => {
      elapsed(Date.now() - start);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  });

  onDestroy(() => {
    console.log("destroy:TriangleDemo");
    clearInterval(id);
  });

  const style = () =>
    `transform: scaleX(${scale() / 2.1}) scaleY(0.7) translateZ(0.1px);`;

  return template`
    <style>
      .triangle-demo {
        position: absolute;
        left: 50%;
        top: 50%;
      }
      .dot {
        position: absolute;
        text-align: center;
        cursor: pointer;
        user-select: none;
      }
    </style>
    <div class="triangle-demo" *style="${style}">
      ${Triangle(0, 0, Number(target), Number(size), count)}
    </div>
  `;
};