import { Fragment } from 'react'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { figures, usMxQ3, wfStandardWire } from '@/data/figures'
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
