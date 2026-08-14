/**
 * Corridor-level provider prices. Phase 2.
 *
 * Deliberately empty. The intended source is the World Bank's Remittance
 * Prices Worldwide survey, which the lab does not have loaded yet, and a
 * comparison table populated with anything else would be an invented number of
 * exactly the kind the rest of this site refuses to publish.
 *
 * This file exists so the shape is settled and the TrueCost page can ask
 * whether corridor data exists without knowing how it arrives. Every function
 * below returns nothing today. Nothing renders from it.
 *
 * ---------------------------------------------------------------------------
 * Attribution, required when this is populated. It must appear wherever any of
 * this data is displayed:
 *
 *   The World Bank, Remittance Prices Worldwide, available at
 *   http://remittanceprices.worldbank.org
 *
 * The terms of use also forbid any implication that the World Bank endorses
 * this site, this lab, or any conclusion drawn from the data. Present it as a
 * source that was consulted, never as a partner or a validator.
 * ---------------------------------------------------------------------------
 *
 * @typedef {Object} ServiceRecord
 * @property {string}  provider        Name as the survey records it.
 * @property {'bank'|'mto'|'mobile operator'|'post office'} providerType
 * @property {string}  corridor        'USD_MXN' style, sending then receiving.
 * @property {200|500} surveyedAmount  The two amounts the World Bank surveys.
 * @property {number}  fee             In the sending currency.
 * @property {number}  fxMarginPct     Markup over mid-market, percent.
 * @property {number}  totalCostPct    Fee plus margin, as a share of the amount.
 * @property {'cash pickup'|'bank deposit'|'mobile wallet'} deliveryMethod
 * @property {'cash'|'bank account'|'debit card'|'credit card'} fundingMethod
 * @property {'under an hour'|'same day'|'next day'|'two to five days'} speedBand
 * @property {boolean} transparent     Whether the exchange rate is disclosed
 *                                     before the customer commits. This is the
 *                                     whole argument of the TrueCost page, so
 *                                     it is a field and not a footnote.
 *
 * @typedef {Object} CorridorData
 * @property {string} corridor
 * @property {number} averageCostPct   Mean across surveyed services.
 * @property {number} smartCostPct     SmaRT: the average of the three cheapest
 *                                     services that disclose the rate up front.
 * @property {ServiceRecord[]} services
 * @property {DataVintage} dataVintage
 *
 * @typedef {Object} DataVintage
 * @property {string} quarter          'Q3 2025'.
 * @property {string} collectedOn      ISO date the survey was collected.
 * @property {string} sourceId         Key into `sources` in figures.js.
 */

/**
 * Survey quarter and collection date.
 *
 * Not optional when this is populated: a price from eighteen months ago
 * presented without a date is worse than no price, because it looks current.
 * The UI is required to display it next to anything drawn from this file.
 *
 * @type {import('./corridors').DataVintage | null}
 */
export const dataVintage = null

/** @type {Record<string, import('./corridors').CorridorData>} */
export const corridors = {}

/** True once there is anything to show. The page branches on this. */
export const hasCorridorData = () => Object.keys(corridors).length > 0

/**
 * @param {string} corridor 'USD_MXN'
 * @returns {import('./corridors').CorridorData | null}
 */
export const getCorridor = (corridor) => corridors[corridor] ?? null

/**
 * Corridor average and SmaRT benchmark, for the reference scale on the result.
 * Returns null until the data exists, and the scale renders that slot only
 * when it is not null. No placeholder, no zero, no dash.
 *
 * @returns {{averageCostPct: number, smartCostPct: number} | null}
 */
export const getBenchmarks = (corridor) => {
  const found = getCorridor(corridor)
  if (!found) return null
  return { averageCostPct: found.averageCostPct, smartCostPct: found.smartCostPct }
}

/**
 * @returns {import('./corridors').ServiceRecord[]} Sorted cheapest first.
 */
export const getServices = (corridor, surveyedAmount = 200) => {
  const found = getCorridor(corridor)
  if (!found) return []
  return found.services
    .filter((s) => s.surveyedAmount === surveyedAmount)
    .sort((a, b) => a.totalCostPct - b.totalCostPct)
}
