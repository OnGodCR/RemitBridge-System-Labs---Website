import { cn } from '@/lib/utils'

/**
 * Content column. `width="prose"` narrows to a comfortable reading measure for
 * running text; the default is wide enough for card grids and tables.
 */
export function Container({ width = 'wide', className, children }) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-6',
        width === 'prose' ? 'max-w-3xl' : 'max-w-6xl',
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * Two-tone display heading: the second line picks up the accent.
 * The size and tracking carry it, so it needs no other decoration.
 */
export function DisplayTitle({ lead, accent, className }) {
  return (
    <h1 className={cn('text-4xl sm:text-5xl lg:text-6xl', className)}>
      <span className="block">{lead}</span>
      {accent && <span className="block text-primary">{accent}</span>}
    </h1>
  )
}

/**
 * Top of a page. Centred, because the display type is the point.
 */
export function PageHeader({ eyebrow, title, accent, intro, children }) {
  return (
    <div className="border-b border-border bg-card py-20 text-center sm:py-28">
      <Container width="prose">
        {eyebrow && (
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-primary">
            {eyebrow}
          </p>
        )}
        {accent ? (
          <DisplayTitle lead={title} accent={accent} />
        ) : (
          <h1 className="text-4xl sm:text-5xl">{title}</h1>
        )}
        {intro && (
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {intro}
          </p>
        )}
        {children}
      </Container>
    </div>
  )
}

/**
 * A band of content. `tone` sets the surface: plain page ground, raised card
 * white, or the inverted accent band used once or twice per page for emphasis.
 */
export default function Section({
  title,
  description,
  tone = 'plain',
  align = 'left',
  width,
  className,
  children,
}) {
  const inverted = tone === 'accent' || tone === 'ink'

  return (
    <section
      className={cn(
        'py-20 sm:py-28',
        tone === 'card' && 'border-y border-border bg-card',
        tone === 'accent' && 'bg-primary text-primary-foreground',
        tone === 'ink' && 'bg-ink text-ink-foreground',
        className,
      )}
    >
      <Container width={width}>
        {(title || description) && (
          <header
            className={cn(
              'mb-12',
              align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-3xl',
            )}
          >
            {title && <h2 className="text-3xl sm:text-4xl">{title}</h2>}
            {description && (
              <p
                className={cn(
                  'mt-4 text-lg leading-relaxed',
                  inverted ? 'text-current/80' : 'text-muted-foreground',
                )}
              >
                {description}
              </p>
            )}
          </header>
        )}
        {children}
      </Container>
    </section>
  )
}

/**
 * Full-bleed accent band with centred text. Used sparingly — it is the loudest
 * thing on any page it appears on.
 */
export function FeatureBand({ title, children }) {
  return (
    <section className="bg-primary py-20 text-center text-primary-foreground sm:py-24">
      <Container width="prose">
        <h2 className="text-3xl sm:text-4xl">{title}</h2>
        <div className="mt-6 text-lg leading-relaxed text-current/90">{children}</div>
      </Container>
    </section>
  )
}

/** Banner image inside a section. */
export function SectionImage({ src, alt, className }) {
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn(
        'mb-12 h-64 w-full rounded-2xl border border-border object-cover [filter:saturate(0.8)]',
        className,
      )}
    />
  )
}

/** Sub-heading inside a section. */
export function Subhead({ children, className }) {
  return <h3 className={cn('mb-6 text-2xl', className)}>{children}</h3>
}

/** Label/value row for the calculator and parameter panels. */
export function DataRow({ label, value, emphasis = false }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={cn(
          'text-sm tabular-nums',
          emphasis ? 'font-bold text-primary' : 'font-medium text-foreground',
        )}
      >
        {value}
      </span>
    </div>
  )
}
