/**
 * @param {space.Element} elt
 * @param {string | number | symbol} arg
 * @param {unknown} value
 */
export function prop(elt, arg, value) {
  elt[arg] = value
}
