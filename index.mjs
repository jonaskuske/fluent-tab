import scrapeHTML from './modules/scrape-html.mjs'
import FluentButton from './modules/fluent-button.mjs'
import { $, wait, join, getBrightness, setStyleProperty } from './modules/utils.mjs'
import './modules/edit-name.mjs'

async function insertThumbnails() {
  document.body.classList.add('spinner')
  const container = $('#sites')

  const loadPromises = []

  for (const url of window.siteConfig._SITES) {
    const anchor = document.createElement('a')
    container.append(anchor)

    anchor.className = 'site'
    anchor.href = url

    let button
    let loaded = false

    const loadPlaceholderButton = wait(100).then(() => {
      if (loaded) return
      button = new FluentButton(anchor, {
        text: url,
        icon: join(url, 'favicon.ico'),
        nodeType: 'div',
        outerReveal: true,
      })
    })

    const loadConfiguredButton = scrapeHTML(url).then(({ name, color, icon }) => {
      loaded = true
      if (button) button.destroy()

      button = new FluentButton(anchor, { text: name, icon, nodeType: 'div', outerReveal: true })

      if (color) {
        setStyleProperty(anchor, '--color', color)

        if (color[0] === '#') {
          const brightness = getBrightness(color)
          if (brightness > 200) setStyleProperty(anchor, '--txt-clr', '#000000')
          if (brightness < 50) setStyleProperty(anchor, '--icon-bg', 'rgba(255,255,255,0.2)')
        }
      }
    })

    // TODO: Use Promise.any() instead of Promise.race()
    loadPromises.push(Promise.race([loadPlaceholderButton, loadConfiguredButton]))
  }

  await Promise.all(loadPromises)
  document.body.classList.remove('invisible')
  document.body.classList.remove('spinner')
}

async function detectWindows11() {
  const canCheck = navigator?.userAgentData?.platform === "Windows" && navigator?.userAgentData?.getHighEntropyValues

  if (!localStorage.getItem('windows-11') && canCheck) {
    const ua = await navigator.userAgentData.getHighEntropyValues(["platformVersion"])
    const majorPlatformVersion = parseInt(ua.platformVersion.split('.')[0]);
    localStorage.setItem('windows-11', majorPlatformVersion >= 13)
  }

  if (localStorage.getItem('windows-11') === 'true') document.body.classList.add('windows-11')
}

document.addEventListener('DOMContentLoaded', async () => {
  detectWindows11()
  insertThumbnails()
  window._refreshThumbnails = () => {
    $('#sites').innerHTML = ''
    insertThumbnails()
  }
})

try {
  document.querySelector(':focus-visible')
} catch (_) {
  const scriptElement = document.createElement('script')
  scriptElement.src = 'https://unpkg.com/focus-visible'
  scriptElement.async = true
  document.head.append(scriptElement)
}

window._reset = async () => {
  localStorage.clear()
  if ('serviceWorker' in navigator) {
    const regs = await navigator.serviceWorker.getRegistrations()
    for (const reg of regs) await reg.unregister()
  }
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    for (const name of cacheNames) await caches.delete(name)
  }
  location.reload()
}
