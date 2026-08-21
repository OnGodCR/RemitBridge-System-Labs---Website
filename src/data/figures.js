/**
 * Headline figures and their sources.
 *
 * Every number rendered anywhere on the site comes from here, and every entry
 * in `citations` records exactly where it is used. The Impact page promises
 * evidence for each claim; this file is how that promise is kept in practice.
 *
 * Anything we worked out ourselves is marked `derived` and shows its method,
 * because a number we computed is a different kind of claim from one we looked up.
 */
export const sources = {
  flows: {
    id: 'flows',
    title: 'Remittances Slowed in 2023, Expected to Grow Faster in 2024',
    publisher: 'World Bank / KNOMAD',
    date: 'June 2024',
    href: 'https://www.worldbank.org/en/news/press-release/2024/06/26/remittances-slowed-in-2023-expected-to-grow-faster-in-2024',
  },
  rpw: {
    id: 'rpw',
    title: 'Remittance Prices Worldwide, Issue 54',
    publisher: 'World Bank',
    date: 'September 2025 (Q3 2025 data)',
    href: 'https://remittanceprices.worldbank.org/',
  },
  rpwQ1: {
    id: 'rpwQ1',
    title: 'Remittance Prices Worldwide, Q1 2025 regional averages',
    publisher: 'World Bank',
    date: 'Q1 2025',
    href: 'https://remittanceprices.worldbank.org/',
  },
  fx: {
    id: 'fx',
    title: 'Frankfurter: daily reference exchange rates',
    publisher: 'Frankfurter, aggregating central bank publications',
    date: 'Fetched live, dated per rate',
    href: 'https://frankfurter.dev',
  },
  rpwWellsFargo: {
    id: 'rpwWellsFargo',
    title: 'Remittance Prices Worldwide: Wells Fargo, USA to Mexico, bank account transfer',
    publisher: 'World Bank',
    date: 'Q3 2025 collection, recorded August 2025',
    href: 'https://remittanceprices.worldbank.org/node/396138',
  },
  rpwDelgado: {
    id: 'rpwDelgado',
    title: 'Remittance Prices Worldwide: Delgado Travel, USA to Mexico, cash agent',
    publisher: 'World Bank',
    date: 'Q3 2025 collection',
    href: 'https://remittanceprices.worldbank.org/node/396082',
  },
  wfStandardWire: {
    id: 'wfStandardWire',
    title: 'Wells Fargo standard international wire: fee and exchange rate markup',
    publisher: 'Independent fee analyses by Monito, Wise, MoneyTransfer.store and IdealRemit',
    date: 'Compared 2025',
    href: 'https://www.monito.com/en/wiki/international-wire-transfers-wells-fargo-us',
  },
  corridorUsMx: {
    id: 'corridorUsMx',
    title: 'Western Union advances brick-and-mortar push with Mexico rollout',
    publisher: 'EMARKETER briefing',
    date: '2025',
    href: 'https://www.emarketer.com',
  },
  sdg: {
    id: 'sdg',
    title: 'Sustainable Development Goal 10.c: reduce remittance costs to less than 3 percent',
    publisher: 'United Nations',
    date: 'Target year 2030',
    href: 'https://sdgs.un.org/goals/goal10',
  },
}

/**
 * The two US to Mexico products compared in blog post 2, both priced on the
 * $200 benchmark in the same Q3 2025 collection.
 *
 * `totalUsd` is fee plus the margin converted back to dollars, which is how
 * the post works it out. It is not `totalPct` x 200: RPW publishes the
 * percentage rounded to two places, so that route gives $9.98 for Delgado
 * against the $9.95 the underlying rates actually produce. The rates are the
 * more precise input, so they win.
 */
export const usMxQ3 = {
  wellsFargo: {
    label: 'Wells Fargo, bank account',
    feeUsd: 6.0,
    midRate: 18.75,
    appliedRate: 18.54,
    marginPct: 1.12,
    totalPct: 4.12,
    totalUsd: 8.24,
    receivedMxn: '3,708.00',
    speed: 'Under 1 hour',
    source: sources.rpwWellsFargo,
  },
  delgadoTravel: {
    label: 'Delgado Travel, cash agent',
    feeUsd: 6.0,
    midRate: 18.74,
    appliedRate: 18.37,
    marginPct: 1.99,
    totalPct: 4.99,
    totalUsd: 9.95,
    receivedMxn: '3,674.00',
    speed: 'Next day',
    source: sources.rpwDelgado,
  },
}

/** Wells Fargo's ordinary SWIFT wire, which is a different product entirely. */
export const wfStandardWire = {
  markupPctLow: 3,
  markupPctHigh: 6,
  flatFeeUsdLow: 25,
  flatFeeUsdHigh: 40,
}

export const figures = {
  /** Remittances to low- and middle-income countries, 2024. */
  flowsUsdBn: 905,
  /** Global average cost of sending $200, Q3 2025. */
  globalCostPct: 6.36,
  /** SDG 10.c target: under 3% by 2030. */
  targetPct: 3,
  /** Most expensive region to send to. Regional average, Q1 2025. */
  ssaCostPct: 8.78,
  /** The World Bank prices every corridor on this amount. */
  benchmarkUsd: 200,
}

/** (global rate − target) × annual flows. Our arithmetic, not a cited figure. */
export const derived = {
  annualOverpayUsdBn: Math.round(
    ((figures.globalCostPct - figures.targetPct) / 100) * figures.flowsUsdBn,
  ),
}

/**
 * One entry per figure, listing every place it appears. If a number gets used
 * somewhere new, it gets added here. That is the whole point of the page.
 */
export const citations = [
  {
    value: `$${figures.flowsUsdBn} billion`,
    claim:
      'Remittances sent to low- and middle-income countries in 2024, the total migrant workers send home each year.',
    source: sources.flows,
    usedOn: [
      { page: 'Home', where: 'Section heading, "Migrants send $905 billion home a year"' },
      { page: 'Home', where: 'Figure: "Sent home each year"' },
      { page: 'Home', where: 'Input to our own $30bn gap calculation' },
    ],
  },
  {
    value: `${figures.globalCostPct}%`,
    claim:
      'Global average cost of sending $200, as a share of the amount sent. This is the headline price the World Bank tracks each quarter.',
    source: sources.rpw,
    usedOn: [
      { page: 'Home', where: 'Figure: "Average cost to send"' },
      { page: 'Home', where: 'Cost comparison bar, "Global average"' },
      { page: 'Home', where: 'Input to our own $30bn gap calculation' },
      { page: 'TrueCost', where: 'Benchmark marker on the receipt-check result scale' },
      { page: 'Yearly cost', where: 'The "at the global average" row, and the placeholder in the cost field' },
      { page: 'Fair rate', where: 'The for-scale note under the result' },
    ],
  },
  {
    value: `${figures.targetPct}%`,
    claim:
      'The cost target UN member states agreed to reach by 2030. The current global average is more than double it.',
    source: sources.sdg,
    usedOn: [
      { page: 'Home', where: 'Figure: "What it should be"' },
      { page: 'Home', where: 'Cost comparison bar, "UN target for 2030"' },
      { page: 'Home', where: 'Input to our own $30bn gap calculation' },
      { page: 'TrueCost', where: 'Benchmark marker on the receipt-check result scale' },
      { page: 'Yearly cost', where: 'The "at the UN target" row and the yearly saving line' },
      { page: 'Fair rate', where: 'The for-scale note under the result' },
      { page: 'Blog', where: 'Post 2, on the Wells Fargo result, and the dashed benchmark on its cost figure' },
    ],
  },
  {
    value: `${figures.ssaCostPct}%`,
    claim:
      'Average cost of sending $200 to Sub-Saharan Africa, the most expensive region in the world to receive money. Note this is the regional average. Three in four corridors into the region cost more than 10%.',
    source: sources.rpwQ1,
    usedOn: [
      { page: 'Home', where: 'Cost comparison bar, "Sub-Saharan Africa"' },
    ],
  },
  {
    value: `$${figures.benchmarkUsd}`,
    claim:
      'The benchmark transfer amount the World Bank uses to price every corridor it tracks, which is why it appears throughout this research.',
    source: sources.rpw,
    usedOn: [
      { page: 'TrueCost', where: 'Default amount in the calculator' },
      { page: 'Blog', where: 'Post 2 follows one $200 transfer, and prices both providers on it' },
    ],
  },
  {
    value: 'Live, per currency pair',
    claim:
      'The mid-market exchange rate the receipt checker compares against. It is a daily reference rate, dated in the interface, not the rate at the instant a transfer was processed. When a pair cannot be priced the tool asks the reader for the rate and labels every result as using it.',
    source: sources.fx,
    usedOn: [
      { page: 'TrueCost', where: 'Mid-market rate shown beside the receipt form' },
      { page: 'TrueCost', where: 'Every figure in the receipt-check result' },
    ],
  },
  {
    value: `${usMxQ3.wellsFargo.totalPct}%`,
    claim:
      `Total cost of sending $${figures.benchmarkUsd} from the US to Mexico with Wells Fargo's bank account transfer: a $${usMxQ3.wellsFargo.feeUsd.toFixed(2)} fee plus a ${usMxQ3.wellsFargo.marginPct}% exchange rate margin, against a mid-market reference of ${usMxQ3.wellsFargo.midRate} MXN per USD. Delivered in under an hour.`,
    source: sources.rpwWellsFargo,
    usedOn: [
      { page: 'Blog', where: 'Post 2, the Wells Fargo figures list' },
      { page: 'Blog', where: 'Post 2, the side-by-side comparison table' },
      { page: 'Blog', where: 'Post 2, the total cost figure' },
    ],
  },
  {
    value: `${usMxQ3.delgadoTravel.totalPct}%`,
    claim:
      `Total cost of the same $${figures.benchmarkUsd} send through Delgado Travel's cash agent product, collected the same quarter: the same $${usMxQ3.delgadoTravel.feeUsd.toFixed(2)} fee against a wider ${usMxQ3.delgadoTravel.marginPct}% margin. Delivered next day.`,
    source: sources.rpwDelgado,
    usedOn: [
      { page: 'Blog', where: 'Post 2, the Delgado Travel figures list' },
      { page: 'Blog', where: 'Post 2, the side-by-side comparison table' },
      { page: 'Blog', where: 'Post 2, the total cost figure' },
    ],
  },
  {
    value: `${wfStandardWire.markupPctLow}% to ${wfStandardWire.markupPctHigh}%`,
    claim:
      `Exchange rate markup on Wells Fargo's standard international wire, on top of a flat $${wfStandardWire.flatFeeUsdLow} to $${wfStandardWire.flatFeeUsdHigh} fee. A different product from the Mexico corridor rate above, and the reason a $${figures.benchmarkUsd} transfer is not sent through it. Not a World Bank figure: these are independent fee comparisons, which is why the post names four of them rather than one.`,
    source: sources.wfStandardWire,
    usedOn: [
      { page: 'Blog', where: 'Post 2, the paragraph separating the direct rail from the classic SWIFT wire' },
    ],
  },
  {
    value: 'Largest corridor',
    claim:
      'US to Mexico is the largest single country-to-country remittance corridor in the world by dollar volume, which is why the case study uses it: a heavily tracked route has prices worth comparing.',
    source: sources.corridorUsMx,
    usedOn: [{ page: 'Blog', where: 'Post 2, choosing the corridor for the case study' }],
  },
  {
    value: `~$${derived.annualOverpayUsdBn} billion`,
    claim: `Our own estimate of what closing the gap would return to families each year. Method: (${figures.globalCostPct}% − ${figures.targetPct}%) × $${figures.flowsUsdBn}bn. It is arithmetic on the two cited figures above, not a published number, and it assumes the average rate applies evenly across all flows.`,
    source: null,
    usedOn: [{ page: 'Home', where: 'Figure: "The gap, every year"' }],
  },
  {
    value: `$${usMxQ3.wellsFargo.totalUsd.toFixed(2)} and $${usMxQ3.delgadoTravel.totalUsd.toFixed(2)}`,
    claim: `What each provider keeps out of $${figures.benchmarkUsd} on the US to Mexico corridor. Method: the fee, plus the gap between the mid-market rate and the rate applied, converted back to dollars. Wells Fargo, $${usMxQ3.wellsFargo.feeUsd.toFixed(2)} + (${usMxQ3.wellsFargo.midRate} - ${usMxQ3.wellsFargo.appliedRate}) x ${figures.benchmarkUsd} / ${usMxQ3.wellsFargo.midRate}. Delgado Travel, the same sum on ${usMxQ3.delgadoTravel.midRate} and ${usMxQ3.delgadoTravel.appliedRate}. Both rates are cited above; the subtraction is ours. The split matters more than the total: the fee is the same $${usMxQ3.wellsFargo.feeUsd.toFixed(2)} on both, so it is the larger share of each, and the whole $${(usMxQ3.delgadoTravel.totalUsd - usMxQ3.wellsFargo.totalUsd).toFixed(2)} gap between the two providers is exchange rate margin.`,
    source: null,
    usedOn: [
      { page: 'Blog', where: 'Post 2, the worked arithmetic under each provider' },
      { page: 'Blog', where: 'Post 2, the total cost figure' },
    ],
  },
]
