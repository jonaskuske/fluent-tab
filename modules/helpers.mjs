export const $ = document.querySelector.bind(document)
export const $$ = document.querySelectorAll.bind(document)

export const debounce = (fn, wait = 0) => {
  let timeout

  return function (...args) {
    const later = () => {
      timeout = null
      fn.apply(this, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const getBrightness = color => {
  const dec = parseInt(color.substring(1), 16) // convert #rrggbb to decimal
  const r = (dec >> 16) & 0xff // extract red
  const g = (dec >> 8) & 0xff // extract green
  const b = (dec >> 0) & 0xff // extract blue
  const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return brightness
}