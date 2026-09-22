import { Fragment } from 'react'
import { AlertTriangle, ArrowDown, ArrowRight, ArrowLeftRight, Banknote, Briefcase, Clock, CloudRain, Coins, Cross, Globe, HandCoins, Landmark, Layers, Map, Megaphone, Percent, Scale, ShieldCheck, Smartphone, Store, Tag, Users, Wheat } from 'lucide-react'
import { figures, derived, usMxQ3, wfStandardWire, feeAnatomy, corridorCost, deRisking, channelCost, sendingPattern, shocks, tps, zilliqa, tpsClaims, crossShard, bridgeFailures } from '@/data/figures'
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

/* ------------------------------------------------------------------------ *
 * Post 1. What a remittance is for.
 * ------------------------------------------------------------------------ */

/**
 * What the money covers, without inventing a split.
 *
 * The post names four things a transfer pays for and never says in what
 * proportion, so neither does this. Equal boxes, no percentages: a pie chart
 * here would be four made-up numbers.
 */
export function WhatItCovers({ theme }) {
  const uses = ['Rent', 'Food', 'School fees', 'Medicine']
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        What a ${figures.benchmarkUsd} transfer is already committed to
      </figcaption>
      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {uses.map((u) => (
          <li key={u} className={cn('rounded-2xl border p-3 text-center', theme.border, theme.tint)}>
            <p className={cn('text-sm font-bold', theme.ink)}>{u}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        Deliberately unweighted. The post names what the money covers and never claims a split,
        so putting proportions on these boxes would be four invented numbers.
      </p>
    </figure>
  )
}

/** Routine and emergency are the same transfer with different stakes. */
export function SpeedStakes({ theme }) {
  const cases = [
    { head: 'Routine support', body: 'Two or three days to settle is survivable. The money is expected and budgeted.', ok: true },
    { head: 'An emergency', body: 'Treatment is needed today. A correspondent chain clearing on its own schedule is not a delay, it is the outcome.', ok: false },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        The same three days, two different meanings
      </figcaption>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {cases.map((c) => (
          <li
            key={c.head}
            className={cn(
              'rounded-2xl border p-3',
              c.ok ? cn(theme.border, theme.tint) : 'border-dashed border-border bg-card',
            )}
          >
            <p className="text-sm font-bold leading-snug">{c.head}</p>
            <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{c.body}</p>
          </li>
        ))}
      </ul>
    </figure>
  )
}

/**
 * What the fee gap costs a household over a year of monthly sending.
 *
 * Arithmetic on figures already cited: twelve transfers of the benchmark
 * amount, charged at the global average against the UN target. Nothing here
 * is a survey finding, and the caption says so.
 */
export function YearOfFees({ theme }) {
  const perYear = (pct) => (pct / 100) * figures.benchmarkUsd * 12
  const atAverage = perYear(figures.globalCostPct)
  const atTarget = perYear(figures.targetPct)
  const rows = [
    { label: `At the global average, ${figures.globalCostPct}%`, usd: atAverage },
    { label: `At the UN target, ${figures.targetPct}%`, usd: atTarget },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        A year of monthly ${figures.benchmarkUsd} transfers, lost to fees
      </figcaption>
      <div className="mt-5 space-y-5">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-sm font-bold">{r.label}</span>
              <span className="text-sm font-bold tabular-nums">${r.usd.toFixed(2)}</span>
            </div>
            <div className="h-3 rounded-full bg-muted">
              <div
                className={cn('h-3 rounded-l-full rounded-r-[4px]', theme.bar)}
                style={{ width: `${(r.usd / atAverage) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        A difference of ${(atAverage - atTarget).toFixed(2)} a year on the same money sent. Our
        arithmetic on the two cited rates, not a survey finding.
      </p>
    </figure>
  )
}

/** Delay as a health outcome, which is the section's whole claim. */
export function DelayIsAnOutcome({ theme }) {
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Where there is no insurance to fall back on
      </figcaption>
      <ol className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        {['Out-of-pocket payment required', 'Transfer has not landed', 'Medication postponed'].map(
          (step, i) => (
            <Fragment key={step}>
              {i > 0 && <Hop />}
              <li className={cn('min-w-0 flex-1 rounded-2xl border p-3', theme.border, theme.tint)}>
                <p className="text-sm font-bold leading-snug">{step}</p>
              </li>
            </Fragment>
          ),
        )}
      </ol>
      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        The last box is not a payments problem that happens to be slow. It is a health outcome.
      </p>
    </figure>
  )
}

/** The gap the whole site is about, on one scale. */
export function CostGap({ theme }) {
  const max = figures.globalCostPct
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        The gap, and what closing it is worth
      </figcaption>
      <div className="mt-5 space-y-5">
        {[
          { label: 'Global average cost today', pct: figures.globalCostPct },
          { label: 'UN target for 2030', pct: figures.targetPct },
        ].map((r) => (
          <div key={r.label}>
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-sm font-bold">{r.label}</span>
              <span className="text-sm font-bold tabular-nums">{r.pct}%</span>
            </div>
            <div className="h-3 rounded-full bg-muted">
              <div
                className={cn('h-3 rounded-l-full rounded-r-[4px]', theme.bar)}
                style={{ width: `${(r.pct / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className={cn('mt-5 rounded-2xl border p-4', theme.border, theme.tint)}>
        <span className={cn('block text-3xl font-extrabold tabular-nums', theme.ink)}>
          ~${derived.annualOverpayUsdBn} billion
        </span>
        <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">
          a year, if the gap closed. Our arithmetic: the difference between the two rates above,
          applied to ${figures.flowsUsdBn} billion of annual flows. Not a published figure, and it
          assumes the average rate applies evenly across all of them.
        </span>
      </p>
    </figure>
  )
}

/** The same flat fee, landing two completely different ways. */
export function FeeLandsDifferently({ theme }) {
  const flat = 25
  const rows = [
    { label: 'A $50,000 commercial payment', amount: 50000 },
    { label: `A $${figures.benchmarkUsd} remittance`, amount: figures.benchmarkUsd },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        One flat fee, two different transfers
      </figcaption>
      <div className="mt-5 space-y-5">
        {rows.map((r) => {
          const share = (flat / r.amount) * 100
          return (
            <div key={r.label}>
              <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="text-sm font-bold">{r.label}</span>
                <span className="text-sm font-bold tabular-nums">
                  {share < 1 ? share.toFixed(2) : share.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted">
                <div
                  className={cn('h-3 rounded-l-full rounded-r-[4px]', theme.bar)}
                  style={{ width: `${Math.max(share, 0.4)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        A flat ${flat} fee, the same number on both. Negligible overhead on one, an eighth of the
        other. Infrastructure built for the first and adapted for the second is most of why
        remittances cost what they do.
      </p>
    </figure>
  )
}

/** The five things the post has argued a remittance actually is. */
export function FiveRoles({ theme }) {
  const roles = [
    'Household income',
    'Emergency support',
    'Education funding',
    'Healthcare funding',
    'Local economic development',
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        What the money is, once you look at what it does
      </figcaption>
      <ul className="mt-4 grid gap-2 sm:grid-cols-5">
        {roles.map((r) => (
          <li key={r} className={cn('rounded-2xl border p-3', theme.border, theme.tint)}>
            <p className={cn('text-sm font-bold leading-snug', theme.ink)}>{r}</p>
          </li>
        ))}
      </ul>
    </figure>
  )
}

/* ------------------------------------------------------------------------ *
 * Post 15. Sidechains.
 * ------------------------------------------------------------------------ */

/** Two layers, and the gap between them where finality lives. */
export function BorHeimdall({ theme }) {
  const layers = [
    { name: 'Bor', does: 'Produces blocks and processes transactions at sidechain speed.', rate: 'seconds' },
    { name: 'Heimdall', does: "Bundles Bor's blocks into a Merkle root and publishes it to Ethereum as a checkpoint.", rate: `every ~${bridgeFailures.checkpointMinutes} min` },
    { name: 'Ethereum', does: 'Receives the checkpoint. It records what happened; it does not police it.', rate: 'on checkpoint' },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Where the daily work happens, and where it is recorded
      </figcaption>
      <ol className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-stretch">
        {layers.map((l, i) => (
          <Fragment key={l.name}>
            {i > 0 && <Hop />}
            <li className={cn('min-w-0 flex-1 rounded-2xl border p-3', theme.border, theme.tint)}>
              <p className="text-sm font-bold leading-snug">{l.name}</p>
              <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{l.does}</p>
              <p className={cn('mt-2 border-t pt-2 text-xs font-bold', theme.border, theme.ink)}>
                {l.rate}
              </p>
            </li>
          </Fragment>
        ))}
      </ol>
      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        The connection back to the main chain is intermittent, not constant. Everything the post
        goes on to weigh follows from that gap.
      </p>
    </figure>
  )
}

/** The three things a purpose-built chain could actually choose. */
export function ThreeCustomisations({ theme }) {
  const rows = [
    { head: 'Who may run it', body: 'Licensed, regulated money businesses rather than anonymous participants. A firm that misbehaves can lose its licence, which is collateral a pseudonymous key does not have.' },
    { head: 'Sized for real traffic', body: 'Remittance volume is steady and tied to paydays and holidays, not the sudden bursts of a token sale. A chain can be built for that shape.' },
    { head: 'Priced for small transfers', body: 'Fees set for a $200 transfer rather than a speculative trade, so unrelated activity on the same chain cannot make sending money home more expensive.' },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        What specialised would actually mean
      </figcaption>
      <ul className="mt-4 grid gap-3 sm:grid-cols-3">
        {rows.map((r) => (
          <li key={r.head} className={cn('rounded-2xl border p-3', theme.border, theme.tint)}>
            <p className={cn('text-sm font-bold leading-snug', theme.ink)}>{r.head}</p>
            <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{r.body}</p>
          </li>
        ))}
      </ul>
    </figure>
  )
}

/** The Ronin compromise, drawn as the threshold it defeated. */
export function RoninCompromise({ theme }) {
  const r = bridgeFailures.ronin
  return (
    <figure
      className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5"
      role="group"
      aria-label={`Ronin's bridge required ${r.threshold} of ${r.validators} validator signatures to approve a withdrawal. Attackers obtained ${r.compromised} keys, ${r.howCompromised}, and drained about $${r.lostUsdM} million in ${r.when}.`}
    >
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {r.threshold} of {r.validators} was the whole lock
      </figcaption>

      <ul className="mt-5 flex flex-wrap gap-2" aria-hidden>
        {Array.from({ length: r.validators }, (_, i) => {
          const taken = i < r.compromised
          return (
            <li
              key={i}
              className={cn(
                'flex size-9 items-center justify-center rounded-xl border text-xs font-bold',
                taken
                  ? cn(theme.bar, theme.border, 'text-white')
                  : cn(theme.border, 'bg-card text-muted-foreground'),
              )}
            >
              {i + 1}
            </li>
          )
        })}
      </ul>

      <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
        <p className="leading-snug">
          <span className={cn('font-bold', theme.ink)}>{r.compromised} keys taken</span>
          <span className="text-muted-foreground"> &middot; {r.howCompromised}</span>
        </p>
        <p className="leading-snug sm:text-right">
          <span className={cn('font-bold', theme.ink)}>${r.lostUsdM} million</span>
          <span className="text-muted-foreground"> drained, {r.when}</span>
        </p>
      </div>

      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        The small validator set is what made the chain fast and what made the theft possible. Those
        are not two facts about Ronin, they are one.
      </p>
    </figure>
  )
}

/** Two moments that could each be called arrival. */
export function TwoArrivals({ theme }) {
  const stops = [
    { when: 'Seconds', what: 'Confirmed on the sidechain', detail: 'To everyone involved it looks done.' },
    { when: `~${bridgeFailures.checkpointMinutes} minutes`, what: 'Checkpoint reaches Ethereum', detail: 'Only now is it locked in on the main chain.' },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Two moments called the money arrived
      </figcaption>
      <ol className="mt-4 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        {stops.map((st, i) => (
          <Fragment key={st.what}>
            {i > 0 && <Hop />}
            <li className={cn('min-w-0 flex-1 rounded-2xl border p-3', theme.border, theme.tint)}>
              <p className={cn('text-[11px] font-bold uppercase tracking-widest', theme.ink)}>
                {st.when}
              </p>
              <p className="mt-1.5 text-sm font-bold leading-snug">{st.what}</p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{st.detail}</p>
            </li>
          </Fragment>
        ))}
      </ol>
      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        A separate failure, {bridgeFailures.polyNetwork.name}, cost $
        {bridgeFailures.polyNetwork.lostUsdM} million in {bridgeFailures.polyNetwork.when} through
        the bridge contract's own authorisation logic rather than any validator. The bridge is its
        own system, with its own bugs.
      </p>
    </figure>
  )
}

/** The distinction the whole post turns on. */
export function ShardVsSidechain({ theme }) {
  const rows = [
    { head: 'A shard', body: 'Validated by participants drawn from, and accountable to, the same overall network.' },
    { head: 'A sidechain', body: 'Validated by a separate group entirely, connected only by periodic checkpoints and a bridge contract. Both are failure points independent of either chain.' },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Who is actually standing behind the transaction
      </figcaption>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map((r, i) => (
          <li
            key={r.head}
            className={cn(
              'rounded-2xl border p-3',
              i === 0 ? cn(theme.border, theme.tint) : 'border-dashed border-border bg-card',
            )}
          >
            <p className="text-sm font-bold leading-snug">{r.head}</p>
            <p className="mt-1.5 text-xs leading-snug text-muted-foreground">{r.body}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        A checkpoint tells the main chain what happened. It does not give it the power to stop it
        happening.
      </p>
    </figure>
  )
}

/** What is being traded, and the condition on the trade paying off. */
export function SidechainTradeoff({ theme }) {
  const sides = [
    { head: 'What you get', items: ['Speed', 'Lower fees', 'Rules built for one job'] },
    { head: 'What you give up', items: ['A larger validator set', 'Security inherited from the main chain', 'A single moment of finality'] },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        The trade, and what makes it worth taking
      </figcaption>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {sides.map((s, i) => (
          <div
            key={s.head}
            className={cn(
              'rounded-2xl border p-3',
              i === 0 ? cn(theme.border, theme.tint) : 'border-dashed border-border bg-card',
            )}
          >
            <p className="text-sm font-bold">{s.head}</p>
            <ul className="mt-2 space-y-1.5">
              {s.items.map((x) => (
                <li key={x} className="flex gap-2 text-xs leading-snug">
                  <span
                    className={cn(
                      'mt-1.5 size-1.5 shrink-0 rounded-full',
                      i === 0 ? theme.bar : 'bg-muted-foreground',
                    )}
                    aria-hidden
                  />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        The trade only pays off if the validator set, the bridge and the settlement design are
        chosen for remittances, rather than inherited from whatever the tooling shipped with.
      </p>
    </figure>
  )
}

/* ---------------------------------------------------------------- post 3 */

/**
 * The four components, and what each one looks like from the sender's side.
 *
 * The post's argument is that a receipt shows two numbers and there are four
 * costs. So each cell says which of the two numbers the cost hides inside,
 * and the fourth says none, which is the point of the section.
 */
export function FourComponents({ theme }) {
  const parts = [
    { Icon: Tag, name: 'Fixed fee', how: 'Shown as: the fee' },
    { Icon: Percent, name: 'Percentage fee', how: 'Shown as: the fee, blended in' },
    { Icon: ArrowLeftRight, name: 'FX markup', how: 'Shown as: the exchange rate' },
    { Icon: HandCoins, name: 'Recipient-side charges', how: 'Shown as: nothing' },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Four costs, two numbers on the screen
      </figcaption>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
        {parts.map((part, i) => (
          <li key={part.name} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
            <part.Icon className={cn('mt-0.5 size-5 shrink-0', theme.ink)} aria-hidden />
            <div className="min-w-0">
              <p className="text-sm font-bold leading-snug">
                <span className={cn('tabular-nums', theme.ink)}>{i + 1}.</span> {part.name}
              </p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{part.how}</p>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  )
}

/**
 * The post's own example: a $5 fee on $50 and on $1,000. Arithmetic on the
 * post's numbers, not a sourced figure. The bar for the small transfer is the
 * one that is hard to miss, which is the order the post argues in.
 */
export function FixedFeeBite({ theme }) {
  const fee = 5
  const rows = [
    { label: 'A $50 transfer', amount: 50 },
    { label: 'A $1,000 transfer', amount: 1000 },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        The same ${fee} fee, as a share of what is sent
      </figcaption>
      <div className="mt-5 space-y-5">
        {rows.map((r) => {
          const share = (fee / r.amount) * 100
          return (
            <div key={r.label}>
              <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="text-sm font-bold">{r.label}</span>
                <span className="text-sm font-bold tabular-nums">
                  {share < 1 ? share.toFixed(1) : share.toFixed(0)}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-muted">
                <div
                  className={cn('h-3 rounded-l-full rounded-r-[4px]', theme.bar)}
                  style={{ width: `${Math.max(share, 0.6)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        Scale runs to 100%. The fee does not move; the transfer under it does.
      </p>
    </figure>
  )
}

/**
 * Fee and exchange rate margin as two segments of one bar, per provider.
 *
 * Shared by the two figures below because they make the same point with
 * different rows: the fee is the visible part, the margin is the rest, and
 * only the whole bar is the price. Fee is drawn in the series colour and the
 * margin in the second green from post 2's two-products figure, so a reader
 * who has seen that one is looking at the same convention.
 *
 * Everything is in percent of the amount sent. The two RPW rows are priced in
 * sterling and euros on different benchmark amounts, and a percentage is the
 * only unit on which they can share an axis.
 */
function FeeStack({ theme, rows, scale, label, note }) {
  const pct = (v) => `${(v / scale) * 100}%`
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </figcaption>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
        <span className="inline-flex items-center gap-2">
          <span className={cn('size-2.5 rounded-sm', theme.bar)} aria-hidden />
          <span className="font-bold">Fee</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-sm" style={{ backgroundColor: MARKUP_FILL }} aria-hidden />
          <span className="font-bold">Exchange rate margin</span>
        </span>
      </div>

      <div className="mt-5 space-y-5">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-sm font-bold">{row.label}</span>
              <span className="text-sm font-bold tabular-nums">{row.total}</span>
            </div>
            <div className="relative h-3 rounded-full bg-muted">
              <div className="absolute inset-y-0 left-0 right-0 flex">
                <span className={cn('h-3 rounded-l-full', theme.bar)} style={{ width: pct(row.feePct) }} />
                <span
                  className="h-3 rounded-r-[4px]"
                  style={{ width: pct(row.marginPct), backgroundColor: MARKUP_FILL, marginLeft: 2 }}
                />
              </div>
              <div
                className="absolute inset-y-[-4px] w-px border-l border-dashed border-foreground/40"
                style={{ left: pct(figures.targetPct) }}
                aria-hidden
              />
            </div>
            <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
              fee {row.feePct.toFixed(2)}% &middot; margin {row.marginPct.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Dashed line: the UN target of {figures.targetPct}% by 2030. Scale runs to {scale}%. {note}
      </p>
    </figure>
  )
}

/** Two RPW records: a low fee with a thin margin, a higher fee with a wide one. */
export function FeeVersusTotal({ theme }) {
  const wr = feeAnatomy.worldRemit
  const wu = feeAnatomy.westernUnion
  const feePct = (r) => (r.fee / r.sendAmount) * 100
  return (
    <FeeStack
      theme={theme}
      label="Fee against total cost, on the $200 benchmark"
      scale={15}
      rows={[
        { label: wr.label, feePct: feePct(wr), marginPct: wr.marginPct, total: `${wr.totalPct}%` },
        { label: wu.label, feePct: feePct(wu), marginPct: wu.marginPct, total: `${wu.totalPct}%` },
      ]}
      note="World Bank RPW, priced in the sending currency on its local benchmark amount. The fees are less than two to one; the totals are more than five."
    />
  )
}

/** The equation run on the two products post 2 priced. Same figures, same source. */
export function EquationAtWork({ theme }) {
  const rows = [usMxQ3.wellsFargo, usMxQ3.delgadoTravel].map((r) => {
    const feePct = (r.feeUsd / figures.benchmarkUsd) * 100
    return {
      label: r.label,
      feePct,
      marginPct: r.totalPct - feePct,
      total: `${r.totalPct}% \u00b7 $${r.totalUsd.toFixed(2)}`,
    }
  })
  return (
    <FeeStack
      theme={theme}
      label={`The equation, run on a $${figures.benchmarkUsd} send to Mexico`}
      scale={6}
      rows={rows}
      note="The same $6.00 fee on both. Every cent of the difference is the exchange rate."
    />
  )
}

/* ---------------------------------------------------------------- post 4 */

/**
 * Corridor costs on one scale, drawn with the same bar as post 2's cost
 * figure and the same dashed target line. Two figures share it: the opening
 * gap, and the competition section's three. A `range` row is hollow, for a
 * figure the post's source gives only as "around".
 */
function CorridorBars({ theme, rows, scale, label, note }) {
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </figcaption>
      <div className="mt-5 space-y-5">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-sm font-bold">{row.label}</span>
              <span className="text-sm font-bold tabular-nums">
                {row.approx ? 'about ' : ''}
                {row.pct}%
              </span>
            </div>
            <div className="relative h-3 rounded-full bg-muted">
              <div
                className={cn(
                  'h-3 rounded-l-full rounded-r-[4px]',
                  row.approx ? cn('border', theme.border, 'bg-transparent') : theme.bar,
                )}
                style={{ width: `${Math.max((row.pct / scale) * 100, 0.8)}%` }}
              />
              <div
                className="absolute inset-y-[-4px] w-px border-l border-dashed border-foreground/40"
                style={{ left: `${(figures.targetPct / scale) * 100}%` }}
                aria-hidden
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Dashed line: the UN target of {figures.targetPct}% by 2030. Scale runs to {scale}%. {note}
      </p>
    </figure>
  )
}

/** The opening contrast: same $200, two corridors, one scale. */
export function CorridorGap({ theme }) {
  const { usMx, zaMw } = corridorCost
  return (
    <CorridorBars
      theme={theme}
      label="Average total cost of a $200 send, Q3 2025"
      scale={35}
      rows={[usMx, zaMw]}
      note={`World Bank RPW corridor averages. One is ${(zaMw.pct / usMx.pct).toFixed(1)} times the other.`}
    />
  )
}

/** The competition section's three, on the same scale as the opening pair. */
export function CompetitionBars({ theme }) {
  const { aeIn, saPk, zaBw } = corridorCost
  return (
    <CorridorBars
      theme={theme}
      label="Where providers compete, and where they do not"
      scale={35}
      rows={[aeIn, saPk, zaBw]}
      note="Hollow bars are figures the post's source gives as approximate. Same scale as the figure above, so the three can be read against Malawi."
    />
  )
}

/**
 * Correspondent counterparties lost, as the part of a bar that is gone.
 *
 * The suggestion was two shrinking network diagrams. A network drawn with
 * an invented number of nodes would be a picture of a number the source
 * does not give; the source gives a share, so the figure draws a share.
 * South Africa's is a floor ("more than 10%") and is labelled as one.
 */
export function LostCounterparties({ theme }) {
  const rows = [deRisking.southAfrica, deRisking.angola]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Foreign correspondent counterparties, 2013 to 2015
      </figcaption>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
        <span className="inline-flex items-center gap-2">
          <span className={cn('size-2.5 rounded-sm', theme.bar)} aria-hidden />
          <span className="font-bold">Kept</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className={cn('size-2.5 rounded-sm border border-dashed', theme.border)} aria-hidden />
          <span className="font-bold">Lost</span>
        </span>
      </div>
      <div className="mt-5 space-y-5">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-sm font-bold">{r.label}</span>
              <span className="text-sm font-bold tabular-nums">
                {r.atLeast ? 'more than ' : ''}
                {r.lostPct}% lost
              </span>
            </div>
            <div className={cn('relative h-3 rounded-full border border-dashed', theme.border)}>
              <div
                className={cn('h-full rounded-l-full rounded-r-[4px]', theme.bar)}
                style={{ width: `${100 - r.lostPct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        SWIFT data, as reported at Sibos 2016. The whole bar is the counterparties a country's banks
        had in 2013; the filled part is what was left two years on.
      </p>
    </figure>
  )
}

/**
 * The last mile, as hops. Where a map was suggested, and a map drawn by hand
 * would be a guess at borders and a guess at where people live. The post's
 * point is about how many steps stand between arrival and the recipient, and
 * a chain shows steps.
 */
export function LastMile({ theme }) {
  return (
    <Chain
      theme={theme}
      aria="Two deliveries: one step to an urban recipient, four steps to a rural one"
      stops={[
        { title: 'Money arrives', sub: 'in the country' },
        { title: 'Capital city', sub: 'bank or agent hub' },
        { title: 'Regional town', sub: 'cash moved by road' },
        { title: 'Village agent', sub: 'if there is one' },
        { title: 'Recipient', sub: 'collects in cash', note: 'last mile' },
      ]}
      footer={[
        { lead: 'Dense, urban:', rest: 'the first box and the last, with nothing between them.' },
        { lead: 'Landlocked, rural:', rest: 'every box, and every one is a cost.' },
      ]}
    />
  )
}

/** The two channel averages the post quotes, on one scale. */
export function ChannelCost({ theme }) {
  const rows = [channelCost.mobileMoney, channelCost.banks]
  return (
    <CorridorBars
      theme={theme}
      label="Average cost of a $200 send, by channel, Q1 2025"
      scale={16}
      rows={rows}
      note={`World Bank RPW main report. Banks are ${(channelCost.banks.pct / channelCost.mobileMoney.pct).toFixed(1)} times mobile money.`}
    />
  )
}

/** The seven factors, in the order the post takes them. */
export function SevenFactors({ theme }) {
  const factors = [
    { Icon: Users, name: 'Competition' },
    { Icon: Landmark, name: 'Correspondent-banking relationships' },
    { Icon: Coins, name: 'Currency liquidity' },
    { Icon: Scale, name: 'Regulation' },
    { Icon: Map, name: 'Geography' },
    { Icon: Smartphone, name: 'Payment infrastructure' },
    { Icon: Banknote, name: 'Cash-distribution networks' },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Seven properties of a corridor, none of them of the transfer
      </figcaption>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
        {factors.map((f, i) => (
          <li key={f.name} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <f.Icon className={cn('size-5 shrink-0', theme.ink)} aria-hidden />
            <p className="text-sm font-bold leading-snug">
              <span className={cn('tabular-nums', theme.ink)}>{i + 1}.</span> {f.name}
            </p>
          </li>
        ))}
      </ol>
    </figure>
  )
}

/* ---------------------------------------------------------------- post 5 */

/**
 * A year of sending, two ways. Sixteen marks for the observed pattern and
 * two for the batched alternative the post argues against, each sized to
 * its share of the same total, laid along one strip of twelve months. The
 * sixteen are spaced evenly because the source gives a count, not dates.
 */
export function SixteenAYear({ theme }) {
  const n = sendingPattern.sendsPerYear
  const avg = tps.usMxAvgUsd
  const rows = [
    { label: `${n} transfers of about $${avg}`, count: n },
    { label: `2 transfers of about $${((avg * n) / 2).toLocaleString('en-US')}`, count: 2 },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        The same year's money, sent two ways
      </figcaption>
      <div className="mt-5 space-y-6">
        {rows.map((r) => (
          <div key={r.label}>
            <p className="mb-2 text-sm font-bold">{r.label}</p>
            <div className="flex items-end gap-1" style={{ height: 40 }} aria-hidden>
              {Array.from({ length: r.count }, (_, i) => (
                <span
                  key={i}
                  className={cn('flex-1 rounded-t-[3px]', theme.bar)}
                  /* Height is each transfer's share of the year, scaled so
                     the batched pair fills the strip: 1/16 against 1/2. */
                  style={{ height: `${(2 / r.count) * 100}%`, minHeight: 6, maxWidth: r.count === 2 ? '48%' : undefined }}
                />
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[10px] uppercase tracking-widest text-muted-foreground">
              <span>Jan</span>
              <span>Dec</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
        Inter-American Dialogue, US to Mexico: about {n} sends a year at about ${avg} each. The
        second row is what batching the same total into two would look like, which is the thing
        the fee structure rewards and families do not do.
      </p>
    </figure>
  )
}

/** Fifteen percent sent home, the rest stays. One bar, two segments, the UN's figure. */
export function EarningsShare({ theme }) {
  const sent = sendingPattern.earningsSharePct
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        A migrant worker's earnings, on average
      </figcaption>
      <div className="mt-5 flex h-8 overflow-hidden rounded-full bg-muted" role="img" aria-label={`${sent}% sent home, ${100 - sent}% stays where it was earned`}>
        <div className={cn('h-full', theme.bar)} style={{ width: `${sent}%` }} />
        <div className={cn('h-full border-l-2 border-background', theme.tint)} style={{ width: `${100 - sent}%` }} />
      </div>
      <div className="mt-2 flex justify-between text-sm">
        <span className="font-bold">
          <span className={theme.ink}>{sent}%</span> sent home
        </span>
        <span className="text-muted-foreground">{100 - sent}% stays where it was earned</span>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        UN DESA. A recurring line in two household budgets at once, which is why it is sent on
        the rhythm of a paycheck rather than in a lump.
      </p>
    </figure>
  )
}

/**
 * What one failed transfer can take, as the post's own example: $200 if the
 * year is sent in eight pieces, $1,600 if it rides on one. Illustrative, and
 * the caption says so.
 */
export function ExposureCap({ theme }) {
  const { illustrativeSendUsd: small, illustrativeYearUsd: big } = sendingPattern
  const rows = [
    { label: 'Sent in small transfers', value: small, note: 'the most one mistake can cost' },
    { label: 'Sent all at once', value: big, note: 'a year of support on one transfer' },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        How much one transfer going wrong can take
      </figcaption>
      <div className="mt-5 space-y-5">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-sm font-bold">{r.label}</span>
              <span className="text-sm font-bold tabular-nums">${r.value.toLocaleString()}</span>
            </div>
            <div className="h-3 rounded-full bg-muted">
              <div className={cn('h-3 rounded-l-full rounded-r-[4px]', theme.bar)} style={{ width: `${(r.value / big) * 100}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">{r.note}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        The post's own example, not a measured figure: the same ${big.toLocaleString()} a year,
        exposed ${small} at a time or all at once.
      </p>
    </figure>
  )
}

/* ---------------------------------------------------------------- post 6 */

/** The five shocks the post takes in turn, in its order. */
export function FiveShocks({ theme }) {
  const items = [
    { Icon: Cross, name: 'Medical emergencies' },
    { Icon: Briefcase, name: 'Unemployment' },
    { Icon: CloudRain, name: 'Natural disasters' },
    { Icon: Wheat, name: 'Crop failure' },
    { Icon: Megaphone, name: 'Political instability' },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        One mechanism, five kinds of shock
      </figcaption>
      <ol className="mt-4 grid gap-2 sm:grid-cols-5">
        {items.map((it, i) => (
          <li key={it.name} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-col sm:items-start sm:gap-2">
            <it.Icon className={cn('size-5 shrink-0', theme.ink)} aria-hidden />
            <p className="text-sm font-bold leading-snug">
              <span className={cn('tabular-nums', theme.ink)}>{i + 1}.</span> {it.name}
            </p>
          </li>
        ))}
      </ol>
    </figure>
  )
}

/**
 * Jamaica: spending falls 19% after a health shock, and remittances put
 * it back. Two bars against a 100% baseline, the second with the offset
 * drawn back in, because the finding is the restoration, not the drop.
 */
export function HealthShock({ theme }) {
  const drop = shocks.jamaica.spendingDropPct
  const rows = [
    { label: 'After a health shock', value: 100 - drop, offset: 0 },
    { label: 'With remittances', value: 100 - drop, offset: drop },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Household spending, Jamaica, as a share of before
      </figcaption>
      <div className="mt-5 space-y-5">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-sm font-bold">{r.label}</span>
              <span className="text-sm font-bold tabular-nums">{r.value + r.offset}%</span>
            </div>
            <div className="relative h-3 rounded-full bg-muted">
              <div className="absolute inset-y-0 left-0 right-0 flex">
                <span className={cn('h-3 rounded-l-full', !r.offset && 'rounded-r-[4px]', theme.bar)} style={{ width: `${r.value}%` }} />
                {r.offset > 0 && (
                  <span className="h-3 rounded-r-[4px]" style={{ width: `${r.offset}%`, backgroundColor: MARKUP_FILL, marginLeft: 2 }} />
                )}
              </div>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {r.offset ? `the ${drop}% put back, in the lighter green` : `${drop}% below where it was`}
            </p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Inter-American Development Bank, 2014. The full offset holds only for households without
        private health insurance; where there was cover, remittances did not move.
      </p>
    </figure>
  )
}

/**
 * 2009, two countries, two arrows each. Remittances and unemployment in
 * opposite directions in both, which is the whole riddle. Bars run from a
 * centre line so a fall and a rise read as different directions rather
 * than different lengths.
 */
export function UnemploymentRiddle({ theme }) {
  const c = shocks.crisis2009
  const rows = [
    { label: 'Moldova', ...c.moldova },
    { label: 'Fiji', ...c.fiji },
  ]
  const scale = 70
  const Bar = ({ value, fill }) => (
    <div className="relative h-3 w-full rounded-full bg-muted">
      <div className="absolute inset-y-[-3px] left-1/2 w-px bg-foreground/40" aria-hidden />
      <div
        className={cn('absolute inset-y-0 h-3', value >= 0 ? 'rounded-r-[4px]' : 'rounded-l-[4px]')}
        style={{
          left: value >= 0 ? '50%' : `${50 - (Math.abs(value) / scale) * 50}%`,
          width: `${(Math.abs(value) / scale) * 50}%`,
          backgroundColor: fill,
        }}
      />
    </div>
  )
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        2009: remittances and unemployment, change on the year
      </figcaption>
      <div className="mt-5 space-y-6">
        {rows.map((r) => (
          <div key={r.label}>
            <p className="mb-2 text-sm font-bold">{r.label}</p>
            <div className="grid grid-cols-[7rem_1fr_3.5rem] items-center gap-x-3 gap-y-2 text-xs">
              <span className="text-muted-foreground">Remittances</span>
              <Bar value={r.remittancesPct} fill="var(--color-primary)" />
              <span className="text-right font-bold tabular-nums">{r.remittancesPct > 0 ? '+' : ''}{r.remittancesPct}%</span>
              <span className="text-muted-foreground">Unemployment</span>
              <Bar value={r.unemploymentPct} fill={MARKUP_FILL} />
              <span className="text-right font-bold tabular-nums">{r.unemploymentPct > 0 ? '+' : ''}{r.unemploymentPct}%</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        World Bank, People Move. Falls run left of the line, rises right; scale runs to {scale}% each
        way. In both countries the two moved in opposite directions.
      </p>
    </figure>
  )
}

/**
 * Two households through the same drought, from the Ethiopia finding: one
 * draws on cash, one sells the livestock. Drawn as what each is left with
 * on the other side, since that is the post's point.
 */
export function TwoPaths({ theme }) {
  const rows = [
    {
      label: 'With remittances',
      steps: ['Flood, then drought', 'Draws on cash reserves', 'Keeps the livestock'],
      after: 'Income to rebuild with',
      kept: true,
    },
    {
      label: 'Without',
      steps: ['Flood, then drought', 'Sells the livestock', 'Cash for now'],
      after: 'Nothing earning next year',
      kept: false,
    },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Same shock, two ways through it
      </figcaption>
      <div className="mt-4 space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="rounded-2xl border border-border bg-card p-3">
            <p className={cn('text-xs font-bold uppercase tracking-widest', theme.ink)}>{r.label}</p>
            <div className="mt-2 flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
              {r.steps.map((st, i) => (
                <Fragment key={st}>
                  {i > 0 && <Hop />}
                  <div className="min-w-0 flex-1 rounded-xl border border-border px-3 py-2 text-center text-sm font-bold leading-snug">{st}</div>
                </Fragment>
              ))}
              <Hop />
              <div className={cn('min-w-0 flex-1 rounded-xl border px-3 py-2 text-center text-sm font-bold leading-snug', r.kept ? cn(theme.border, theme.tint, theme.ink) : 'border-dashed border-border text-muted-foreground')}>
                {r.after}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        World Bank, on Ethiopian households after the 1998 floods. The filled box is the one that
        still has something earning when the drought ends.
      </p>
    </figure>
  )
}

/* ---------------------------------------------------------------- post 8 */

/** The four roles, in the order a payment meets them. */
export function FourRoles({ theme }) {
  return (
    <Chain
      theme={theme}
      aria="The four roles in a cross-border payment chain, in order: originator bank, correspondent bank, intermediary bank, beneficiary bank"
      stops={[
        { title: 'Originator bank', sub: 'where it starts' },
        { title: 'Correspondent bank', sub: 'moves it on the originator\'s behalf', note: 'own fee' },
        { title: 'Intermediary bank', sub: 'sometimes, before the last link', note: 'own fee' },
        { title: 'Beneficiary bank', sub: 'credits the recipient' },
      ]}
      footer={[
        { lead: 'Each one', rest: 'routes, screens, converts if needed, and deducts.' },
        { lead: 'Each pair', rest: 'is joined by a Nostro and Vostro account, debited and credited in step.' },
      ]}
    />
  )
}

/** The post's worked example, five institutions between London and Vietnam. */
export function LondonToVietnam({ theme }) {
  return (
    <Chain
      theme={theme}
      aria="A payment from a bank in London to a bank in Vietnam passes through a correspondent in Frankfurt, a regional correspondent in Singapore and a domestic correspondent in Vietnam before reaching the recipient's bank: five institutions"
      stops={[
        { title: 'London', sub: 'originator' },
        { title: 'Frankfurt', sub: 'large correspondent', note: 'own fee, own queue' },
        { title: 'Singapore', sub: 'regional correspondent', note: 'own fee, own queue' },
        { title: 'Vietnam', sub: 'domestic correspondent', note: 'own fee, own queue' },
        { title: "Recipient's bank", sub: 'beneficiary' },
      ]}
      footer={[
        { lead: 'Five institutions', rest: 'touch one payment: the originator, three correspondents, the beneficiary.' },
        { lead: 'Each is a separate business', rest: 'with its own compliance, its own fee schedule, its own schedule.' },
      ]}
    />
  )
}

/**
 * Who pays the banks in the middle, under each of the three codes.
 *
 * The suggestion asked for three final amounts. The post gives no per-hop
 * fees for its example, and any figures here would have been invented, so
 * the figure shows the thing the codes actually decide: at each hop, whose
 * money the fee comes out of. That is enough to see why the same chain
 * lands three different amounts.
 */
export function WhoPays({ theme }) {
  const hops = ['Originator', 'Frankfurt', 'Singapore', 'Vietnam', 'Beneficiary']
  const codes = [
    { code: 'SHA', name: 'Shared', who: ['sender', 'in transit', 'in transit', 'in transit', 'in transit'], lands: 'less each fee in the middle' },
    { code: 'OUR', name: 'Sender pays', who: ['sender', 'sender', 'sender', 'sender', 'sender'], lands: 'the full amount' },
    { code: 'BEN', name: 'Recipient pays', who: ['in transit', 'in transit', 'in transit', 'in transit', 'in transit'], lands: 'less every fee in the chain' },
  ]
  const tone = (w) => (w === 'sender' ? cn(theme.border, theme.tint, theme.ink) : 'border-dashed border-border text-muted-foreground')
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Same chain, same amount sent, three codes
      </figcaption>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs">
        <span className="inline-flex items-center gap-2">
          <span className={cn('size-2.5 rounded-sm border', theme.border, theme.tint)} aria-hidden />
          <span className="font-bold">Fee paid by the sender up front</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-sm border border-dashed border-border" aria-hidden />
          <span className="font-bold">Fee taken from the money in transit</span>
        </span>
      </div>
      <div className="-mx-4 mt-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[30rem] border-collapse text-xs">
          <thead>
            <tr>
              <th scope="col" className="py-2 pr-3 text-left font-bold">Code</th>
              {hops.map((h) => (
                <th key={h} scope="col" className="py-2 pr-2 text-left font-bold">{h}</th>
              ))}
              <th scope="col" className="py-2 text-left font-bold">Recipient gets</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.code} className="border-t border-border">
                <th scope="row" className="py-2.5 pr-3 text-left">
                  <span className={cn('font-bold', theme.ink)}>{c.code}</span>
                  <span className="block text-muted-foreground">{c.name}</span>
                </th>
                {c.who.map((w, i) => (
                  <td key={i} className="py-2.5 pr-2">
                    <span className={cn('inline-block rounded-md border px-2 py-1 font-medium', tone(w))}>{w}</span>
                  </td>
                ))}
                <td className="py-2.5 font-bold">{c.lands}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Whose money each bank's fee comes out of, under each code. No per-hop amount is drawn
        because the post's sources give none for this route; the size of the gap is a fact about
        the banks, the direction of it is a fact about the code.
      </p>
    </figure>
  )
}

/** Three effects, one per hop, with what the post says each one does. */
export function ThreeEffects({ theme }) {
  const rows = [
    { name: 'Time', what: 'Received, screened, queued and forwarded on that bank\'s own schedule. One to five business days in total.' },
    { name: 'Cost', what: 'A fee taken before forwarding, nothing to $50 or more, from a schedule no customer can read in advance.' },
    { name: 'Visibility', what: 'The sender\'s bank does not know which banks come next until the payment is under way.' },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        What every extra link adds
      </figcaption>
      <ul className="mt-4 grid gap-2 sm:grid-cols-3">
        {rows.map((r) => (
          <li key={r.name} className={cn('rounded-2xl border p-3', theme.border, theme.tint)}>
            <p className={cn('text-sm font-bold', theme.ink)}>{r.name}</p>
            <p className="mt-1 text-xs leading-snug text-muted-foreground">{r.what}</p>
          </li>
        ))}
      </ul>
    </figure>
  )
}

/* ---------------------------------------------------------------- post 9 */

/**
 * The three stages as rungs, the third hollow. Drawn where the post has
 * covered two of them and is about to name the third, so the empty rung is
 * the set-up rather than a summary.
 */
export function ThreeStages({ theme }) {
  const rungs = [
    { name: 'Clearing', what: 'Instruction sent, details reconciled, obligation confirmed. No money moves.', done: true },
    { name: 'Settlement', what: 'The money moves and becomes available, between accounts at a central bank.', done: true },
    { name: 'Finality', what: 'The point after which it cannot be undone.', done: false },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Three stages, two covered so far
      </figcaption>
      <ol className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-stretch">
        {rungs.map((r, i) => (
          <Fragment key={r.name}>
            {i > 0 && <Hop />}
            <li className={cn('min-w-0 flex-1 rounded-2xl border p-3', r.done ? cn(theme.border, theme.tint) : 'border-dashed border-border')}>
              <p className={cn('text-sm font-bold', r.done ? theme.ink : 'text-muted-foreground')}>
                <span className="tabular-nums">{i + 1}.</span> {r.name}
              </p>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{r.what}</p>
            </li>
          </Fragment>
        ))}
      </ol>
    </figure>
  )
}

/**
 * The ACH window: credit visible on day one, provisional for five business
 * days, final after. The post's own example, with NACHA's number.
 */
export function ProvisionalWindow({ theme }) {
  const days = 5
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        An ACH credit, from appearing to final
      </figcaption>
      <div className="mt-6">
        <div className="relative h-3 rounded-full bg-muted">
          <div className={cn('absolute inset-y-0 left-0 rounded-l-full border border-dashed', theme.border)} style={{ width: '78%' }} aria-hidden />
          <div className={cn('absolute inset-y-0 rounded-r-full', theme.bar)} style={{ left: '78%', right: 0 }} aria-hidden />
          <span className="absolute inset-y-[-5px] left-0 w-0.5 bg-foreground/60" aria-hidden />
          <span className="absolute inset-y-[-5px] w-0.5 bg-foreground/60" style={{ left: '78%' }} aria-hidden />
        </div>
        <div className="mt-2 grid grid-cols-[auto_1fr_auto] text-xs">
          <span className="font-bold">Day 1: credit appears</span>
          <span className="text-center text-muted-foreground">provisional for {days} business days</span>
          <span className={cn('font-bold', theme.ink)}>final</span>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        NACHA rules let the originating bank reverse the credit for up to {days} business days. The
        dashed stretch is money the recipient can see and spend that has not reached finality.
      </p>
    </figure>
  )
}

/** What "sent" has and has not done, stage by stage. */
export function WhatSentMeans({ theme }) {
  const rows = [
    { stage: 'Clearing', status: 'done', note: 'the instruction has left', tone: 'done' },
    { stage: 'Settlement', status: 'maybe', note: 'the money may not have moved', tone: 'maybe' },
    { stage: 'Finality', status: 'almost certainly not yet', note: 'it can still be undone', tone: 'no' },
  ]
  const tone = (t) => (t === 'done' ? cn(theme.border, theme.tint, theme.ink) : t === 'maybe' ? 'border-border bg-card text-foreground' : 'border-dashed border-border text-muted-foreground')
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        What the word "sent" is telling you
      </figcaption>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className={cn('rounded-2xl border px-5 py-4 text-center sm:w-40 sm:shrink-0', theme.border, theme.tint)}>
          <p className={cn('text-2xl font-extrabold', theme.ink)}>Sent</p>
          <p className="text-xs text-muted-foreground">on the screen</p>
        </div>
        <ul className="grid flex-1 gap-2">
          {rows.map((r) => (
            <li key={r.stage} className={cn('flex flex-wrap items-baseline justify-between gap-x-3 rounded-xl border px-3 py-2', tone(r.tone))}>
              <span className="text-sm font-bold">{r.stage}: {r.status}</span>
              <span className="text-xs">{r.note}</span>
            </li>
          ))}
        </ul>
      </div>
    </figure>
  )
}

/* --------------------------------------------------------------- post 10 */

/** The post's own example: 4 p.m. in California is midnight in the UK. */
export function WorldClock({ theme }) {
  const places = [
    { name: 'California', time: '4 p.m.', state: 'bank open, an hour before cutoff', open: true },
    { name: 'United Kingdom', time: 'midnight', state: 'bank closed until morning', open: false },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        The same moment, at both ends
      </figcaption>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {places.map((p) => (
          <div key={p.name} className={cn('rounded-2xl border p-4', p.open ? cn(theme.border, theme.tint) : 'border-dashed border-border')}>
            <p className="text-sm font-bold">{p.name}</p>
            <p className={cn('mt-1 text-3xl font-extrabold tabular-nums', p.open ? theme.ink : 'text-muted-foreground')}>{p.time}</p>
            <p className="mt-1 text-xs text-muted-foreground">{p.state}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Eight hours apart. The sending side can start at once; the receiving side cannot start at
        all until it opens.
      </p>
    </figure>
  )
}

/**
 * Continuous against batched: the same eight payments, one row released as
 * they come, the other held and released in two windows. Dots, not a
 * queue simulation; the point is the gap, not the throughput.
 */
export function BatchVsStream({ theme }) {
  const Dot = ({ on }) => (
    <span className={cn('size-3 shrink-0 rounded-full', on ? theme.bar : cn('border', theme.border))} aria-hidden />
  )
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Eight payments, two ways of processing them
      </figcaption>
      <div className="mt-5 space-y-5">
        <div>
          <p className="mb-2 text-sm font-bold">One by one, as they arrive</p>
          <div className="flex items-center justify-between" aria-label="Eight payments processed as each arrives">
            {Array.from({ length: 8 }, (_, i) => <Dot key={i} on />)}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Each moves the moment it is ready. Wires work this way.</p>
        </div>
        <div>
          <p className="mb-2 text-sm font-bold">In batches, at set windows</p>
          <div className="flex items-center justify-between" aria-label="Eight payments held and released in two batches">
            <span className="flex items-center gap-1">{Array.from({ length: 4 }, (_, i) => <Dot key={i} on={i === 3} />)}</span>
            <span className={cn('text-xs font-bold', theme.ink)}>window</span>
            <span className="flex items-center gap-1">{Array.from({ length: 4 }, (_, i) => <Dot key={i} on={i === 3} />)}</span>
            <span className={cn('text-xs font-bold', theme.ink)}>window</span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Hollow dots wait; the batch moves together at the window. ACH works this way, and so do
            the compliance and conversion steps around a wire.
          </p>
        </div>
      </div>
    </figure>
  )
}

/** The chain from post 8, with the three delays stacked under every link. */
export function DelaysRepeat({ theme }) {
  const banks = ['Originator', 'Correspondent', 'Correspondent', 'Beneficiary']
  const delays = [
    { Icon: Clock, name: 'cutoff' },
    { Icon: Layers, name: 'batch window' },
    { Icon: ShieldCheck, name: 'compliance' },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Every delay, at every bank
      </figcaption>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start">
        {banks.map((b, i) => (
          <Fragment key={i}>
            {i > 0 && <div className="flex shrink-0 items-center justify-center sm:pt-4" aria-hidden><Hop /></div>}
            <div className="min-w-0 flex-1 rounded-2xl border border-border bg-card p-3">
              <p className="text-sm font-bold">{b}</p>
              <ul className="mt-2 space-y-1">
                {delays.map((d) => (
                  <li key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <d.Icon className={cn('size-3.5 shrink-0', theme.ink)} aria-hidden />
                    {d.name}
                  </li>
                ))}
              </ul>
            </div>
          </Fragment>
        ))}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        The chain from the previous post. Each bank runs its own cutoff, its own windows and its
        own screening, and none of them share a clock.
      </p>
    </figure>
  )
}

/** The sender's account from the World Bank blog: charged at once, usable four days on. */
export function ChargedVsAvailable({ theme }) {
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        One transfer, two moments
      </figcaption>
      <div className="mt-6">
        <div className="relative h-3 rounded-full bg-muted">
          <div className={cn('absolute inset-y-0 left-0 w-full rounded-full border border-dashed', theme.border)} aria-hidden />
          <span className={cn('absolute inset-y-[-5px] left-0 w-1 rounded-full', theme.bar)} aria-hidden />
          <span className={cn('absolute inset-y-[-5px] right-0 w-1 rounded-full', theme.bar)} aria-hidden />
        </div>
        <div className="mt-2 flex justify-between text-xs">
          <span>
            <span className="block font-bold">Card charged</span>
            <span className="text-muted-foreground">the moment it was sent</span>
          </span>
          <span className="text-right">
            <span className="block font-bold">Cash ready to collect</span>
            <span className={cn('font-bold', theme.ink)}>four days later</span>
          </span>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        One sender's account, as told to the World Bank. The dashed stretch is the four days in
        which neither side had the money.
      </p>
    </figure>
  )
}

/** The eight, in the order the post takes them. */
export function EightGears({ theme }) {
  const gears = [
    { Icon: Globe, name: 'Time zones' },
    { Icon: Clock, name: 'Cutoff times' },
    { Icon: Layers, name: 'Batching' },
    { Icon: ShieldCheck, name: 'Compliance review' },
    { Icon: Landmark, name: 'Intermediary institutions' },
    { Icon: ArrowLeftRight, name: 'FX conversion' },
    { Icon: AlertTriangle, name: 'Exceptions' },
    { Icon: Store, name: 'Local distribution' },
  ]
  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Eight gears, none of them the bottleneck
      </figcaption>
      <ol className="mt-4 grid gap-2 sm:grid-cols-4">
        {gears.map((g, i) => (
          <li key={g.name} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
            <g.Icon className={cn('size-5 shrink-0', theme.ink)} aria-hidden />
            <p className="text-sm font-bold leading-snug">
              <span className={cn('tabular-nums', theme.ink)}>{i + 1}.</span> {g.name}
            </p>
          </li>
        ))}
      </ol>
    </figure>
  )
}
