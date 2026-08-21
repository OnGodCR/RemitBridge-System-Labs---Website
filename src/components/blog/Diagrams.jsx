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

/** Path A: the correspondent chain, and where it leaks money and time. */
export function CorrespondentChain({ theme }) {
  return (
    <figure
      className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5"
      role="group"
      aria-label="A transfer routes from the sender's bank through two correspondent banks holding Nostro and Vostro accounts to the recipient's bank, with a fee deducted at each correspondent hop and final settlement on RTGS during business hours."
    >
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <Node theme={theme} title="Sender's bank" sub="compliance screening" />
        <Hop />
        <Node theme={theme} title="Correspondent bank" sub="Nostro / Vostro" note="fee deducted" />
        <Hop />
        <Node theme={theme} title="Correspondent bank" sub="Nostro / Vostro" note="fee deducted" />
        <Hop />
        <Node theme={theme} title="Recipient's bank" sub="pays out" />
      </div>

      <div className="mt-4 grid gap-2 border-t border-border pt-4 text-xs sm:grid-cols-2">
        <p className="leading-snug">
          <span className={cn('font-bold', theme.ink)}>FX spread</span>
          <span className="text-muted-foreground"> applied at one of these points</span>
        </p>
        <p className="leading-snug sm:text-right">
          <span className={cn('font-bold', theme.ink)}>RTGS settlement</span>
          <span className="text-muted-foreground"> runs business hours only, 1 to 5 business days</span>
        </p>
      </div>
    </figure>
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
 * The paragraph beside this makes a comparison the reader has to hold in
 * their head: $6.00 on the Mexico rail against a flat $25 to $40 on the
 * ordinary wire. Fee only, before any exchange rate markup, which is the
 * comparison the paragraph is actually making.
 *
 * The standard wire is a range rather than a number, so it is drawn as one:
 * solid to the low end, hollow to the high end. Drawing a range as a single
 * bar would invent a precision the sources do not have.
 *
 * The benchmark line lands where it lands: 3% of $200 is $6.00, which is
 * exactly the Mexico rail's fee. The direct product spends the whole UN
 * target on its fee alone, and the ordinary one spends four to nearly seven
 * times it.
 */
export function TwoProducts({ theme }) {
  const railPct = (usMxQ3.wellsFargo.feeUsd / figures.benchmarkUsd) * 100
  const lowPct = (wfStandardWire.flatFeeUsdLow / figures.benchmarkUsd) * 100
  const highPct = (wfStandardWire.flatFeeUsdHigh / figures.benchmarkUsd) * 100
  const scale = highPct

  return (
    <figure className="my-10 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <figcaption className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        Wells Fargo, two products, fee only on a ${figures.benchmarkUsd} send
      </figcaption>

      <div className="mt-5 space-y-5">
        <div>
          <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="text-sm font-bold">Direct rail to Mexico</span>
            <span className="text-sm tabular-nums text-muted-foreground">
              {railPct}% &middot; ${usMxQ3.wellsFargo.feeUsd.toFixed(2)}
            </span>
          </div>
          <div className="relative h-3 rounded-full bg-muted">
            <div
              className={cn('h-3 rounded-l-full rounded-r-[4px]', theme.bar)}
              style={{ width: `${(railPct / scale) * 100}%` }}
            />
            <div
              className="absolute inset-y-[-4px] w-px border-l border-dashed border-foreground/40"
              style={{ left: `${(figures.targetPct / scale) * 100}%` }}
              aria-hidden
            />
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
            <span className="text-sm font-bold">Standard international wire</span>
            <span className="text-sm tabular-nums text-muted-foreground">
              {lowPct}% to {highPct}% &middot; ${wfStandardWire.flatFeeUsdLow} to $
              {wfStandardWire.flatFeeUsdHigh}
            </span>
          </div>
          <div className="relative h-3 rounded-full bg-muted">
            {/* Hollow to the top of the range, solid to the bottom of it. */}
            <div
              className={cn('absolute inset-y-0 left-0 rounded-full border', theme.border)}
              style={{ width: `${(highPct / scale) * 100}%` }}
              aria-hidden
            />
            <div
              className={cn('relative h-3 rounded-l-full rounded-r-[4px]', theme.bar)}
              style={{ width: `${(lowPct / scale) * 100}%` }}
            />
            <div
              className="absolute inset-y-[-4px] w-px border-l border-dashed border-foreground/40"
              style={{ left: `${(figures.targetPct / scale) * 100}%` }}
              aria-hidden
            />
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        Dashed line: the UN target of {figures.targetPct}% for the whole transfer, which is $
        {((figures.targetPct / 100) * figures.benchmarkUsd).toFixed(2)} on $
        {figures.benchmarkUsd}. The hollow bar is the top of the quoted fee range. Scale runs
        to {scale}%.
      </p>
    </figure>
  )
}
