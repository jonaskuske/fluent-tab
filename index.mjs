import { $, getBrightness } from './modules/helpers.mjs'
import { getMetaInfo } from './modules/scrape-html.mjs'
import { FluentButton } from './modules/button/button.mjs'
import './modules/edit-name.mjs'

const sites = [
  'https://facebook.com',
  'https://github.com',
  'https://m.twitter.com',
  'https://youtube.com',
  'https://theverge.com',
  'https://sleak-mag.design',
  'https://medium.com',
  'https://drive.google.com/drive'
]

document.addEventListener('DOMContentLoaded', async () => {
  const container = $('#sites')

  for (const url of sites) {
    const anchor = document.createElement('a')
    container.append(anchor)

    anchor.className = 'site'
    anchor.href = url

    const { name: text, color, icon } = await getMetaInfo(url)

    new FluentButton(anchor, { text, nodeType: 'div', icon, outerReveal: true })

    const setProperty = (prop, val) => anchor.style.setProperty(prop, val)
    if (color) {
      setProperty('--color', color)

      if (color[0] == '#') {
        const brightness = getBrightness(color)
        if (brightness > 200) setProperty('--txt-clr', '#000000')
        if (brightness < 50) setProperty('--icon-bg', 'rgba(255,255,255,0.2)')
      }
    }
  }
})
