/**
 * Server-side proxy to the BobCI backend. Injects BOBCI_API_KEY without exposing it to the browser.
 */
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8000'

export default async function handler(req, res) {
  const segments = Array.isArray(req.query.path) ? req.query.path : []
  const targetPath = segments.join('/')
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
  const url = `${BACKEND_URL}/${targetPath}${query}`

  const headers = {
    'Content-Type': 'application/json',
  }
  if (process.env.BOBCI_API_KEY) {
    headers['X-API-Key'] = process.env.BOBCI_API_KEY
  }

  const init = { method: req.method, headers }
  if (!['GET', 'HEAD', 'DELETE'].includes(req.method) && req.body) {
    init.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
  }

  try {
    const response = await fetch(url, init)

    const data = await response.text()
    res.status(response.status)
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json')
    res.send(data)
  } catch (error) {
    res.status(502).json({ detail: 'Backend unavailable', error: error.message })
  }
}
