import { figures, usMxQ3 } from '@/data/figures'
import { cn } from '@/lib/utils'

/**
 * Figures for the blog posts, as HTML rather than SVG.
 *
 * An SVG diagram scales its text down with the viewport, so at 320px these
 * labels would have rendered around 8px. Boxes and flex wrapping reflow
 * instead: the row becomes a column and the type stays the size it was.
 *
 * Every label is a term the post itself uses. A diagram that introduces its
 * own vocabulary is a second claim the reader has to check.
 */

/** Shared shell, so the three figures read as one set rather than three. */
function Figure({ label, note, children, className }) {
  return (
    <figure className={cn('my-10 rounded-2xl border border-border bg-card p-5 sm:p-6', className)}>
      <figcaption className="mb-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </figcaption>
      {children}
      {note && (
        <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
          {note}
        </p>
      )}
    </figure>
  )
}

/**
 * Path A, drawn as a rail with stops.
 *
 * Four boxes joined by arrows is what every payments diagram looks like and it
 * says nothing. A line with stations says the thing the post is actually
 * about: the money is on a route, and the stops in the middle are not the
 * sender's choice. Filled dot for an endpoint, hollow for an intermediary,
 * which is the same filled/hollow convention the rest of the site uses for
 * status.
 */
const STOPS = [
  { name: "Sender's bank", sub: 'compliance screening', end: true },
  { name: 'Correspondent bank', sub: 'Nostro / Vostro', fee: true },
  { name: 'Correspondent bank', sub: 'Nostro / Vostro', fee: true },
  { name: "Recipient's bank", sub: 'pays out', end: true },
]

export function CorrespondentChain({ theme }) {
  return (
    <Figure
      label="Path A: where a wire actually stops"
      note="The spread over the market rate is applied at one of these points, and the sender is not told which. Final settlement runs on RTGS, business hours only, which is what turns a transfer into one to five business days."
    >
      <ol className="relative grid gap-7 sm:grid-cols-4 sm:gap-5">
        {/* The rail. Vertical when the stops are stacked, horizontal when they
            are a row, and behind the dots either way. */}
        <span
          aria-hidden
          className="absolute left-[5px] top-2 bottom-2 w-px bg-border sm:left-1 sm:right-1 sm:top-[5px] sm:bottom-auto sm:h-px sm:w-auto"
        />
        {STOPS.map((stop, i) => (
          <li key={i} className="relative flex gap-4 sm:block">
            <span
              aria-hidden
              className={cn(
                'mt-1.5 size-2.5 shrink-0 rounded-full sm:mt-0',
                stop.end ? theme.bar : 'border-2 border-current bg-card',
                stop.end ? '' : theme.ink,
              )}
            />
            <div className="min-w-0 sm:mt-4">
              <p className="text-sm font-bold leading-snug">{stop.name}</p>
              <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{stop.sub}</p>
              {stop.fee && (
                <p className={cn('mt-1.5 text-xs font-bold', theme.ink)}>fee deducted</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Figure>
  )
}

/**
 * Path B, drawn as two tanks that never connect.
 *
 * The absence of a line between them is the whole diagram. An arrow across the
 * middle would draw exactly the thing the paragraph says does not happen.
 */
export function LiquidityPools({ theme }) {
  const pools = [
    { country: 'Sending country', name: 'USD pool', flow: 'Sender pays $200 in', fill: '72%' },
    { country: 'Receiving country', name: 'MXN pool', flow: 'Recipient is paid out', fill: '58%' },
  ]
  return (
    <Figure
      label="Path B: two pools, no crossing"
      note="No money crosses the border for your transfer. The provider squares the two pools up with itself later, in bulk and on its own terms, which is what makes a payout in minutes possible."
    >
      <div className="grid gap-6 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
        {pools.map((pool, i) => (
          <div key={pool.name} className={cn('flex flex-col', i === 1 && 'sm:text-right')}>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              {pool.country}
            </p>
            {/* A tank with a level in it, not another rounded rectangle. */}
            <div
              className={cn(
                'relative mt-3 h-24 flex-1 overflow-hidden rounded-xl border',
                theme.border,
              )}
            >
              <div
                aria-hidden
                className={cn('absolute inset-x-0 bottom-0', theme.tint)}
                style={{ height: pool.fill }}
              />
              <div className="relative flex h-full flex-col justify-center px-4 text-left">
                <p className={cn('text-sm font-bold', theme.ink)}>{pool.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">already funded</p>
              </div>
            </div>
            <p className="mt-3 text-sm">{pool.flow}</p>
          </div>
        ))}

        {/* Deliberately a barrier, not a connector. */}
        <div
          aria-hidden
          className="order-first flex items-center gap-3 sm:order-none sm:h-full sm:flex-col sm:pt-8"
        >
          <span className="h-px flex-1 border-t border-dashed border-border sm:h-auto sm:w-px sm:flex-1 sm:border-l sm:border-t-0" />
          <span className="shrink-0 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground sm:[writing-mode:vertical-rl]">
            border
          </span>
          <span className="h-px flex-1 border-t border-dashed border-border sm:h-auto sm:w-px sm:flex-1 sm:border-l sm:border-t-0" />
        </div>
      </div>
    </Figure>
  )
}

/**
 * What each provider keeps, split into the fee and the margin.
 *
 * The split is the point the paragraph beside it makes: the fee is identical
 * on both, so every cent of the difference between the two providers is
 * exchange rate margin. A single total bar cannot show that.
 *
 * Scaled in dollars rather than percent so the benchmark lands somewhere
 * useful: the UN target of 3% is $6.00 on $200, which is exactly the fee both
 * providers charge. The dashed line sits at the end of both fee segments.
 *
 * Two greens, #14705a and #5CA88E: CVD separation dE 18.5, normal-vision 18.6,
 * both well clear. The lighter one lands at 2.82:1 on white rather than 3:1,
 * which is allowed only with visible labels, so every segment is labelled in
 * text below the bar and the same numbers are in the table above. Not two
 * different hues: the house rule is one accent colour, and these are two steps
 * of it.
 *
 * "Recipient gets" is deliberately not charted. 3,708 against 3,674 MXN is a
 * 0.9% difference; on an honest zero baseline the bars are indistinguishable,
 * and the only way to make it look like something is to truncate the axis.
 */
const SCALE_USD = 12
const MARGIN_FILL = '#5CA88E'

export function CostComparison({ theme }) {
  const bars = [usMxQ3.wellsFargo, usMxQ3.delgadoTravel]
  const targetUsd = (figures.targetPct / 100) * figures.benchmarkUsd

  return (
    <Figure
      label={`What each one keeps out of $${figures.benchmarkUsd}, US to Mexico`}
      note={`Dashed line: the UN target of ${figures.targetPct}% for the whole transfer, which is $${targetUsd.toFixed(2)} on $${figures.benchmarkUsd}. Both providers reach it on the fee alone. Scale runs to $${SCALE_USD}.`}
    >
      <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2 text-xs">
        <span className="inline-flex items-center gap-2">
          <span className={cn('size-2.5 rounded-sm', theme.bar)} aria-hidden />
          <span className="font-bold">Fee</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span
            className="size-2.5 rounded-sm"
            style={{ backgroundColor: MARGIN_FILL }}
            aria-hidden
          />
          <span className="font-bold">Exchange rate margin</span>
        </span>
      </div>

      <div className="space-y-6">
        {bars.map((bar) => {
          const margin = bar.totalUsd - bar.feeUsd
          return (
            <div key={bar.label}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="text-sm font-bold">{bar.label}</span>
                <span className="text-sm font-bold tabular-nums">
                  ${bar.totalUsd.toFixed(2)}
                </span>
              </div>

              <div className="relative h-4 rounded-full bg-muted">
                {/* 2px gap between the segments, so the join is a boundary
                    rather than a colour change the eye has to find. */}
                <div className="absolute inset-y-0 left-0 flex" style={{ right: 0 }}>
                  <span
                    className={cn('h-4 rounded-l-full', theme.bar)}
                    style={{ width: `${(bar.feeUsd / SCALE_USD) * 100}%` }}
                  />
                  <span
                    className="h-4 rounded-r-[4px]"
                    style={{
                      width: `${(margin / SCALE_USD) * 100}%`,
                      backgroundColor: MARGIN_FILL,
                      marginLeft: 2,
                    }}
                  />
                </div>
                <span
                  aria-hidden
                  className="absolute inset-y-[-5px] w-px border-l border-dashed border-foreground/50"
                  style={{ left: `${(targetUsd / SCALE_USD) * 100}%` }}
                />
              </div>

              <p className="mt-2 text-xs tabular-nums text-muted-foreground">
                fee ${bar.feeUsd.toFixed(2)} &middot; margin ${margin.toFixed(2)} &middot;{' '}
                {bar.totalPct}% of the amount sent
              </p>
            </div>
          )
        })}
      </div>
    </Figure>
  )
}
