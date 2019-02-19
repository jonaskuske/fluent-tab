import cheerio from "./cheerio.mjs"
import { fetchData, join, isAbsoluteURL } from "./utils.mjs"

const getLargest = array => array.reduce((current, compare) => {
  const currentSize = parseInt(current.sizes)
  const compareSize = parseInt(compare.sizes)
  return (!currentSize || compareSize > currentSize) ? compare : current
})

const getTitle = ($, manifest = {}, url) => {
  const { name, short_name } = manifest
  if (name || short_name) {
    if (name && name.length < 21) return name
    return short_name || name
  }

  return (
    $('meta[property="og:site_name"]').attr('content') ||
    $('meta[name="apple-mobile-web-app-title"]').attr('content') ||
    $('title').text() ||
    url
  )
}
const getColor = ($, manifest = {}) => {
  const { theme_color, background_color } = manifest
  if (theme_color || background_color) return theme_color || background_color

  return $('meta[name="theme-color"]').attr('content')
}
const getIcon = ($, manifest = {}, url) => {
  const { icons, _root } = manifest
  if (icons && icons.length) {
    const path = getLargest(icons).src
    if (_root) return join(_root.replace(/[^\/]*$/, ''), path)
    return path
  }

  const iconList = $('link[rel*="icon"]')
    .map((_, el) => ({ src: $(el).attr('href'), sizes: $(el).attr('sizes') }))
    .get()
    .filter(icon => Boolean(icon.src))

  if (iconList.length) {
    const largest = getLargest(iconList)
    if (largest.sizes) return largest.src
    return $('meta[property="og:image"]').attr("content") || largest.src
  }
  return 'favicon.ico'
}

const scrapeHTML = async url => {
  const storedData = JSON.parse(localStorage.getItem(url))
  if (storedData) return storedData

  try {
    const html = await fetchData(url)
    const $ = cheerio.load(html)

    let manifest
    const manifestPath = $('link[rel=manifest]').attr('href')

    if (manifestPath) {
      const response = await fetchData(join(url, manifestPath))
      if (response) manifest = JSON.parse(response)
      if (isAbsoluteURL(manifestPath)) manifest._root = manifestPath
    }

    const iconPath = getIcon($, manifest, url)
    const name = getTitle($, manifest, url)
    const color = getColor($, manifest, url)
    const icon = join(url, iconPath)

    const data = { name, color, icon }
    localStorage.setItem(url, JSON.stringify(data))

    return data
  } catch (_) {
    return { name: url, icon: join(url, 'favicon.ico') }
  }
}

export default scrapeHTML