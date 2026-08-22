import { Fragment } from 'react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { figures, usMxQ3, wfStandardWire, tps, zilliqa, tpsClaims, crossShard } from '@/data/figures'
import { cn } from '@/lib/utils'

/**
 * Figures for the blog posts, as HTML rather than SVG.
 *
 * An SVG diagram scales its text down with the viewport, so at 320px the
 * labels here would have rendered around 8px. Boxes and flex wrapping reflow
 * instead: the row becomes a column and the type stays the size it was.
 *
 * Every label is a term the post itself uses. A diagram that introduces its
 * own vocabulary is a second claim the reader has to check.
 */

/** One box in a flow. Sub always renders so the boxes line up at equal height. */
function Node({ title, sub, note, theme }) {
  return (
    <div className="min-w-0 flex-1 rounded-2xl border border-border bg-card p-3 text-center">
      <p className="text-sm font-bold leading-snug">{title}</p>
      <p className="mt-1 text-xs leading-snug text-muted-foreground">{sub}</p>
      {note && (
        <p className={cn('mt-2 border-t border-border pt-2 text-xs font-bold', theme.ink)}>
          {note}
        </p>
      )}
    </div>
  )
}

/** Down when the flow is stacked, right when it is a row. */
function Hop() {
  return (
    <div className="flex shrink-0 items-center justify-center" aria-hidden>
      <ArrowDown className="size-4 text-muted-foreground sm:hidden" />
      <ArrowRight className="hidden size-4 text-muted-foreground sm:block" />
    </div>
  )
}

/** A row of nodes joined by hops. Two posts draw this chain, with different
    endpoints and different things worth calling out underneath it. */
function Chain({ theme, stops, aria, footer }) {
  return (
    <figure
      className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5"
      role="group"
      aria-label={aria}
    >
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        {stops.map((stop, i) => (
          <Fragment key={i}>
            {i > 0 && <Hop />}
            <Node theme={theme} {...stop} />
          </Fragment>
        ))}
      </div>

      {footer && (
        <div className="mt-4 grid gap-2 border-t border-border pt-4 text-xs sm:grid-cols-2">
          {footer.map((f, i) => (
            <p key={i} className={cn('leading-snug', i % 2 === 1 && 'sm:text-right')}>
              <span className={cn('font-bold', theme.ink)}>{f.lead}</span>
              <span className="text-muted-foreground"> {f.rest}</span>
            </p>
          ))}
        </div>
      )}
    </figure>
  )
}

/** Path A: the correspondent chain, and where it leaks money and time. */
export function CorrespondentChain({ theme }) {
  return (
    <Chain
      theme={theme}
      aria="A transfer routes from the sender's bank through two correspondent banks holding Nostro and Vostro accounts to the recipient's bank, with a fee deducted at each correspondent hop and final settlement on RTGS during business hours."
      stops={[
        { title: "Sender's bank", sub: 'compliance screening' },
        { title: 'Correspondent bank', sub: 'Nostro / Vostro', note: 'fee deducted' },
        { title: 'Correspondent bank', sub: 'Nostro / Vostro', note: 'fee deducted' },
        { title: "Recipient's bank", sub: 'pays out' },
      ]}
      footer={[
        { lead: 'FX spread', rest: 'applied at one of these points' },
        { lead: 'RTGS settlement', rest: 'runs business hours only, 1 to 5 business days' },
      ]}
    />
  )
}

/** The same chain from post 7, where the point is that the two ends have
    never met and the middle is invisible from either of them. */
export function SwiftChain({ theme }) {
  return (
    <Chain
      theme={theme}
      aria="A payment from a small regional bank in the US to a small regional bank in Vietnam routes through two correspondent banks, which hold the Nostro and Vostro accounts that connect institutions with no direct relationship. Each correspondent can charge its own fee."
      stops={[
        { title: 'Small US bank', sub: 'no direct relationship' },
        { title: 'Correspondent bank', sub: 'Nostro / Vostro', note: 'own fee' },
        { title: 'Correspondent bank', sub: 'Nostro / Vostro', note: 'own fee' },
        { title: 'Small Vietnamese bank', sub: 'no direct relationship' },
      ]}
      footer={[
        { lead: 'Two or three hops', rest: 'is normal between less-connected banks' },
        { lead: 'Invisible from both ends', rest: 'neither bank sees the whole chain' },
      ]}
    />
  )
}

/** Path B: two pools that never touch, which is why the payout is instant. */
export function LiquidityPools({ theme }) {
  return (
    <figure
      className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5"
      role="group"
      aria-label="The sender pays into a pre-funded dollar pool in the sending country while the recipient is paid out of a separate pre-funded local currency pool in the receiving country. The two pools are rebalanced periodically in bulk rather than per transfer."
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Sending country
          </p>
          <p className="text-sm">Sender pays $200 in</p>
          <ArrowDown className="my-1.5 size-4 text-muted-foreground" aria-hidden />
          <div className={cn('rounded-2xl border p-3 text-center', theme.tint, theme.border)}>
            <p className={cn('text-sm font-bold', theme.ink)}>USD pool</p>
            <p className="mt-1 text-xs text-muted-foreground">pre-funded, already there</p>
          </div>
        </div>

        {/* Deliberately not an arrow. Nothing crosses per transfer, which is
            the whole point of the diagram. */}
        <div className="flex items-center gap-3 sm:h-full sm:flex-col">
          <div className="h-px flex-1 border-t border-dashed border-border sm:h-auto sm:w-px sm:flex-1 sm:border-l sm:border-t-0" />
          <p className="shrink-0 text-center text-xs leading-snug text-muted-foreground sm:max-w-24">
            rebalanced periodically, in bulk
          </p>
          <div className="h-px flex-1 border-t border-dashed border-border sm:h-auto sm:w-px sm:flex-1 sm:border-l sm:border-t-0" />
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Receiving country
          </p>
          <div className={cn('rounded-2xl border p-3 text-center', theme.tint, theme.border)}>
            <p className={cn('text-sm font-bold', theme.ink)}>MXN pool</p>
            <p className="mt-1 text-xs text-muted-foreground">pre-funded, already there</p>
          </div>
          <ArrowDown className="my-1.5 size-4 text-muted-foreground" aria-hidden />
          <p className="text-sm">Recipient is paid out</p>
        </div>
      </div>

      <p className="mt-4 border-t border-border pt-4 text-xs leading-snug text-muted-foreground">
        No money crosses the border per transfer.
      </p>
    </figure>
  )
}

/**
 * Total cost of the two products, as a share of the amount sent.
 *
 * One measure, so one hue and no legend: the two bars are told apart by their
 * own labels. The green and grey the theme offers fail CVD separation as a
 * pair (deutan dE 3.1), so colour is not asked to carry identity here.
 *
 * "Recipient gets" is deliberately not charted. 3,708 against 3,674 MXN is a
 * 0.9% difference; on an honest zero baseline the bars are indistinguishable,
 * and the only way to make it look like something is to truncate the axis.
 * The table above the figure carries those two numbers instead.
 */
const COST_BARS = [usMxQ3.wellsFargo, usMxQ3.delgadoTravel]

/* Runs past both bars and puts the 3% benchmark at the halfway mark. */
const SCALE_MAX = 6

export function CostComparison({ theme }) {
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Total cost of a $200 send, US to Mexico
      </figcaption>

      <div className="mt-5 space-y-5">
        {COST_BARS.map((bar) => (
          <div key={bar.label}>
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-sm font-bold">{bar.label}</span>
              <span className="text-sm tabular-nums text-muted-foreground">
                {bar.totalPct}% &middot; ${bar.totalUsd.toFixed(2)}
              </span>
            </div>
            <div className="relative h-3 rounded-full bg-muted">
              <div
                className={cn('h-3 rounded-l-full rounded-r-[4px]', theme.bar)}
                style={{ width: `${(bar.totalPct / SCALE_MAX) * 100}%` }}
              />
              {/* The benchmark both products miss, drawn on the same scale. */}
              <div
                className="absolute inset-y-[-4px] w-px border-l border-dashed border-foreground/40"
                style={{ left: `${(figures.targetPct / SCALE_MAX) * 100}%` }}
                aria-hidden
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Dashed line: the UN target of {figures.targetPct}% by 2030. Scale runs to {SCALE_MAX}%.
      </p>
    </figure>
  )
}

/**
 * The same bank, two products, priced on the same $200.
 *
 * An earlier version of this charted the fee alone, which flattered both
 * products and did not match the paragraph beside it. The direct rail's fee
 * is 3% but its measured total is 4.12%, and the ordinary wire's flat fee
 * carries another 3% to 6% of markup on top. Fee against fee is not the
 * comparison anyone is actually making.
 *
 * So: total cost, with the fee and the markup as separate segments, because
 * the split is the post's whole argument.
 *
 * The two bars are not equally certain and are not drawn as if they were.
 * The direct rail is one measured RPW row. The ordinary wire is a range from
 * independent fee analyses, so it runs solid to its low end and hollow to
 * its high end. Collapsing that range to a single bar would invent a
 * precision the sources do not have.
 *
 * Second green #5CA88E: CVD separation dE 18.5 against the house green,
 * normal vision 18.6. It sits at 2.82:1 on white rather than 3:1, which is
 * allowed only alongside visible labels, so every segment is named in text
 * under its bar. Two steps of one accent, not a second hue.
 */
const MARKUP_FILL = '#5CA88E'

export function TwoProducts({ theme }) {
  const rail = usMxQ3.wellsFargo
  const railFeePct = (rail.feeUsd / figures.benchmarkUsd) * 100
  const railMarginPct = rail.totalPct - railFeePct

  const wireFeeLow = (wfStandardWire.flatFeeUsdLow / figures.benchmarkUsd) * 100
  const wireFeeHigh = (wfStandardWire.flatFeeUsdHigh / figures.benchmarkUsd) * 100
  const wireLow = wireFeeLow + wfStandardWire.markupPctLow
  const wireHigh = wireFeeHigh + wfStandardWire.markupPctHigh
  const scale = wireHigh

  const pct = (v) => `${(v / scale) * 100}%`
  const usd = (v) => ((v / 100) * figures.benchmarkUsd).toFixed(0)

  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Wells Fargo, two products, total cost of a ${figures.benchmarkUsd} send
      </figcaption>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
        <span className="inline-flex items-center gap-2">
          <span className={cn('size-2.5 rounded-sm', theme.bar)} aria-hidden />
          <span className="font-bold">Fee</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-sm" style={{ backgroundColor: MARKUP_FILL }} aria-hidden />
          <span className="font-bold">Exchange rate markup</span>
        </span>
      </div>

      <div className="mt-5 space-y-5">
        <div>
          <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="text-sm font-bold">Direct rail to Mexico</span>
            <span className="text-sm font-bold tabular-nums">
              {rail.totalPct}% &middot; ${rail.totalUsd.toFixed(2)}
            </span>
          </div>
          <div className="relative h-3 rounded-full bg-muted">
            <div className="absolute inset-y-0 left-0 right-0 flex">
              <span className={cn('h-3 rounded-l-full', theme.bar)} style={{ width: pct(railFeePct) }} />
              <span
                className="h-3 rounded-r-[4px]"
                style={{ width: pct(railMarginPct), backgroundColor: MARKUP_FILL, marginLeft: 2 }}
              />
            </div>
            <div
              className="absolute inset-y-[-4px] w-px border-l border-dashed border-foreground/40"
              style={{ left: pct(figures.targetPct) }}
              aria-hidden
            />
          </div>
          <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
            fee {railFeePct}% &middot; markup {railMarginPct.toFixed(2)}%, measured
          </p>
        </div>

        <div>
          <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="text-sm font-bold">Standard international wire</span>
            <span className="text-sm font-bold tabular-nums">
              {wireLow}% to {wireHigh}% &middot; ${usd(wireLow)} to ${usd(wireHigh)}
            </span>
          </div>
          <div className="relative h-3 rounded-full bg-muted">
            {/* Hollow out to the top of the range. */}
            <div
              className={cn('absolute inset-y-0 left-0 rounded-full border', theme.border)}
              style={{ width: pct(wireHigh) }}
              aria-hidden
            />
            <div className="absolute inset-y-0 left-0 right-0 flex">
              <span className={cn('h-3 rounded-l-full', theme.bar)} style={{ width: pct(wireFeeLow) }} />
              <span
                className="h-3 rounded-r-[4px]"
                style={{
                  width: pct(wfStandardWire.markupPctLow),
                  backgroundColor: MARKUP_FILL,
                  marginLeft: 2,
                }}
              />
            </div>
            <div
              className="absolute inset-y-[-4px] w-px border-l border-dashed border-foreground/40"
              style={{ left: pct(figures.targetPct) }}
              aria-hidden
            />
          </div>
          <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
            fee {wireFeeLow}% to {wireFeeHigh}% &middot; markup {wfStandardWire.markupPctLow}% to{' '}
            {wfStandardWire.markupPctHigh}%, estimated
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Solid is the low end of each range, hollow the high end. Dashed line: the UN target of{' '}
        {figures.targetPct}%, which the direct rail spends on its fee alone. Scale runs to {scale}%.
      </p>
    </figure>
  )
}

/**
 * One SWIFT message, with what each field is actually saying.
 *
 * The post's central claim is that this thing carries no money, which is
 * hard to feel in the abstract. Showing the message as what it is, a form
 * with five filled fields and no value attached, makes it concrete.
 *
 * The values are obvious placeholders. A realistic-looking account number
 * on a page about payments is a thing someone will screenshot.
 */
const MT103_FIELDS = [
  { field: 'Pay', value: 'Banco Example, Mexico City' },
  { field: 'To account', value: 'XXXX XXXX XXXX 0000' },
  { field: 'Amount', value: '200.00' },
  { field: 'Currency', value: 'USD' },
  { field: 'Reason', value: 'Family maintenance' },
]

export function SwiftMessage({ theme }) {
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        What an MT103 actually carries
      </figcaption>

      <dl className={cn('mt-4 overflow-hidden rounded-2xl border', theme.border)}>
        {MT103_FIELDS.map((row, i) => (
          <div
            key={row.field}
            className={cn(
              'flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-2.5',
              i > 0 && 'border-t',
              theme.border,
              i % 2 === 0 ? theme.tint : 'bg-card',
            )}
          >
            <dt className={cn('w-28 shrink-0 text-xs font-bold uppercase tracking-widest', theme.ink)}>
              {row.field}
            </dt>
            <dd className="min-w-0 font-mono text-sm">{row.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Instruction only, no funds attached. Every field above is an example. The money moves
        somewhere else entirely, which is the point of the two sections that follow.
      </p>
    </figure>
  )
}

/**
 * The three layers on one line, which is the post in a single picture.
 *
 * Each layer gets what it actually contributes: speed, cost, and finality.
 * Drawing them as equal boxes would say they are equal jobs, and the whole
 * argument is that they are three different ones.
 */
const LAYERS = [
  { name: 'SWIFT message', does: 'the instruction', cost: 'essentially instant' },
  { name: 'Correspondent banks', does: 'the value moves', cost: 'hours to days, fees accumulate' },
  { name: 'RTGS settlement', does: 'final and irreversible', cost: 'business hours only' },
]

export function ThreeLayers({ theme }) {
  return (
    <figure
      className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5"
      role="group"
      aria-label="Three layers in order: a SWIFT message carries the instruction and is essentially instant, correspondent banks move the value over hours to days while fees accumulate, and RTGS settlement makes the payment final during business hours only."
    >
      <figcaption className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        One transfer, three systems, three jobs
      </figcaption>

      <ol className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-stretch">
        {LAYERS.map((layer, i) => (
          <Fragment key={layer.name}>
            {i > 0 && <Hop />}
            <li className={cn('min-w-0 flex-1 rounded-2xl border p-3', theme.border, theme.tint)}>
              <p className={cn('text-[11px] font-bold uppercase tracking-widest', theme.ink)}>
                Step {i + 1}
              </p>
              <p className="mt-1.5 text-sm font-bold leading-snug">{layer.name}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{layer.does}</p>
              <p className={cn('mt-2 border-t pt-2 text-xs font-bold', theme.border, theme.ink)}>
                {layer.cost}
              </p>
            </li>
          </Fragment>
        ))}
      </ol>
    </figure>
  )
}

/**
 * The named settlement systems, grounding "these are real institutions".
 *
 * The filled and hollow dot is the site's status convention, doing real work
 * here: filled means the system settles gross, hollow means it nets. That is
 * exactly the distinction the post's corrected sentence draws, and CHIPS is
 * the reason it matters. Listing all three as RTGS systems, which the draft
 * did, is the error this figure would otherwise repeat in pictures.
 */
const SETTLEMENT_SYSTEMS = [
  {
    name: 'Fedwire',
    where: 'United States',
    operator: 'Federal Reserve',
    how: 'settles gross, one payment at a time',
    gross: true,
  },
  {
    name: 'CHIPS',
    where: 'United States',
    operator: 'The Clearing House, privately owned',
    how: 'nets payments, then settles through Fedwire',
    gross: false,
  },
  {
    name: 'T2',
    where: 'Eurozone',
    operator: 'European Central Bank',
    how: 'settles gross, replaced TARGET2 in 2023',
    gross: true,
  },
]

export function SettlementSystems({ theme }) {
  return (
    <figure
      className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5"
      role="group"
      aria-label="Three named large-value payment systems. Fedwire in the United States and T2 in the Eurozone settle gross, one payment at a time. CHIPS nets payments against each other and settles through Fedwire, so it is not itself a gross settlement system."
    >
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Where final settlement actually happens
      </figcaption>

      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {SETTLEMENT_SYSTEMS.map((sys) => (
          <li key={sys.name} className="rounded-2xl border border-border bg-card p-3">
            <p className="text-sm font-bold">{sys.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{sys.where}</p>
            <p className="mt-2 text-xs leading-snug text-muted-foreground">{sys.operator}</p>
            <p className="mt-2 flex items-start gap-2 border-t border-border pt-2 text-xs leading-snug">
              <span
                aria-hidden
                className={cn(
                  'mt-1 size-2 shrink-0 rounded-full',
                  sys.gross ? theme.bar : cn('border-2 border-current bg-card', theme.ink),
                )}
              />
              <span className={cn('font-bold', theme.ink)}>{sys.how}</span>
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        Filled dot settles gross, hollow dot nets first. All three run on the business day of the
        country they serve, which is where the Friday-to-Monday delay comes from.
      </p>
    </figure>
  )
}

/**
 * The three questions the closing section asks, answered by layer.
 *
 * Every row here is the post's own question and its own answer, rearranged
 * so the pattern is visible at a glance: each familiar complaint about
 * international transfers is really a question about which of the three
 * layers you are looking at.
 */
const SYMPTOMS = [
  {
    ask: 'Sent three days ago, still not there',
    layer: 'SWIFT',
    why: '"sent" means the message went out, not that settlement happened',
  },
  {
    ask: 'A fee nobody mentioned',
    layer: 'Correspondent banks',
    why: 'a bank in the middle of the chain, invisible from either end',
  },
  {
    ask: 'Friday transfer, arrives Tuesday',
    layer: 'RTGS',
    why: 'settlement runs on business hours, and a weekend sits in the middle',
  },
]

export function SymptomsByLayer({ theme }) {
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Which layer explains which complaint
      </figcaption>

      <ul className="mt-4 space-y-2">
        {SYMPTOMS.map((row) => (
          <li
            key={row.layer}
            className="grid gap-1 rounded-2xl border border-border bg-card p-3 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-4"
          >
            <p className="text-sm font-bold leading-snug">{row.ask}</p>
            <p
              className={cn(
                'order-first text-[11px] font-bold uppercase tracking-widest sm:order-none',
                theme.ink,
              )}
            >
              {row.layer}
            </p>
            <p className="text-xs leading-snug text-muted-foreground sm:col-span-2">{row.why}</p>
          </li>
        ))}
      </ul>
    </figure>
  )
}

/* ------------------------------------------------------------------------ *
 * Post 19. Throughput.
 * ------------------------------------------------------------------------ */

/** One labelled bar on a shared scale. Hollow marks a range's upper end. */
function BarRow({ theme, label, value, note, width, ghost }) {
  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="text-sm font-bold">{label}</span>
        <span className="text-sm tabular-nums text-muted-foreground">{value}</span>
      </div>
      <div className="relative h-3 rounded-full bg-muted">
        {ghost != null && (
          <div
            className={cn('absolute inset-y-0 left-0 rounded-full border', theme.border)}
            style={{ width: `${ghost}%` }}
            aria-hidden
          />
        )}
        <div
          className={cn('relative h-3 rounded-l-full rounded-r-[4px]', theme.bar)}
          style={{ width: `${width}%` }}
        />
      </div>
      {note && <p className="mt-1.5 text-xs text-muted-foreground">{note}</p>}
    </div>
  )
}

function Panel({ label, note, children }) {
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </figcaption>
      <div className="mt-5">{children}</div>
      {note && <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{note}</p>}
    </figure>
  )
}

/** A fixed benchmark is not a measured average, drawn as the gap it is. */
export function BenchmarkVsActual({ theme }) {
  const max = tps.usMxAvgUsd
  return (
    <Panel
      label="Benchmark against observed average"
      note={`The benchmark was fixed in 2008 for price comparability, not measured. The US to Mexico figure is an observed average principal per transaction, ${tps.usMxSendsPerYear} sends a year, and it is ${(tps.usMxAvgUsd / figures.benchmarkUsd).toFixed(1)} times the benchmark in the largest corridor there is.`}
    >
      <div className="space-y-5">
        <BarRow
          theme={theme}
          label="RPW benchmark, fixed since 2008"
          value={`$${figures.benchmarkUsd}`}
          width={(figures.benchmarkUsd / max) * 100}
        />
        <BarRow
          theme={theme}
          label="US to Mexico, observed 2023"
          value={`$${tps.usMxAvgUsd}`}
          width={100}
        />
      </div>
    </Panel>
  )
}

/** The table beside it, as lengths. The answer moves fivefold on an input. */
export function TpsBySize({ theme }) {
  const max = Math.max(...tps.bySize.map((r) => r.tps))
  return (
    <Panel
      label="Average TPS by assumed transaction size"
      note={`Global flows of $${figures.flowsUsdBn} billion divided by an assumed average size, then by ${tps.secondsPerYear.toLocaleString()} seconds in a year. The assumption, not the arithmetic, is what moves the answer.`}
    >
      <div className="space-y-5">
        {tps.bySize.map((row) => (
          <BarRow
            key={row.sizeUsd}
            theme={theme}
            label={`$${row.sizeUsd} average${row.note ? ` (${row.note})` : ''}`}
            value={`~${row.tps} TPS`}
            width={(row.tps / max) * 100}
            note={`~${row.txnsBn} billion transactions a year`}
          />
        ))}
      </div>
    </Panel>
  )
}

/** Four demand levels, one of which the evidence will not size. */
export function DemandLevels({ theme }) {
  return (
    <Panel
      label="What the network has to survive, not average"
      note="The emergency band carries no number on purpose. Post-disaster remittances are documented as rising and as persisting for months, but public data on the hour-by-hour shape is thin, and a made-up figure here would be the only unsourced number in the post."
    >
      <ol className="grid gap-3 sm:grid-cols-2">
        {tps.demand.map((level) => (
          <li
            key={level.name}
            className={cn(
              'rounded-2xl border p-3',
              level.uncertain ? 'border-dashed border-border' : cn(theme.border, theme.tint),
            )}
          >
            <p className={cn('text-[11px] font-bold uppercase tracking-widest', theme.ink)}>
              {level.name}
            </p>
            <p className="mt-1.5 text-lg font-bold tabular-nums leading-none">{level.load}</p>
            <p className="mt-2 text-xs leading-snug text-muted-foreground">{level.why}</p>
          </li>
        ))}
      </ol>
    </Panel>
  )
}

/** The adjustment that changes the answer more than any other. */
export function MarketShare({ theme }) {
  return (
    <Panel
      label="Required TPS by share of the market captured"
      note="Every figure above this assumes one architecture carries all of it, which is not how payment rails get adopted. The whole-market number is a ceiling to design toward, not the bar to clear on day one."
    >
      <div className="space-y-5">
        {tps.share.map((row) => (
          <BarRow
            key={row.pct}
            theme={theme}
            label={`${row.pct}% of global remittance volume`}
            value={row.range}
            width={row.pct}
            note={row.note}
          />
        ))}
      </div>
    </Panel>
  )
}

/** What a throughput number leaves unanswered, which is the next post. */
export function BeyondTps({ theme }) {
  return (
    <Panel
      label="What a TPS target does not answer"
      note="Raw capacity is one question. These are four others, each with its own data, and a network can pass the first while failing all of them."
    >
      <ul className="grid gap-2 sm:grid-cols-2">
        {tps.unanswered.map((q) => (
          <li key={q} className="flex gap-2.5 rounded-2xl border border-border bg-card p-3">
            <span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', theme.bar)} aria-hidden />
            <span className="text-xs leading-snug">{q}</span>
          </li>
        ))}
      </ul>
    </Panel>
  )
}

/** The whole post as one scale, realistic target against theoretical ceiling. */
export function TpsRange({ theme }) {
  const max = tps.summary[tps.summary.length - 1].high
  return (
    <Panel
      label="The range this post arrives at"
      note="Read the top band as an architectural ceiling and the bottom one as the bar an early system actually has to clear. They differ by roughly an order of magnitude, which is the point."
    >
      <div className="space-y-5">
        {tps.summary.map((row) => (
          <BarRow
            key={row.name}
            theme={theme}
            label={row.name}
            value={`${row.low} to ${row.high} TPS`}
            width={(row.low / max) * 100}
            ghost={(row.high / max) * 100}
            note={row.note}
          />
        ))}
      </div>
    </Panel>
  )
}

/* ------------------------------------------------------------------------ *
 * Post 17. Three architectures that do not answer the same question.
 * ------------------------------------------------------------------------ */

const ARCHITECTURES = ['Sharding', 'Sidechain', 'Payment channel']

/**
 * The same three columns, asked a different question each time.
 *
 * Keeping the architectures in one fixed order across every figure in the
 * post is the whole point: the argument is that these are not interchangeable
 * columns, so the reader should be able to track one down the page.
 */
function ThreeWay({ theme, label, question, answers, note }) {
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </figcaption>
      {question && <p className="mt-2 text-sm font-bold">{question}</p>}

      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {ARCHITECTURES.map((arch, i) => (
          <li key={arch} className={cn('rounded-2xl border p-3', theme.border, theme.tint)}>
            <p className={cn('text-[11px] font-bold uppercase tracking-widest', theme.ink)}>
              {arch}
            </p>
            <p className="mt-2 text-sm font-bold leading-snug">{answers[i].head}</p>
            <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{answers[i].detail}</p>
          </li>
        ))}
      </ul>

      {note && (
        <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
          {note}
        </p>
      )}
    </figure>
  )
}

export function TxnDefinitions({ theme }) {
  return (
    <ThreeWay
      theme={theme}
      label="One transaction, three different amounts of work"
      question="What gets counted as a single transaction?"
      answers={[
        { head: 'A cross-shard contract call', detail: 'Coordination between shards before it can be committed.' },
        { head: 'A smart-contract call on its own chain', detail: 'Its own consensus, its own gas, its own validator set.' },
        { head: 'A balance update between two parties', detail: 'No consensus round at all while the channel stays open.' },
      ]}
      note="All three get reported as the number one. That is the first reason a TPS figure from one architecture cannot be set beside a TPS figure from another."
    />
  )
}

/** A real number, shown with the conditions it was not tested against. */
export function BurstConditions({ theme }) {
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        What a headline number leaves out
      </figcaption>

      <div className={cn('mt-4 rounded-2xl border p-4', theme.border, theme.tint)}>
        <p className={cn('text-3xl font-extrabold tabular-nums', theme.ink)}>
          {zilliqa.tps.toLocaleString()} TPS
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Zilliqa testnet, {zilliqa.year}. {zilliqa.shards} shards, {zilliqa.nodes.toLocaleString()}{' '}
          nodes, {zilliqa.where}.
        </p>
      </div>

      <p className="mt-4 text-xs font-bold">Conditions the test did not face</p>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {zilliqa.caveats.map((c) => (
          <li key={c} className="flex gap-2.5 rounded-2xl border border-dashed border-border p-3">
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-muted-foreground" aria-hidden />
            <span className="text-xs leading-snug text-muted-foreground">{c}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        The number is real. It describes what sharding did in that test, which is not the same
        claim as what it would sustain in production.
      </p>
    </figure>
  )
}

/** The variables that decide the answer, and are rarely pinned. */
const VARIABLES = [
  { name: 'Hardware', why: 'Machine specs are often undisclosed, so the number belongs to the machine.' },
  { name: 'Validator or node count', why: 'Each project tests with whatever it happened to have.' },
  { name: 'Geography', why: 'One data centre has no inter-continental latency and no packet loss.' },
  { name: 'Test duration', why: 'A short burst carries none of the storage, indexing or syncing growth.' },
  { name: 'Definition of a transaction', why: 'Nobody agrees, and it is rarely stated.' },
  { name: 'Reproducibility', why: 'Without open scripts and configs, nobody else can run it.' },
]

export function HeldConstant({ theme }) {
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Six variables, rarely held constant
      </figcaption>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {VARIABLES.map((v) => (
          <li key={v.name} className="rounded-2xl border border-border bg-card p-3">
            <p className={cn('text-sm font-bold', theme.ink)}>{v.name}</p>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">{v.why}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        Change any one of these and the headline figure moves. Most published benchmarks vary
        several at once, which is why two numbers reported as TPS are not the same quantity.
      </p>
    </figure>
  )
}

export function SecurityModels({ theme }) {
  return (
    <ThreeWay
      theme={theme}
      label="What each one is asking you to trust"
      question="Where does the security actually come from?"
      answers={[
        { head: 'The base network validator pool', detail: 'Accountable to the whole network, though any one shard sees a fraction of the load.' },
        { head: 'Its own independent validator set', detail: 'Not inherited from the chain it bridges to, and can be meaningfully weaker.' },
        { head: 'Cryptographic dispute on-chain', detail: 'Between two specific parties, for funds sitting in an open channel.' },
      ]}
      note="Three different guarantees. A throughput number that ignores which one is in force is comparing systems that are not offering the same thing."
    />
  )
}

export function FinalityMeanings({ theme }) {
  return (
    <ThreeWay
      theme={theme}
      label="Final, in three incompatible senses"
      question="What has actually happened when a payment is called final?"
      answers={[
        { head: 'Committed in-shard, cross-shard confirmed', detail: 'Cost is native to the chain, with no bridging step.' },
        { head: 'Confirmed on the sidechain itself', detail: 'Weaker than settled back on the main chain. Bridging on and off is a separate cost.' },
        { head: 'Acknowledged between the two parties', detail: 'On-chain settlement waits for the channel to close, and capital is locked until it does.' },
      ]}
      note="Cost has the same problem. A sidechain fee omits bridging, and a channel's near-zero fee omits the opportunity cost of capital sitting locked and illiquid."
    />
  )
}

/** The lab's own conditions, which is what the post ends on. */
const REQUIREMENTS = [
  'Matched hardware specifications across every architecture tested',
  'A comparable number of validators or nodes, not whatever each project used',
  'Geographically realistic network conditions, not a single data centre',
  'Sustained load over hours or days, not a short burst',
  'A shared, explicit definition of what counts as one transaction',
  'Separate accounting for bridge and liquidity costs',
  'A stated definition of finality for each architecture',
]

export function FairComparison({ theme }) {
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        What a comparison worth trusting has to hold
      </figcaption>
      <ol className="mt-4 space-y-2">
        {REQUIREMENTS.map((r, i) => (
          <li key={r} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
            <span className={cn('shrink-0 text-xs font-bold tabular-nums', theme.ink)}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="text-sm leading-snug">{r}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        Every one of these is held differently, or not at all, across the benchmarks currently
        circulating. That is the gap the lab's own paper is built to close.
      </p>
    </figure>
  )
}

/**
 * The claims themselves, drawn so the post has something to point at.
 *
 * Redrawn rather than reproduced. The numbers are each project's own
 * published claim; the compilation they were taken from is somebody else's
 * image, and reposting it is a licence question the site does not need.
 *
 * Three deliberate choices, all of them about not repeating in a picture the
 * error the post is describing:
 *
 * A logarithmic length, because 15 against 65,000 is four orders of magnitude
 * and a linear axis renders nine of the thirteen bars as invisible slivers.
 * The caption says so; an unlabelled log axis is its own kind of lie.
 *
 * No curve through the tops. The compilation joins these with a smooth rising
 * line, which asserts a trend between thirteen unrelated projects. They are
 * categories, not a series, so they get bars and no connector.
 *
 * Every bar is labelled with its number. Normally that is noise, but here the
 * figure is doing a table's job as much as a chart's: the claims are the
 * subject, and a log bar cannot be read off without its value.
 */
const LOG_MIN = 10
const LOG_MAX = 100000
const logPct = (v) =>
  ((Math.log10(v) - Math.log10(LOG_MIN)) / (Math.log10(LOG_MAX) - Math.log10(LOG_MIN))) * 100

export function ClaimedTps({ theme }) {
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Throughput as advertised, not as measured
      </figcaption>

      <div className="mt-5 space-y-1.5">
        {tpsClaims.map((c) => (
          <div
            key={c.name}
            className="grid grid-cols-[4.25rem_1fr_3.25rem] items-center gap-x-2 sm:grid-cols-[6rem_1fr_4rem]"
          >
            <span className="truncate text-xs font-bold">
              {c.name}
              {c.defunct && <span className="font-normal text-muted-foreground"> †</span>}
            </span>
            <span className="relative block h-2.5 rounded-full bg-muted">
              <span
                className={cn(
                  'absolute inset-y-0 left-0 rounded-l-full rounded-r-[4px]',
                  c.defunct ? 'bg-muted-foreground/50' : theme.bar,
                )}
                style={{ width: `${logPct(c.tps)}%` }}
              />
            </span>
            <span className="text-right text-xs tabular-nums text-muted-foreground">
              {c.tps.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        Bar length is logarithmic: every tenfold rise is the same distance, because 15 and 65,000
        cannot share a linear axis. None of these figures states its workload, hardware, validator
        count or definition of a transaction, and several are theoretical maxima rather than
        observed throughput. † Terra stopped operating in 2022. This is the pile of numbers the
        rest of the post is about, not a ranking the lab stands behind.
      </p>
    </figure>
  )
}

/* ------------------------------------------------------------------------ *
 * Post 14. Sharding.
 * ------------------------------------------------------------------------ */

/** The two cases a sharded network has, and why only one of them is cheap. */
export function ShardSplit({ theme }) {
  const cases = [
    {
      title: 'Everyone on one shard',
      detail: 'That shard validates and finalises alone, in parallel with every other shard doing the same.',
      cost: 'No coordination',
      good: true,
    },
    {
      title: 'Parties on different shards',
      detail: 'The shards involved have to talk, agree what happened, and keep the result consistent across all of them.',
      cost: 'Coordination, and the latency it costs',
      good: false,
    },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Where the throughput multiplier comes from, and where it stops
      </figcaption>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {cases.map((c) => (
          <li
            key={c.title}
            className={cn(
              'rounded-2xl border p-3',
              c.good ? cn(theme.border, theme.tint) : 'border-dashed border-border bg-card',
            )}
          >
            <p className="text-sm font-bold leading-snug">{c.title}</p>
            <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{c.detail}</p>
            <p
              className={cn(
                'mt-2 border-t pt-2 text-xs font-bold',
                c.good ? cn(theme.border, theme.ink) : 'border-border text-muted-foreground',
              )}
            >
              {c.cost}
            </p>
          </li>
        ))}
      </ul>
    </figure>
  )
}

/** The three-shard case the post walks through, drawn as the chain it is. */
export function ThreeShards({ theme }) {
  return (
    <Chain
      theme={theme}
      aria="A $200 remittance debits the sender's wallet on shard A, executes a conversion through a liquidity provider on shard B, and credits the recipient's wallet on shard C. All three either commit together or roll back together."
      stops={[
        { title: 'Shard A', sub: "sender's wallet", note: 'debit $200' },
        { title: 'Shard B', sub: 'conversion provider', note: 'USD to peso' },
        { title: 'Shard C', sub: "recipient's wallet", note: 'credit' },
      ]}
      footer={[
        { lead: 'All three or none', rest: 'there is no state where A debits and C never credits' },
        { lead: 'Three parties by default', rest: 'a conversion step makes this the ordinary case, not the edge one' },
      ]}
    />
  )
}

/** Three ways of making shards agree, and what each one trades. */
export function CoordinationMechanisms({ theme }) {
  const rows = [
    {
      name: 'Two-phase commit',
      who: 'OmniLedger, Chainspace',
      how: 'Every shard runs consensus twice: once to lock the funds and prove them available, once to spend them after all shards confirm.',
      trade: 'Guarantee up front, paid for in rounds',
    },
    {
      name: 'Receipts',
      who: "NEAR's Nightshade",
      how: 'A shard executes its part immediately and emits a receipt for the next shard, rolling back later if something upstream proves invalid.',
      trade: 'Faster common case, rollback instead of a guarantee',
    },
    {
      name: 'Coordinating committee',
      who: 'Zilliqa Directory Service',
      how: 'A dedicated group of nodes assigns nodes to shards and validates each shard\'s blocks before they merge into the main chain.',
      trade: 'Consistency through a layer, not between shards',
    },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Three ways to make shards agree
      </figcaption>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {rows.map((r) => (
          <li key={r.name} className={cn('rounded-2xl border p-3', theme.border, theme.tint)}>
            <p className={cn('text-[11px] font-bold uppercase tracking-widest', theme.ink)}>
              {r.who}
            </p>
            <p className="mt-1.5 text-sm font-bold leading-snug">{r.name}</p>
            <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{r.how}</p>
            <p className={cn('mt-2 border-t pt-2 text-xs font-bold', theme.border)}>{r.trade}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        Different mechanisms, same underlying bill: a transaction touching several shards needs
        real extra communication, whether it is paid up front or cleaned up afterwards.
      </p>
    </figure>
  )
}

/** Two permitted outcomes and the one the post says cannot exist. */
export function Atomicity({ theme }) {
  const outcomes = [
    { head: 'Commits everywhere', body: 'The $200 arrives in full.', allowed: true },
    { head: 'Rolls back everywhere', body: "The sender's account ends exactly as it started.", allowed: true },
    { head: 'Partly succeeds', body: 'Debited on one shard, never credited on another. A lost or duplicated payment.', allowed: false },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        The three outcomes, one of which must be impossible
      </figcaption>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {outcomes.map((o) => (
          <li
            key={o.head}
            className={cn(
              'rounded-2xl border p-3',
              o.allowed ? cn(theme.border, theme.tint) : 'border-dashed border-destructive/40 bg-card',
            )}
          >
            <p className="flex items-center gap-2 text-sm font-bold leading-snug">
              <span
                aria-hidden
                className={cn(
                  'size-2 shrink-0 rounded-full',
                  o.allowed ? theme.bar : 'border-2 border-current bg-card',
                )}
              />
              {o.head}
            </p>
            <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{o.body}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        The coordination cost exists to make the third box unreachable. Nothing about being on a
        blockchain rather than in a bank grants that for free.
      </p>
    </figure>
  )
}

/**
 * A hot shard, drawn structurally rather than numerically.
 *
 * No load figures: the post cites research that imbalance happens, not a
 * measured distribution, and putting invented percentages on shard boxes
 * would be exactly the unsourced-number problem post 17 is about.
 */
export function HotShard({ theme }) {
  return (
    <figure
      className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5"
      role="group"
      aria-label="Several ordinary shards all route cross-shard transactions into one shard, the one hosting the high-volume corridor's liquidity provider, which becomes a bottleneck no amount of extra shards relieves."
    >
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Why parallelism stops helping
      </figcaption>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <ul className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((n) => (
            <li key={n} className="rounded-xl border border-border bg-card p-2 text-center">
              <p className="text-xs font-bold">Shard {n}</p>
              <p className="text-[11px] text-muted-foreground">ordinary load</p>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-center" aria-hidden>
          <ArrowDown className="size-4 text-muted-foreground sm:hidden" />
          <ArrowRight className="hidden size-4 text-muted-foreground sm:block" />
        </div>

        <div className={cn('rounded-2xl border-2 p-4 text-center', theme.border, theme.tint)}>
          <p className={cn('text-sm font-bold', theme.ink)}>Hot shard</p>
          <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
            hosts the high-volume corridor's liquidity provider, so most cross-shard transactions
            have to route through it and wait
          </p>
        </div>
      </div>

      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        Adding shards does not relieve this one. Splitting the busy account across more shards
        does, at the cost of yet more cross-shard transactions.
      </p>
    </figure>
  )
}

/** What more shards actually buys, worked out rather than asserted. */
export function CrossShardShare({ theme }) {
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        More shards, more cross-shard transactions
      </figcaption>

      <div className="mt-5 space-y-3">
        {crossShard.shardCounts.map((n) => {
          const share = crossShard.shareFor(n) * 100
          return (
            <div key={n} className="grid grid-cols-[3.5rem_1fr_3.5rem] items-center gap-x-2">
              <span className="text-xs font-bold tabular-nums">{n} shards</span>
              <span className="relative block h-2.5 rounded-full bg-muted">
                <span
                  className={cn('absolute inset-y-0 left-0 rounded-l-full rounded-r-[4px]', theme.bar)}
                  style={{ width: `${share}%` }}
                />
              </span>
              <span className="text-right text-xs tabular-nums text-muted-foreground">
                {share.toFixed(share < 99 ? 0 : 2)}%
              </span>
            </div>
          )
        })}
      </div>

      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        Share of {crossShard.parties}-party transfers touching more than one shard, if accounts are
        assigned independently and uniformly. Our arithmetic, not a measurement: all three share a
        shard with probability one over n squared. Uniform assignment is the generous case, because
        real traffic concentrates, which is the hot shard above.
      </p>
    </figure>
  )
}
