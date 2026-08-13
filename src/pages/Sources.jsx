import { Link } from 'react-router-dom'
import Section, { PageHeader } from '@/components/Section'
import { citations, sources } from '@/data/figures'
import { cn } from '@/lib/utils'

export default function Sources() {
  const cited = citations.filter((c) => c.source)
  const ours = citations.filter((c) => !c.source)

  return (
    <>
      <PageHeader
        eyebrow="Reference"
        title="Where our numbers come from"
        intro="Every statistic on this site, what it means, which publication it came from, and the exact places we use it."
      />

      <Section>
        <p className="mb-10 max-w-3xl leading-relaxed text-muted-foreground">
          Our Impact page says we try not to make a claim we cannot point at evidence for.
          This page is that pointing. If you find a figure on the site that is not listed
          here, that is a mistake worth{' '}
          <Link to="/contact" className="font-bold text-primary hover:underline">
            telling us about
          </Link>
          .
        </p>

        <ul className="space-y-6">
          {cited.map((c) => (
            <li
              key={c.value + c.source.id}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex flex-wrap items-baseline gap-3">
                <span
                  className={cn(
                    'rounded-full border px-3 py-1 text-lg font-extrabold tabular-nums',
                    'border-primary/30 bg-primary/10 text-primary',
                  )}
                >
                  {c.value}
                </span>
              </div>

              <p className="mt-4 max-w-3xl leading-relaxed">{c.claim}</p>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Source
                  </p>
                  <a
                    href={c.source.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-2 block font-bold text-primary underline-offset-4 hover:underline"
                  >
                    {c.source.title}
                  </a>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {c.source.publisher}, {c.source.date}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Used on this site
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {c.usedOn.map((u) => (
                      <li key={u.page + u.where} className="text-sm leading-relaxed">
                        <span className="font-bold">{u.page}</span>
                        <span className="text-muted-foreground">: {u.where}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* Kept visually separate: this one is ours, not somebody else's. */}
      <Section tone="card" title="Numbers we worked out ourselves">
        <p className="mb-6 max-w-3xl leading-relaxed text-muted-foreground">
          These are not published figures. They are arithmetic on the cited numbers above,
          shown here with the method so anyone can check it or disagree with it.
        </p>

        <ul className="space-y-6">
          {ours.map((c) => (
            <li key={c.value} className="rounded-2xl border border-border bg-background p-6">
              <span
                className={cn(
                  'inline-block rounded-full border px-3 py-1 text-lg font-extrabold tabular-nums',
                  'border-border bg-muted text-foreground',
                )}
              >
                {c.value}
              </span>
              <p className="mt-4 max-w-3xl leading-relaxed">{c.claim}</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Used on this site
              </p>
              <ul className="mt-2 space-y-1.5">
                {c.usedOn.map((u) => (
                  <li key={u.page + u.where} className="text-sm leading-relaxed">
                    <span className="font-bold">{u.page}</span>
                    <span className="text-muted-foreground">: {u.where}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Full reference list">
        <ul className="space-y-3">
          {Object.values(sources).map((s) => (
            <li key={s.id} className="border-b border-border pb-3">
              <a
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                className="font-bold text-primary underline-offset-4 hover:underline"
              >
                {s.title}
              </a>
              <p className="mt-1 text-sm text-muted-foreground">
                {s.publisher}, {s.date}
              </p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  )
}
