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
  swiftNetwork: {
    id: 'swiftNetwork',
    title: 'SWIFT: founding, structure, and function as a messaging cooperative',
    publisher: 'Wikipedia, cross-referenced against SWIFT message type documentation',
    date: 'Founded 1973',
    href: 'https://en.wikipedia.org/wiki/SWIFT',
  },
  fedwire: {
    id: 'fedwire',
    title: 'Fedwire Funds Service: real-time gross settlement operated by the Federal Reserve',
    publisher: 'Board of Governors of the Federal Reserve System',
    date: 'Accessed 2026',
    href: 'https://www.federalreserve.gov/paymentsystems/fedfunds_about.htm',
  },
  target2: {
    id: 'target2',
    title: 'TARGET2: the Eurozone real-time gross settlement system, settling in central bank money',
    publisher: 'European Central Bank',
    date: 'Superseded by T2 in March 2023',
    href: 'https://www.ecb.europa.eu/paym/target/target2',
  },
  rpwMethod: {
    id: 'rpwMethod',
    title: 'Remittance Prices Worldwide: methodology, on the $200 and $500 benchmark amounts',
    publisher: 'World Bank',
    date: 'Amounts fixed 2008, adjusted once in 2009',
    href: 'https://remittanceprices.worldbank.org/methodology',
  },
  mdb: {
    id: 'mdb',
    title: 'Migration and Development Brief: global remittance flows',
    publisher: 'World Bank / KNOMAD, via the Migration Data Portal',
    date: '$905bn in 2024, up from $865bn in 2023',
    href: 'https://www.migrationdataportal.org/themes/remittances-overview',
  },
  unIfad: {
    id: 'unIfad',
    title: 'Remittances matter: 8 facts you do not know about the money migrants send home',
    publisher: 'United Nations and IFAD',
    date: 'Typical send of $200 to $300 every one to two months',
    href: 'https://www.un.org/en/observances/remittances-day',
  },
  dialogue: {
    id: 'dialogue',
    title: 'Understanding the Recent Growth in Remittances to Mexico',
    publisher: 'Inter-American Dialogue',
    date: '2023 data',
    href: 'https://www.thedialogue.org',
  },
  qatarTribune: {
    id: 'qatarTribune',
    title: 'Ramadan drives surge in workers remittances from Qatar',
    publisher: 'Qatar Tribune',
    date: 'Ramadan and Eid volumes 20% to 30% above other months',
    href: 'https://www.qatar-tribune.com',
  },
  bossMoney: {
    id: 'bossMoney',
    title: 'BOSS Money Reports Strong Remittance Topline Increase over the Christmas Holiday Season',
    publisher: 'IDT Corporation',
    date: 'Eleven days to Christmas 2023, year on year',
    href: 'https://www.idt.net',
  },
  wbHaiti: {
    id: 'wbHaiti',
    title: 'Haiti: Remittances Key to Earthquake Recovery',
    publisher: 'World Bank',
    date: '2010, projecting the year after the earthquake',
    href: 'https://www.worldbank.org',
  },
  wbHistoric: {
    id: 'wbHistoric',
    title: 'Migration and Development Brief historical figures, 2015 to 2022 editions',
    publisher: 'World Bank, via Business Standard coverage',
    date: '2015 global flows of $586bn',
    href: 'https://www.business-standard.com',
  },
  bbsf: {
    id: 'bbsf',
    title: 'BBSF: Blockchain Benchmarking Standardized Framework',
    publisher: 'ACM',
    date: 'On the lack of standardised metrics and workloads',
    href: 'https://dl.acm.org/doi/fullHtml/10.1145/3595647.3595649',
  },
  a16zPerf: {
    id: 'a16zPerf',
    title: 'Why blockchain performance is hard to measure',
    publisher: 'a16z crypto',
    date: 'On the problem of treating all transactions as equal',
    href: 'https://a16zcrypto.com/posts/article/why-blockchain-performance-is-hard-to-measure',
  },
  celestiaBench: {
    id: 'celestiaBench',
    title: 'Why Blockchain Benchmarks Are Usually Deceiving',
    publisher: 'Celestia',
    date: 'On short-burst benchmarks against sustained production load',
    href: 'https://blog.celestia.org/why-blockchain-benchmarks-are-usually-deceiving',
  },
  bnbBench: {
    id: 'bnbBench',
    title: 'Designing Benchmarks for Trading-Focused Blockchains',
    publisher: 'BNB Chain',
    date: 'On objective, verifiable and transparent benchmark design',
    href: 'https://www.bnbchain.org/en/blog/designing-benchmarks-for-trading-focused-blockchains',
  },
  zilliqaTestnet: {
    id: 'zilliqaTestnet',
    title: 'Zilliqa Testnet v1.0 Release: Codename Red Prawn',
    publisher: 'Zilliqa, via Easy Crypto project history',
    date: '2017 testnet',
    href: 'https://hub.easycrypto.com/zilliqa-coin',
  },
  icryptoScaling: {
    id: 'icryptoScaling',
    title: 'Scalability Solutions for Blockchain: Sharding and Layer-2 Technologies',
    publisher: 'iCryptoAI',
    date: 'On sidechains carrying independent, potentially weaker security models',
    href: 'https://icryptoai.com/2025/11/26/scalability-solutions-for-blockchain-sharding-and-layer-2-technologies',
  },
  ecObservatory: {
    id: 'ecObservatory',
    title: 'An overview of blockchain scalability, interoperability and sustainability',
    publisher: 'European Commission Blockchain Observatory',
    date: 'On sharding, payment channels and cross-shard communication',
    href: 'https://blockchain-observatory.ec.europa.eu',
  },
  tpsClaimsGraphic: {
    id: 'tpsClaimsGraphic',
    title: 'Transactions per second between blockchains, a compilation of advertised figures',
    publisher: 'Solana Daily, on X',
    date: 'Undated; it lists Terra, which stopped operating in 2022',
    href: 'https://x.com/solanadaily',
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

/**
 * Throughput arithmetic for blog post 19.
 *
 * Two things this file is careful about. The $200 benchmark is not an average
 * and is never treated as one here: `usMxAvgUsd` is what an observed average
 * actually looks like in the largest corridor, and the gap between them is
 * the post's first finding.
 *
 * And TPS is computed rather than typed. Every row below is flows divided by
 * an assumed size divided by seconds in a year, so a change to `flowsUsdBn`
 * moves the whole post rather than leaving a stale number in a table.
 */
const SECONDS_PER_YEAR = 365 * 24 * 60 * 60

const tpsFor = (sizeUsd) =>
  Math.round((figures.flowsUsdBn * 1e9) / sizeUsd / SECONDS_PER_YEAR)
const txnsBnFor = (sizeUsd) => +((figures.flowsUsdBn * 1e9) / sizeUsd / 1e9).toFixed(2)

export const tps = {
  secondsPerYear: SECONDS_PER_YEAR,
  flows2023UsdBn: 865,
  flows2015UsdBn: 586,
  /** Inter-American Dialogue, US to Mexico, average principal per transaction. */
  usMxAvgUsd: 488,
  usMxSendsPerYear: 16,
  bySize: [
    { sizeUsd: 100, txnsBn: txnsBnFor(100), tps: tpsFor(100) },
    { sizeUsd: 200, txnsBn: txnsBnFor(200), tps: tpsFor(200), note: 'RPW benchmark' },
    { sizeUsd: 300, txnsBn: txnsBnFor(300), tps: tpsFor(300) },
    { sizeUsd: 500, txnsBn: txnsBnFor(500), tps: tpsFor(500), note: 'RPW other benchmark' },
  ],
  demand: [
    {
      name: 'Ordinary',
      load: `~${tpsFor(figures.benchmarkUsd)} TPS`,
      why: 'An average day, nothing unusual happening. A network that cannot hold this is not a candidate at all.',
    },
    {
      name: 'Peak, holiday driven',
      load: '179 to 200 TPS',
      why: 'A 25% to 40% multiplier on the baseline. Ramadan and Eid run 20% to 30% above other months, and one US provider reported 39% over the eleven days to Christmas.',
    },
    {
      name: 'Emergency driven',
      load: 'Sustained, size unknown',
      why: 'Remittances to Haiti were projected 20% above baseline for the year after the 2010 earthquake. Slower to build than a holiday spike and far longer to persist.',
      uncertain: true,
    },
    {
      name: 'Growth, ten years out',
      load: '~234 TPS baseline',
      why: 'Just under 5% compound growth from 2015 to 2024, projected forward to roughly $1.47 trillion. Nearer 290 to 330 TPS once a peak multiplier is applied.',
    },
  ],
  share: [
    { pct: 100, range: '143 to 200 TPS', note: 'replacing the existing system outright' },
    { pct: 10, range: '14 to 20 TPS', note: 'an ambitious but not implausible early target' },
    { pct: 1, range: '1.4 to 2 TPS', note: 'early adoption' },
  ],
  unanswered: [
    'Whether those transactions actually finish',
    'How long finality takes once a transaction is submitted',
    'What happens to the ones that fail partway through',
    'Whether it holds up when demand lands in the worst hour rather than spread evenly',
  ],
  summary: [
    { name: 'Realistic early target, 10% share', low: 14, high: 33, note: 'the bar an early system actually has to clear' },
    { name: 'Ordinary demand, whole market', low: 57, high: 287, note: 'range depends entirely on assumed transaction size' },
    { name: 'Peak ceiling, whole market', low: 180, high: 330, note: 'holidays plus a decade of projected growth' },
  ],
}

/**
 * The one hard benchmark figure blog post 17 cites, kept with the conditions
 * that produced it.
 *
 * The number is real and is not the point. Every field under `caveats` is a
 * condition the test did not face, and the post's argument is that a headline
 * TPS without them attached is not a comparable quantity. So they travel
 * together here, the same way a value and its collection date do in
 * measures.js.
 */
export const zilliqa = {
  tps: 2488,
  shards: 6,
  nodes: 3600,
  year: 2017,
  where: 'a single AWS region, Singapore',
  caveats: [
    'Nodes sitting close together in one cloud region',
    'No real-world latency between continents',
    'No adversarial nodes',
    'No competing background traffic',
    'No sustained multi-day operation',
  ],
}

/**
 * Published throughput claims for thirteen chains, as they circulate.
 *
 * These are advertised figures. Not one of them states the workload, the
 * hardware, the validator count, or what it counted as a transaction, and
 * several are theoretical maxima rather than observed mainnet throughput.
 * Terra is on the list and stopped operating in 2022.
 *
 * They are on this site as the object of blog post 17's argument, not as
 * evidence for anything, and the figure that draws them says so. That is the
 * only footing on which numbers with no stated method belong here at all.
 *
 * Redrawn from the compilation rather than reproduced: the numbers are each
 * project's own published claim, the arrangement was somebody else's image.
 */
export const tpsClaims = [
  { name: 'Ethereum', tps: 15 },
  { name: 'BSC', tps: 100 },
  { name: 'Cardano', tps: 250 },
  { name: 'Polkadot', tps: 400 },
  { name: 'Algorand', tps: 1000 },
  { name: 'Cosmos', tps: 1400 },
  { name: 'Tron', tps: 2000 },
  { name: 'Avalanche', tps: 4500 },
  { name: 'Fantom', tps: 10000 },
  { name: 'Terra', tps: 10000, defunct: true },
  { name: 'Elrond', tps: 15000 },
  { name: 'Polygon', tps: 65000 },
  { name: 'Solana', tps: 65000 },
]

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
      { page: 'Blog', where: 'Post 19, the numerator of every throughput calculation in it' },
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
      { page: 'Blog', where: 'Post 19, as the divisor for every TPS figure, and as the benchmark it argues is not an average' },
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
      { page: 'Blog', where: 'Post 2, the two-products figure, as the fee on the direct rail' },
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
      { page: 'Blog', where: 'Post 2, the two-products figure, as the fee range on the standard wire' },
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
    value: `$${figures.benchmarkUsd} and $500`,
    claim:
      'The two amounts Remittance Prices Worldwide surveys in every corridor. Set in 2008, adjusted once in 2009, frozen since so fee trends stay comparable over time. They are a fixed reference point, not a measured average transaction size, which is the distinction blog post 19 turns on.',
    source: sources.rpwMethod,
    usedOn: [{ page: 'Blog', where: 'Post 19, the section asking whether $200 is an average or a benchmark' }],
  },
  {
    value: `$${tps.usMxAvgUsd}`,
    claim: `Observed average principal per transaction on the US to Mexico corridor in 2023, with the average sender remitting about ${tps.usMxSendsPerYear} times a year. Roughly ${(tps.usMxAvgUsd / figures.benchmarkUsd).toFixed(1)} times the RPW benchmark, in the largest corridor in the world.`,
    source: sources.dialogue,
    usedOn: [
      { page: 'Blog', where: 'Post 19, on what a real observed average looks like' },
      { page: 'Blog', where: 'Post 19, the benchmark against observed average figure' },
    ],
  },
  {
    value: '$200 to $300',
    claim:
      'What migrant workers typically send home every one to two months, described as a global pattern. A description of typical behaviour rather than a measured mean, which is why post 19 does not use it as one.',
    source: sources.unIfad,
    usedOn: [{ page: 'Blog', where: 'Post 19, on the global pattern' }],
  },
  {
    value: `$${tps.flows2023UsdBn} billion`,
    claim: `Global remittance flows in 2023, the year before the $${figures.flowsUsdBn} billion figure used elsewhere on this site.`,
    source: sources.mdb,
    usedOn: [{ page: 'Blog', where: 'Post 19, the year-on-year growth figure' }],
  },
  {
    value: `$${tps.flows2015UsdBn} billion`,
    claim:
      'Global remittance flows in 2015. Post 19 uses this and the 2024 figure to derive the growth rate it projects forward.',
    source: sources.wbHistoric,
    usedOn: [{ page: 'Blog', where: 'Post 19, the growth over time scenario' }],
  },
  {
    value: '20% to 30%',
    claim:
      'How far remittance transaction volumes rise during Ramadan and the run-up to Eid al-Fitr against other months, driven by zakat, holiday spending and pre-Eid salary disbursement.',
    source: sources.qatarTribune,
    usedOn: [{ page: 'Blog', where: 'Post 19, peak holiday-driven demand' }],
  },
  {
    value: '39%',
    claim:
      'Transaction volume increase reported by one US remittance provider over the eleven days to Christmas 2023, against the same period a year earlier. A single provider rather than a market-wide figure.',
    source: sources.bossMoney,
    usedOn: [{ page: 'Blog', where: 'Post 19, peak holiday-driven demand' }],
  },
  {
    value: '20%',
    claim:
      'Projected rise in remittances to Haiti over the year following the 2010 earthquake. Sustained across months rather than concentrated in a burst, which is what makes emergency demand a different load profile from a holiday one.',
    source: sources.wbHaiti,
    usedOn: [{ page: 'Blog', where: 'Post 19, emergency-driven demand' }],
  },
  {
    value: '15 to 65,000 TPS',
    claim:
      'The spread of throughput figures advertised across thirteen blockchains, as they circulate in comparison graphics. Listed here as claims, not measurements: none states its workload, hardware, validator count or definition of a transaction, several are theoretical maxima rather than observed mainnet throughput, and the compilation includes Terra, which stopped operating in 2022. Blog post 17 uses them as the thing being examined rather than as evidence, and the site holds no position on whether any individual figure is accurate.',
    source: sources.tpsClaimsGraphic,
    usedOn: [{ page: 'Blog', where: 'Post 17, the figure showing the claims the post goes on to take apart' }],
  },
  {
    value: `${zilliqa.tps.toLocaleString()} TPS`,
    claim: `Zilliqa's ${zilliqa.year} testnet result, using ${zilliqa.shards} shards and ${zilliqa.nodes.toLocaleString()} nodes run in ${zilliqa.where}. Blog post 17 cites it as a real number produced under laboratory conditions: no inter-continental latency, no adversarial nodes, no competing traffic and no sustained multi-day run. The figure describes what sharding did in that test, not what a distributed production network would sustain.`,
    source: sources.zilliqaTestnet,
    usedOn: [
      { page: 'Blog', where: 'Post 17, on short bursts against sustained load' },
      { page: 'Blog', where: 'Post 17, the figure listing the conditions the test did not face' },
    ],
  },
  {
    value: '1973',
    claim:
      'The year SWIFT was founded. It is a messaging cooperative: it carries payment instructions between banks and never holds or moves funds itself, which is the distinction blog post 7 is built around.',
    source: sources.swiftNetwork,
    usedOn: [{ page: 'Blog', where: 'Post 7, the section on what SWIFT is' }],
  },
  {
    value: 'Fedwire and T2',
    claim:
      'The real-time gross settlement systems named in blog post 7. Settlement in these happens in central bank money, which is what makes it final. The post names T2 rather than TARGET2, which it replaced in March 2023, and it separates CHIPS from Fedwire: CHIPS nets payments against each other and settles through Fedwire, so it is not itself a gross settlement system.',
    source: sources.fedwire,
    usedOn: [{ page: 'Blog', where: 'Post 7, the RTGS section' }],
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
  {
    value: `${(wfStandardWire.flatFeeUsdLow / figures.benchmarkUsd) * 100 + wfStandardWire.markupPctLow}% to ${(wfStandardWire.flatFeeUsdHigh / figures.benchmarkUsd) * 100 + wfStandardWire.markupPctHigh}%`,
    claim: `What Wells Fargo's ordinary international wire would cost on $${figures.benchmarkUsd}, fee and markup together. Method: the flat $${wfStandardWire.flatFeeUsdLow} to $${wfStandardWire.flatFeeUsdHigh} expressed as a share of $${figures.benchmarkUsd}, plus the ${wfStandardWire.markupPctLow}% to ${wfStandardWire.markupPctHigh}% markup cited above. Both ends are estimates on estimates, which is why the figure draws the range hollow rather than picking a number in it.`,
    source: null,
    usedOn: [{ page: 'Blog', where: 'Post 2, the two-products figure' }],
  },
  {
    value: `${tps.bySize[3].tps} to ${tps.bySize[0].tps} TPS`,
    claim: `Average transactions per second a network carrying all global remittance volume would have to sustain, across assumed average transaction sizes from $${tps.bySize[3].sizeUsd} down to $${tps.bySize[0].sizeUsd}. Method: $${figures.flowsUsdBn} billion divided by the assumed size, divided by ${tps.secondsPerYear.toLocaleString()} seconds in a year. The flows figure is cited above; the division is ours, and the fivefold spread comes entirely from the assumption, not the arithmetic. The realistic target is roughly a tenth of this, because no single architecture carries the whole market.`,
    source: null,
    usedOn: [
      { page: 'Blog', where: 'Post 19, the baseline table and the TPS by size figure' },
      { page: 'Blog', where: 'Post 19, the market share and closing range figures' },
    ],
  },
]
