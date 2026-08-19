/**
 * A flag for a currency code.
 *
 * ISO 4217 currency codes are built from the ISO 3166 country code plus a
 * letter for the currency itself, so the first two characters are the country
 * for all but a handful: USD is US, INR is IN, PHP is PH. Those two characters
 * map to regional indicator symbols, which render as a flag.
 *
 * The exceptions below are the codes where that rule produces nonsense. Some
 * are shared across many countries and have no flag to show. Four are not
 * currencies at all but commodity codes for the metals, which the rate API
 * returns alongside the real ones.
 *
 * Anything without a flag returns null and the caller shows the code alone. A
 * missing flag must never remove the currency from a list: the code is the
 * thing people actually pick by.
 */
const NO_FLAG = new Set([
  'XAF', // Central African CFA franc, six countries
  'XOF', // West African CFA franc, eight countries
  'XPF', // CFP franc, French Pacific territories
  'XCD', // East Caribbean dollar, eight countries
  'XCG', // Caribbean guilder
  'XDR', // IMF special drawing rights, not a national currency
  'ANG', // Netherlands Antillean guilder, the country no longer exists
  'XAU', // gold
  'XAG', // silver
  'XPT', // platinum
  'XPD', // palladium
])

/**
 * @param {string} code Three-letter currency code.
 * @returns {string|null} The flag as emoji, or null where none applies.
 */
export function currencyFlag(code) {
  if (typeof code !== 'string' || !/^[A-Za-z]{3}$/.test(code)) return null
  const upper = code.toUpperCase()
  if (NO_FLAG.has(upper)) return null

  /*
   * Regional indicators live at U+1F1E6 for A, which is 0x1F1A5 above the
   * ASCII letters. Two of them side by side are rendered as one flag.
   *
   * Windows has no flag glyphs and shows the two letters instead, which is
   * why the code is always printed next to this rather than replaced by it.
   */
  return String.fromCodePoint(
    ...[...upper.slice(0, 2)].map((ch) => ch.charCodeAt(0) + 0x1f1a5),
  )
}
