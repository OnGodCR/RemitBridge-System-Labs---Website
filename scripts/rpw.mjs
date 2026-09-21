import { spawn, execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * World Bank Remittance Prices Worldwide, from one spreadsheet to one small
 * file per corridor.
 *
 *   node scripts/rpw.mjs data/raw/rpw_dataset_2011_2025_q3.xlsx
 *
 * Run by hand when a quarter arrives; the spreadsheet is 50 MB and stays out
 * of git, the output is committed. The output is what makes all 367 corridors
 * affordable on a static site: nothing here enters the JavaScript bundle. The
 * page fetches public/data/rpw/index.json for the list, and one corridor's
 * file only when a reader prices that corridor. A visitor who never opens
 * TrueCost downloads none of it.
 *
 * The workbook is read by streaming its XML rather than through a
 * spreadsheet library: the dataset sheet is 300 MB unzipped and 200,000 rows,
 * and the library that was tried had not finished after twelve minutes.
 * unzip streams a sheet in seconds, and the cells are regular enough for a
 * row-at-a-time regex.
 *
 * Two averages per corridor and amount. The corridor average is the plain
 * mean of every service's total cost, which is what the RPW site shows as
 * "Total Average" and what this script is checked against: for Q3 2025 it
 * reproduces 4.54 for USA to MEX, 31.48 for ZAF to MWI and 16.45 for ZAF to
 * BWA to the decimal. The cheapest-three figure is the mean of the three
 * cheapest services with a non-negative total that disclose their exchange
 * rate, deliver within five days and are not flagged as low coverage. RPW
 * publishes a benchmark called
 * SmaRT built on a similar rule; this is our reading of it, not their number,
 * and the UI says "cheapest three transparent", not "SmaRT".
 *
 * Terms of use, from the download page: free to copy, adapt and publish with
 * the attribution below wherever the data appears, and never implying that
 * the World Bank endorses this site. The attribution ships inside every file
 * so no page can render the data without it in hand.
 */
const ATTRIBUTION =
  'The World Bank, Remittance Prices Worldwide, available at http://remittanceprices.worldbank.org'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const input = process.argv[2]
if (!input || !fs.existsSync(input)) {
  console.error('usage: node scripts/rpw.mjs data/raw/rpw_dataset_<range>.xlsx')
  process.exit(1)
}
const outDir = path.join(root, 'public', 'data', 'rpw')

/* ---- workbook plumbing ------------------------------------------------- */

const unesc = (s) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")

const sst = execSync(`unzip -p "${input}" xl/sharedStrings.xml`, { maxBuffer: 1 << 30 }).toString()
const strings = [...sst.matchAll(/<si>(.*?)<\/si>/gs)].map((m) =>
  [...m[1].matchAll(/<t[^>]*>(.*?)<\/t>/gs)].map((x) => x[1]).join(''),
)

const colIdx = (ref) => {
  let n = 0
  for (const ch of ref.replace(/\d+/g, '')) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n - 1
}

function parseRow(xml) {
  const cells = []
  for (const m of xml.matchAll(/<c r="([A-Z]+)\d+"(?:[^>]*?t="([a-z]+)")?[^>]*?(?:\/>|>(.*?)<\/c>)/gs)) {
    const [, col, type, inner] = m
    let v = null
    if (inner != null) {
      const vm = inner.match(/<v>(.*?)<\/v>/s)
      const im = inner.match(/<is>.*?<t[^>]*>(.*?)<\/t>/s)
      if (type === 's' && vm) v = unesc(strings[Number(vm[1])])
      else if (type === 'inlineStr' && im) v = unesc(im[1])
      else if (vm) v = type === 'str' ? unesc(vm[1]) : Number(vm[1])
    }
    cells[colIdx(col)] = v
  }
  return cells
}

// The sheet named "Dataset (from Q2 2016)". Its file name comes from the
// workbook's relationship table rather than being assumed.
function datasetSheetPath() {
  const wb = execSync(`unzip -p "${input}" xl/workbook.xml`).toString()
  const rels = execSync(`unzip -p "${input}" xl/_rels/workbook.xml.rels`).toString()
  const sheet = [...wb.matchAll(/<sheet name="([^"]+)"[^>]*r:id="([^"]+)"/g)].find(([, name]) =>
    /^Dataset \(from/.test(name),
  )
  if (!sheet) throw new Error('rpw: no "Dataset (from ...)" sheet in the workbook')
  const rel = rels.match(new RegExp(`<Relationship [^>]*Id="${sheet[2]}"[^>]*Target="([^"]+)"`))
  return 'xl/' + rel[1].replace(/^\/?xl\//, '')
}

function rows(onRow) {
  return new Promise((resolve, reject) => {
    const proc = spawn('unzip', ['-p', input, datasetSheetPath()])
    let buf = ''
    let header = null
    proc.stdout.on('data', (chunk) => {
      buf += chunk
      let i
      while ((i = buf.indexOf('</row>')) !== -1) {
        const start = buf.lastIndexOf('<row', i)
        const cells = parseRow(buf.slice(start, i + 6))
        buf = buf.slice(i + 6)
        if (!header) header = cells
        else onRow(Object.fromEntries(Array.from(header, (h, k) => [h, cells[k] ?? null])))
      }
    })
    proc.on('error', reject)
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`unzip exited ${code}`))))
  })
}

/* ---- the shape the site reads ------------------------------------------ */

const quarterLabel = (period) => {
  // '2025_3Q' -> 'Q3 2025'
  const m = period.match(/^(\d{4})_(\d)Q$/)
  return m ? `Q${m[2]} ${m[1]}` : period
}

const speedBand = (s) => {
  if (!s) return null
  if (/less than one hour/i.test(s)) return 'under an hour'
  if (/same day/i.test(s)) return 'same day'
  if (/next day/i.test(s)) return 'next day'
  if (/2 days|3-5 days|2-5/i.test(s)) return 'two to five days'
  if (/6 days/i.test(s)) return 'six days or more'
  return s.toLowerCase()
}

const providerType = (t) => {
  if (!t) return null
  if (/bank/i.test(t)) return 'bank'
  if (/mobile/i.test(t)) return 'mobile operator'
  if (/post/i.test(t)) return 'post office'
  if (/money transfer/i.test(t)) return 'mto'
  return t.toLowerCase()
}

const mean = (xs) => (xs.length ? +(xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(2) : null)

function benchmarks(services, amount) {
  const rows = services.filter((s) => s.surveyedAmount === amount && Number.isFinite(s.totalCostPct))
  const averageCostPct = mean(rows.map((s) => s.totalCostPct))
  // A negative total is a promotional rate better than mid-market. It is a
  // real record and stays in the average, as it does in RPW's own, but it is
  // not a price a sender can count on, so it does not set the floor.
  const eligible = rows
    .filter((s) => s.totalCostPct >= 0)
    .filter((s) => s.transparent && s.speedBand !== 'six days or more' && s.coverage !== 'Low')
    .sort((a, b) => a.totalCostPct - b.totalCostPct)
    .slice(0, 3)
  const cheapestThreePct = eligible.length === 3 ? mean(eligible.map((s) => s.totalCostPct)) : null
  return { averageCostPct, cheapestThreePct, services: rows.length }
}

/* ---- country codes -------------------------------------------------------- */

/**
 * The dataset names countries and gives their three-letter codes. The site
 * matches corridors to currencies, and a currency code's first two letters
 * are the country's two-letter code (MXN is MX), so each country needs its
 * two-letter code as well. Node knows every region's English name, so the
 * match is by name, with the dataset's own spellings aliased. Anything that
 * does not match is printed, so a new country in a future quarter is a line
 * to add here rather than a silent hole.
 */
const ALIASES = {
  'Congo, Dem. Rep.': 'CD',
  'Egypt, Arab Rep.': 'EG',
  'Gambia, The': 'GM',
  'Korea, Rep.': 'KR',
  'Kyrgyz Republic': 'KG',
  'Lao PDR': 'LA',
  'Macedonia, FYR': 'MK',
  'Russian Federation': 'RU',
  'Swaziland': 'SZ',
  'Syrian Arab Republic': 'SY',
  'Turkey': 'TR',
  'West Bank and Gaza': 'PS',
  'Yemen, Rep.': 'YE',
  'Czech Republic': 'CZ',
  'Cabo Verde': 'CV',
  'Vietnam': 'VN',
  'Kosovo': 'XK',
  "Côte d'Ivoire": 'CI',
  'Bosnia and Herzegovina': 'BA',
  'Myanmar': 'MM',
}
const regionNames = new Intl.DisplayNames(['en'], { type: 'region' })
const byName = new Map()
for (let a = 65; a < 91; a++)
  for (let b = 65; b < 91; b++) {
    const code = String.fromCharCode(a, b)
    const name = regionNames.of(code)
    if (name && name !== code) byName.set(name.toLowerCase(), code)
  }
const region = (r) => (r && r !== '..' ? r : null)
const unmatched = new Set()
const alpha2 = (name) => {
  const hit = ALIASES[name] || byName.get(String(name).toLowerCase())
  if (!hit) unmatched.add(name)
  return hit || null
}

/* ---- read everything once ---------------------------------------------- */

const corridors = new Map() // code -> { meta, byPeriod: Map(period -> services[]) }
const dates = new Map() // period -> [min, max] collection dates
let latest = ''

const parseDate = (s) => {
  // Early quarters wrote '11/May/2016'; later ones store an Excel serial,
  // days since 1899-12-30, which is how the workbook keeps a real date.
  if (typeof s === 'number') {
    return new Date(Date.UTC(1899, 11, 30) + s * 86400000).toISOString().slice(0, 10)
  }
  const m = String(s || '').match(/^(\d{1,2})\/(\w{3})\/(\d{4})$/)
  if (!m) return null
  const month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].indexOf(m[2])
  if (month < 0) return null
  return `${m[3]}-${String(month + 1).padStart(2, '0')}-${m[1].padStart(2, '0')}`
}

await rows((r) => {
  const period = r.period
  if (!period) return
  if (period > latest) latest = period
  const code = `${r.source_code}_${r.destination_code}`
  if (!corridors.has(code)) {
    corridors.set(code, {
      code,
      // '..' is the World Bank's blank: high-income senders carry no region.
      from: { code: r.source_code, alpha2: alpha2(r.source_name), name: r.source_name, region: region(r.source_region) },
      to: { code: r.destination_code, alpha2: alpha2(r.destination_name), name: r.destination_name, region: region(r.destination_region) },
      byPeriod: new Map(),
    })
  }
  const c = corridors.get(code)
  if (!c.byPeriod.has(period)) c.byPeriod.set(period, [])
  const list = c.byPeriod.get(period)

  const d = parseDate(r.date)
  if (d) {
    const cur = dates.get(period) || [d, d]
    dates.set(period, [d < cur[0] ? d : cur[0], d > cur[1] ? d : cur[1]])
  }

  for (const [prefix, amount] of [['cc1', 200], ['cc2', 500]]) {
    const total = r[`${prefix} total cost %`]
    if (total == null || total === '' || Number.isNaN(Number(total))) continue
    list.push({
      provider: r.firm,
      providerType: providerType(r.firm_type),
      surveyedAmount: amount,
      sendCurrency: r[`${prefix} lcu code`],
      sendAmount: Number(r[`${prefix} lcu amount`]),
      fee: Number(r[`${prefix} lcu fee`]),
      fxMarginPct: Number(r[`${prefix} fx margin`]),
      totalCostPct: Number(total),
      paymentInstrument: r['payment instrument'] || null,
      accessPoint: r['access point'] || null,
      deliveryMethod: r['pickup method'] || null,
      speedBand: speedBand(r['speed actual']),
      coverage: r['receiving network coverage'] || null,
      transparent: String(r.transparent).toLowerCase() === 'yes',
    })
  }
})

/* ---- write ---------------------------------------------------------------- */

fs.rmSync(outDir, { recursive: true, force: true })
fs.mkdirSync(outDir, { recursive: true })

const [collectedFrom, collectedTo] = dates.get(latest) || [null, null]
const vintage = {
  quarter: quarterLabel(latest),
  period: latest,
  collectedFrom,
  collectedTo,
  sourceId: 'rpwDataset',
  attribution: ATTRIBUTION,
  sourceUrl: 'https://remittanceprices.worldbank.org',
}

const index = []
let files = 0
for (const c of [...corridors.values()].sort((a, b) => a.code.localeCompare(b.code))) {
  const current = c.byPeriod.get(latest)
  // A corridor the survey dropped is not a corridor with a price. It gets
  // history only, and the index says so, rather than a stale figure that
  // reads as current.
  const history = [...c.byPeriod.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, services]) => ({
      period,
      quarter: quarterLabel(period),
      ...benchmarks(services, 200),
    }))
  const b200 = current ? benchmarks(current, 200) : null
  const b500 = current ? benchmarks(current, 500) : null
  const sendCurrency = (current || [...c.byPeriod.values()].at(-1))[0]?.sendCurrency ?? null

  fs.writeFileSync(
    path.join(outDir, `${c.code}.json`),
    JSON.stringify({
      code: c.code,
      from: c.from,
      to: c.to,
      sendCurrency,
      vintage: current ? vintage : null,
      benchmark: current ? { 200: b200, 500: b500 } : null,
      services: current ? current.sort((a, b) => a.totalCostPct - b.totalCostPct) : [],
      history,
    }),
  )
  files += 1
  index.push({
    code: c.code,
    from: c.from,
    to: c.to,
    sendCurrency,
    current: Boolean(current),
    averageCostPct: b200?.averageCostPct ?? null,
    cheapestThreePct: b200?.cheapestThreePct ?? null,
    services: b200?.services ?? 0,
    quarters: history.length,
  })
}

fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify({ vintage, corridors: index }))

if (unmatched.size) console.warn(`rpw: no two-letter code for: ${[...unmatched].join(', ')}`)
const current = index.filter((c) => c.current)
console.log(
  `rpw: ${vintage.quarter}, collected ${collectedFrom} to ${collectedTo}; ` +
    `${current.length} corridors priced this quarter, ${files} with history, ` +
    `${current.reduce((n, c) => n + c.services, 0)} services at $200`,
)
for (const code of ['USA_MEX', 'ZAF_MWI', 'ZAF_BWA', 'GBR_PHL', 'ITA_EGY']) {
  const c = index.find((x) => x.code === code)
  console.log(`  ${code}: average ${c?.averageCostPct}%, cheapest three ${c?.cheapestThreePct}%`)
}
