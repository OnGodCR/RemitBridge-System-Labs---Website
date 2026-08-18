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
  sdg: {
    id: 'sdg',
    title: 'Sustainable Development Goal 10.c: reduce remittance costs to less than 3 percent',
    publisher: 'United Nations',
    date: 'Target year 2030',
    href: 'https://sdgs.un.org/goals/goal10',
  },
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
      { page: 'TrueCost', where: 'The $200 countdown, comparing against the target' },
      { page: 'TrueCost', where: 'Benchmark marker on the receipt-check result scale' },
      { page: 'Yearly cost', where: 'The "at the UN target" row and the yearly saving line' },
      { page: 'Fair rate', where: 'The for-scale note under the result' },
    ],
  },
  {
    value: `${figures.ssaCostPct}%`,
    claim:
      'Average cost of sending $200 to Sub-Saharan Africa, the most expensive region in the world to receive money. Note this is the regional average. Three in four corridors into the region cost more than 10%.',
    source: sources.rpwQ1,
    usedOn: [
      { page: 'Home', where: 'Cost comparison bar, "Sub-Saharan Africa"' },
      { page: 'TrueCost', where: 'The $200 countdown, the deduction applied' },
    ],
  },
  {
    value: `$${figures.benchmarkUsd}`,
    claim:
      'The benchmark transfer amount the World Bank uses to price every corridor it tracks, which is why it appears throughout this research.',
    source: sources.rpw,
    usedOn: [
      { page: 'TrueCost', where: 'The $200 countdown' },
      { page: 'TrueCost', where: 'Default amount in the calculator' },
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
    value: `~$${derived.annualOverpayUsdBn} billion`,
    claim: `Our own estimate of what closing the gap would return to families each year. Method: (${figures.globalCostPct}% − ${figures.targetPct}%) × $${figures.flowsUsdBn}bn. It is arithmetic on the two cited figures above, not a published number, and it assumes the average rate applies evenly across all flows.`,
    source: null,
    usedOn: [{ page: 'Home', where: 'Figure: "The gap, every year"' }],
  },
]
