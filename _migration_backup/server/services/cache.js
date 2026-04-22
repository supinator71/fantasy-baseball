// Simple in-memory TTL cache for Yahoo API responses
const store = new Map()

function get(key) {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry
}

function set(key, value, ttlMs) {
  store.set(key, {
    value,
    cachedAt: new Date().toISOString(),
    expiresAt: Date.now() + ttlMs,
  })
}

function del(key) {
  store.delete(key)
}

// Delete all keys that contain a given substring (e.g. a leagueKey)
function clear(substring) {
  if (!substring) {
    store.clear()
    return
  }
  for (const k of store.keys()) {
    if (k.includes(substring)) store.delete(k)
  }
}

function stats() {
  const now = Date.now()
  const entries = []
  for (const [key, entry] of store.entries()) {
    const ttlLeft = Math.max(0, Math.round((entry.expiresAt - now) / 1000))
    entries.push({ key, cachedAt: entry.cachedAt, ttlLeft })
  }
  return entries
}

module.exports = { get, set, del, clear, stats }
