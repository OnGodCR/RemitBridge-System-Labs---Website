/**
 * Corridor-level provider prices, from the World Bank's Remittance Prices
 * Worldwide survey.
 *
 * This file was empty for a long time, on purpose: a comparison populated
 * with anything but the survey would have been an invented number. The data
 * is here now, but not in this file. `scripts/rpw.mjs` turns the survey's
 * spreadsheet into `public/data/rpw/index.json` (every corridor's averages,
 * ~90 KB) and one file per corridor (that corridor's provider records and its
 * history, 10 to 40 KB each), and the functions below fetch them on demand.
 *
 * That is the decision that makes all of the survey's corridors affordable
 * rather than a hand-picked few. Nothing here enters the JavaScript bundle; a
 * reader who prices one corridor downloads that corridor, and one who never
 * opens TrueCost downloads none of it. Adding a quarter or a corridor is a
 * rerun of the script, not a change to the site.
 *
 * ---------------------------------------------------------------------------
 * Attribution, required wherever any of this data is displayed. It ships
 * inside every file as `vintage.attribution` so a page cannot have the data
 * without having the line:
 *
 *   The World Bank, Remittance Prices Worldwide, available at
 *   http://remittanceprices.worldbank.org
 *
 * The terms of use also forbid any implication that the World Bank endorses
 * this site, this lab, or any conclusion drawn from the data. Present it as a
 * source that was consulted, never as a partner or a validator.
 * ---------------------------------------------------------------------------
 *
 * The vintage is not optional. A price from a year ago presented without a
 * date is worse than no price, because it looks current, so `vintage.quarter`
 * renders next to anything drawn from here.
 *
 * @typedef {Object} ServiceRecord
 * @property {string}  provider
 * @property {'bank'|'mto'|'mobile operator'|'post office'|string} providerType
 * @property {200|500} surveyedAmount   The two amounts the survey prices.
 * @property {string}  sendCurrency
 * @property {number}  sendAmount       In the sending currency.
 * @property {number}  fee              In the sending currency.
 * @property {number}  fxMarginPct      Markup over the interbank rate.
 * @property {number}  totalCostPct     Fee plus margin, as a share of the amount.
 * @property {string}  deliveryMethod
 * @property {string}  speedBand
 * @property {boolean} transparent      Whether the exchange rate is disclosed
 *                                      before the customer commits. This is
 *                                      the argument of the TrueCost page, so
 *                                      it is a field and not a footnote.
 *
 * @typedef {Object} Benchmark
 * @property {number|null} averageCostPct    Mean of every service, as the
 *                                           survey's own corridor figure.
 * @property {number|null} cheapestThreePct  Mean of the three cheapest
 *                                           transparent services delivering
 *                                           within five days. Our reading of
 *                                           the survey's SmaRT rule, not its
 *                                           published number.
 * @property {number}      services
 */

const BASE = '/data/rpw'

const cache = new Map()

async function getJson(path) {
  if (cache.has(path)) return cache.get(path)
  const promise = fetch(path)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null)
  cache.set(path, promise)
  return promise
}

/** Every corridor the survey has ever priced, with this quarter's averages. */
export const loadIndex = () => getJson(`${BASE}/index.json`)

/** One corridor's providers and history. `code` is 'USA_MEX'. */
export const loadCorridor = (code) =>
  /^[A-Z]{3}_[A-Z]{3}$/.test(code) ? getJson(`${BASE}/${code}.json`) : Promise.resolve(null)

/**
 * Which countries a currency stands for on the receiving end.
 *
 * ISO 4217 codes are the country's two-letter code plus one letter, so MXN is
 * Mexico and PHP the Philippines. The exceptions are currencies shared across
 * countries, listed here. The sending end needs no table: the survey records
 * the sending currency on every row.
 */
const SHARED = {
  EUR: ['AT','BE','HR','CY','EE','FI','FR','DE','GR','IE','IT','LV','LT','LU','MT','NL','PT','SK','SI','ES','XK','ME'],
  USD: ['US','EC','SV','PA','ZW','TL'],
  XOF: ['BJ','BF','CI','GW','ML','NE','SN','TG'],
  XAF: ['CM','CF','TD','CG','GQ','GA'],
  XCD: ['AG','DM','GD','KN','LC','VC'],
  AUD: ['AU','KI','NR','TV'],
  NZD: ['NZ','CK','NU','TK'],
  ZAR: ['ZA','LS','NA','SZ'],
  INR: ['IN','BT'],
}
const receivingAlpha2 = (currency) =>
  SHARED[currency] ?? (/^[A-Z]{3}$/.test(currency) ? [currency.slice(0, 2)] : [])

/**
 * The corridors a currency pair can mean, biggest first.
 *
 * USD to MXN is one corridor; EUR to PHP is several, one per euro country the
 * survey prices, and the page lets the reader say which. Only corridors priced
 * this quarter are offered: a corridor the survey dropped has history but no
 * present price to compare against.
 */
export function corridorsFor(index, sendCurrency, receiveCurrency) {
  if (!index) return []
  const to = new Set(receivingAlpha2(receiveCurrency))
  return index.corridors
    .filter((c) => c.current && c.sendCurrency === sendCurrency && to.has(c.to.alpha2))
    .sort((a, b) => b.services - a.services)
}
