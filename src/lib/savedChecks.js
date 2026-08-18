/**
 * Saved receipt checks. localStorage only.
 *
 * The whole point of TrueCost is that nothing about the transfer leaves the
 * browser, so the archive keeps that promise: a saved check lives on this
 * device, is never sent anywhere, and delete means gone. That also means the
 * list does not follow anyone between devices, which the page says out loud
 * rather than leaving someone to wonder where their checks went.
 */

const KEY = 'truecost.savedChecks.v1'

/** Storage can be full, blocked, or in private mode. None of that may throw. */
function read() {
  try {
    const raw = localStorage.getItem(KEY)
    const list = raw ? JSON.parse(raw) : []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
    return true
  } catch {
    return false
  }
}

export function loadChecks() {
  return read()
}

/** Newest first. Capped so a heavy user cannot fill the origin's quota. */
export function saveCheck(entry) {
  const list = read()
  const row = {
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
    ...entry,
  }
  const next = [row, ...list].slice(0, 100)
  return write(next) ? row : null
}

export function removeCheck(id) {
  write(read().filter((r) => r.id !== id))
}

export function clearChecks() {
  write([])
}
