import { useState } from 'react'
import { Link } from 'react-router-dom'
import Section from '@/components/Section'
import { LANGUAGES, terms, searchTerms, reviewedLanguages } from '@/data/glossary'
import { cn } from '@/lib/utils'

/*
 * The term list, public on purpose.
 *
 * The people this page is for are families working out what a transfer costs,
 * not lab members. Locking a dictionary behind a sign-in would serve nobody it
 * was written for. What is gated is contribution: a translated column appears
 * only once a named speaker has reviewed it, and that gate lives in the data
 * file, not here.
 */

const FIELD =
  'w-full rounded-xl border border-border bg-card px-4 py-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

export default function Glossary() {
  const [query, setQuery] = useState('')
  const shown = searchTerms(query)
  const live = reviewedLanguages()

  return (
    <>
      <Section className="pt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl">Glossary</h1>
          <p className="text-sm text-muted-foreground">
            {terms.length} terms · English, with {LANGUAGES.length} languages planned
          </p>
        </div>

        <p className="mt-5 max-w-3xl text-lg leading-relaxed">
          Every term the research and the workshop material rely on, defined once in plain
          language. If a word on this site is not in here and should be,{' '}
          <Link to="/contact" className="font-medium text-primary hover:underline">
            tell us
          </Link>
          .
        </p>

        <label className="mt-8 block max-w-md">
          <span className="sr-only">Search the glossary</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms and definitions"
            className={FIELD}
          />
        </label>

        <p className="mt-4 text-sm text-muted-foreground" role="status">
          {shown.length} of {terms.length} terms
        </p>

        {shown.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-border py-12 text-center text-sm text-muted-foreground">
            Nothing matched that search.
          </p>
        ) : (
          <dl className="mt-6 max-w-3xl border-t border-border">
            {shown.map((t) => (
              <div key={t.id} className="border-b border-border py-5">
                <dt className="text-lg font-bold">{t.term}</dt>
                <dd className="mt-1.5 leading-relaxed text-muted-foreground">{t.plain}</dd>
                {live.map(
                  (lang) =>
                    t.translations?.[lang.code] && (
                      <dd key={lang.code} className="mt-2 leading-relaxed" lang={lang.code}>
                        <span className="mr-2 text-xs font-bold uppercase tracking-widest text-primary">
                          {lang.name}
                        </span>
                        {t.translations[lang.code]}
                      </dd>
                    ),
                )}
              </div>
            ))}
          </dl>
        )}
      </Section>

      <Section tone="card" title="The other six languages">
        <p className="max-w-3xl leading-relaxed">
          This glossary is planned in the same {LANGUAGES.length} languages as the
          workshops, and each one goes up only after a named speaker of that language has
          reviewed every entry. Machine translation drafts are where a reviewer starts,
          never what gets published: a wrong definition about money, in the reader&rsquo;s
          own language, is worse than no definition.
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {LANGUAGES.map((lang) => {
            const done = live.some((l) => l.code === lang.code)
            return (
              <li
                key={lang.code}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3"
              >
                <div>
                  <p className="text-base">{lang.name}</p>
                  <p className="text-xs text-muted-foreground">{lang.english}</p>
                </div>
                <span
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-widest',
                    done ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  <span aria-hidden>{done ? '●' : '○'}</span>
                  {done ? 'Reviewed' : 'No reviewer yet'}
                </span>
              </li>
            )
          })}
        </ul>

        <p className="mt-8 max-w-3xl leading-relaxed text-muted-foreground">
          Speak one of these and want to review a column? That is exactly the person the
          language team needs.{' '}
          <Link to="/contact" className="font-bold text-primary hover:underline">
            Write to us
          </Link>
          .
        </p>
      </Section>
    </>
  )
}
