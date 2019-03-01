const CACHE_NAME = 'fluent-tab-v6'

const staticAssets = [
  '.',
  './index.html',
  './index.css',
  './index.mjs',
  './modules/cheerio.mjs',
  './modules/edit-name.mjs',
  './modules/fluent-button.mjs',
  './modules/scrape-html.mjs',
  './modules/utils.mjs',
  './images/smiley.png',
  './images/background.jpg',
]

// get the filenames to cache from the parcel-manifest and add them to cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(staticAssets))
      .then(() => self.skipWaiting())
  )
})

/* delete old caches on activation */
self.addEventListener('activate', event => {
  const allowedCaches = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then(cacheNames => {
      const cacheDeletePromises = cacheNames.map(cacheName => {
        if (!allowedCaches.includes(cacheName)) {
          return caches.delete(cacheName)
        }
      })
      return Promise.all(cacheDeletePromises)
    })
  )
})

const checkResponseStatus = r =>
  new Promise((res, rej) => {
    if ((r.status >= 200 && r.status < 300) || r.status === 0) res(r)
    else rej(r.statusText)
  })
/* Helper functions to determine whether requests/responses should be cached */
const isRequestCacheable = request => {
  const url = new URL(request.url)
  if (url.protocol === 'chrome-extension:') return false

  return true
}
const isResponseCacheable = response => {
  // don't cache opaque response to prevent exceeding cache size quota
  // see https://cloudfour.com/thinks/when-7-kb-equals-7-mb/
  if (response.status === 0 || response.type === 'opaque') return false

  return true
}

const requestFailingWith404 = event => {
  return fetch(event.request).catch(() => {
    const body = JSON.stringify({
      error: "Sorry, you're offline. Try again once you have a working internet connection.",
    })
    const headers = { 'Content-Type': 'application/json' }
    return new Response(body, { status: 404, statusText: 'Not Found', headers })
  })
}
const requestThenCache = (event, cache) => {
  return fetch(event.request)
    .then(checkResponseStatus)
    .then(response => {
      if (isResponseCacheable(response)) {
        cache.put(event.request, response.clone())
      }
      return response
    })
    .catch(() => cache.match(event.request))
}

self.addEventListener('fetch', event => {
  // if request should not be cached: respond with normal 404 fetch and return
  if (!isRequestCacheable(event.request)) {
    event.respondWith(requestFailingWith404(event))
    return
  }

  // ! ignore query strings
  const requestURL = event.request.url
  const request = requestURL.includes('?')
    ? new Request(requestURL.substring(requestURL.indexOf('?') + 1))
    : event.request

  event.respondWith(
    caches
      .match(request)
      .then(checkResponseStatus)
      .then(response => {
        return caches.open(CACHE_NAME).then(cache => {
          if (navigator.onLine) requestThenCache(event, cache)
          return response
        })
      })
      .catch(() => caches.open(CACHE_NAME).then(cache => requestThenCache(event, cache)))
  )
})
