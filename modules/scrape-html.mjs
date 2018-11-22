const htmlRegex = {
  title: /<title.*>(.*)<\/title>/i,
  ogSiteName: /<meta property="og:site_name" content="?'?([^"']*)"?'?.*>/i,
  color: /<meta name="?'?theme-color"?'? content="?'?([^"']*)"?'?.*>/i,
  icon: /<link rel="?'?icon"?'?[^>]*href="?'?([^"']*)"?'?/i
}

const mockResponse = () => ({ json() { return Promise.reject() } })
const mockJson = () => ({ contents: '' })

const getCorsURL = url => {
  return `https://allorigins.me/get?url=${encodeURIComponent(url)}`
}

const getMatch = match => match ? match[1] : null
const normalize = (base, path) => /^\//.test(path) ? base + path : /^\.\//.test(path) ? url + path.slice(1) : path

const getMetaInfo = async url => {
  const storedData = localStorage.getItem(url)
  if (storedData) return JSON.parse(storedData)

  const response = await fetch(getCorsURL(url)).catch(mockResponse)
  const { contents: html } = await response.json().catch(mockJson)

  const title = getMatch(htmlRegex.title.exec(html))
  const ogSiteName = getMatch(htmlRegex.ogSiteName.exec(html))
  const color = getMatch(htmlRegex.color.exec(html))
  const icon = getMatch(htmlRegex.icon.exec(html))

  const name = ogSiteName || title || null

  const data = {
    name: name || url,
    color,
    icon: normalize(url, icon) || url + '/favicon.ico'
  }
  localStorage.setItem(url, JSON.stringify(data))
  return data
}

export { getMetaInfo }