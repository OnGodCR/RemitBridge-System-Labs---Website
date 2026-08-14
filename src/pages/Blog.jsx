import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import Section from '@/components/Section'
import PostCard from '@/components/PostCard'
import { seriesCategories } from '@/data/blog'
import { usePosts } from '@/lib/usePosts'
import { themeFor } from '@/lib/palette'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export default function Blog() {
  const [query, setQuery] = useState('')
  const [series, setSeries] = useState('all')
  const { posts } = usePosts()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((p) => {
      const inSeries = series === 'all' || p.series === series
      if (!inSeries) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [posts, query, series])

  const written = posts.filter((p) => p.body || p.markdown).length

  return (
    <>
      {/* No standing hero. The posts are the content, so the page opens on them. */}
      <Section className="pt-12">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl">Blog</h1>
          <p className="text-sm text-muted-foreground">
            {written} of {posts.length} written in full so far
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search titles, summaries and tags"
              aria-label="Search blog posts"
              className="pl-9"
            />
          </div>
        </div>

        {/*
          Each series carries its own colour, so the filter row doubles as a key
          for the cards below it.
        */}
        <div className="mb-8 flex flex-wrap gap-x-6 gap-y-2">
          {seriesCategories.map((s) => {
            const theme = themeFor(s.id)
            const active = series === s.id
            return (
              <button
                key={s.id}
                onClick={() => setSeries(s.id)}
                aria-pressed={active}
                /* Text toggles rather than chips. A control still has to look
                    pressable, which a bottom rule does as well as a pill. */
                className={cn(
                  'border-b-2 pb-1 text-sm font-medium transition-colors',
                  active
                    ? cn('border-current', theme.ink)
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {s.label}
              </button>
            )
          })}
        </div>

        <p className="mb-6 text-sm text-muted-foreground" role="status">
          {filtered.length} of {posts.length} posts
        </p>

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-border py-12 text-center text-sm text-muted-foreground">
            Nothing matched that search.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </Section>
    </>
  )
}
