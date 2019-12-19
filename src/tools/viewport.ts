/**
 * 过滤原素是否在可视区范围内
 *
 * @export
 * @template T
 * @param {T[]} element
 * @param {number} clientHeight
 * @returns
 */
export function filterInClientView<T extends HTMLElement>(elements: T[], clientHeight: number) {
  return elements.filter(el => {
    if (
      el.getBoundingClientRect().top >= 0 &&
      el.getBoundingClientRect().top <= clientHeight
    ) {
      if (
        el.getBoundingClientRect().bottom <= clientHeight ||
        el.getBoundingClientRect().bottom >= clientHeight
      ) {
        return el;
      }
    }

    if (
      el.getBoundingClientRect().top <= 0 &&
      el.getBoundingClientRect().bottom >= 0
    ) {
      if (
        el.getBoundingClientRect().bottom <= clientHeight ||
        el.getBoundingClientRect().bottom >= clientHeight
      ) {
        return el;
      }
    }
  });
}
