const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/**
 * An ISO date as prose, without going through Date.
 *
 * `new Date('2026-08-21')` is parsed as UTC midnight, so formatting it in any
 * timezone behind UTC prints the day before. A post published on the 21st
 * showing as the 20th to half the world is the kind of bug that survives for
 * months because whoever wrote it was in the right timezone to miss it.
 * Splitting the string has no such failure mode.
 */
export function formatPostDate(iso) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return null
  return `${d} ${MONTHS[m - 1]} ${y}`
}
