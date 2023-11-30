export const $ = document.querySelector.bind(document)
export const $$ = document.querySelectorAll.bind(document)
export const wait = time => new Promise(resolve => setTimeout(resolve, time))
export const isAbsoluteURL = path => /^(https?\:)?\/\//.test(path)

const getCorsURL = url => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
const getFallbackURL = url => `https://cors-anywhere.herokuapp.com/${url}`

const validateResponse = response => {
  if (response.ok) return response
  throw response
}

export const fetchData = async url => {
  try {
    const response = await fetch(getCorsURL(url)).then(validateResponse)
    const body = await response.json()
    if (body.contents?.match(/^data:.+;base64,/)) {
			return atob(body.contents.replace(/^data:.+;base64,/, ""))
		}
			return body.contents
  } catch (error) {
    const response = await fetch(getFallbackURL(url)).then(validateResponse)
    return response.text()
  }
}

export const join = (base, path) => {
  if (isAbsoluteURL(path)) return path
  base = base.replace(/(.)\/?$/, '$1/') // Ensure trailing slash
  path = path.replace(/^\.?\//, '') // Remove leading "/" or "./"
  return base + path
}

export const debounce = (fn, wait = 0) => {
  let timeout

  return function(...args) {
    const later = () => {
      timeout = null
      fn.apply(this, args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
export const setStyleProperty = (target, prop, val) => {
  target.style.setProperty(prop, val)
  return target
}

export const getBrightness = color => {
  const dec = parseInt(color.substring(1), 16) // convert #rrggbb to decimal
  const r = (dec >> 16) & 0xff // extract red
  const g = (dec >> 8) & 0xff // extract green
  const b = (dec >> 0) & 0xff // extract blue
  const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return brightness
}
