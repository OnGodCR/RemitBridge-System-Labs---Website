import { useEffect, useState } from 'react'
import { posts as staticPosts, seriesCategories } from '@/data/blog'
import { supabase, backendEnabled } from '@/lib/supabase'
import { readTimeFor, stripMarkdown } from '@/lib/markdown'

/**
 * The blog, which is two things joined at read time.
 *
 * The thirty posts in src/data/posts.js ship with the site and render with no
 * network at all. Posts written in the dashboard are fetched on top of them.
 * Doing it this way means a Supabase outage costs the site the newest posts,
 * not the whole blog, and the page has something to draw on first paint.
 */

const seriesNameFor = (id) => {
  const label = seriesCategories.find((s) => s.id === id)?.label ?? ''
  // "Series 1: Why people send money (1-6)" -> "Why people send money"
  return label.replace(/^Series \d+:\s*/, '').replace(/\s*\(\d+-\d+\)$/, '') || 'From the lab'
}

/** A database row in the shape the cards and the article page already expect. */
function adapt(row, index) {
  return {
    // Sequential, continuing past the thirty in the repo, because the cover art
    // prints this number. The uuid is kept separately for links back to the row.
    id: staticPosts.length + index + 1,
    uuid: row.id,
    slug: row.slug,
    title: row.title,
    abstract: row.summary || stripMarkdown(row.body).slice(0, 220),
    readTime: row.read_time || readTimeFor(row.body),
    series: row.series ?? 'all',
    seriesName: seriesNameFor(row.series),
    tags: [],
    publishedAt: row.published_at,
    // Only database posts have one. The repo posts use generated cover art.
    cover: row.cover_image ?? null,
    // Markdown rather than the block array the repo posts use. The article page
    // branches on which one is present.
    markdown: row.body,
    body: null,
  }
}

export function usePosts() {
  const [remote, setRemote] = useState([])
  const [loading, setLoading] = useState(backendEnabled)

  useEffect(() => {
    if (!backendEnabled) return
    let cancelled = false
    supabase
      .from('posts')
      .select('id, slug, title, summary, body, read_time, series, published_at, cover_image')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return
        setRemote((data ?? []).map(adapt))
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Newest first, so a post written today is not buried behind thirty archives.
  return { posts: [...remote, ...staticPosts], loading }
}

/** One post by slug, checking the repo first so a static post needs no fetch. */
export function usePost(slug) {
  const [state, setState] = useState(() => {
    const found = staticPosts.find((p) => p.slug === slug)
    return found ? { post: found, loading: false } : { post: null, loading: backendEnabled }
  })

  useEffect(() => {
    const found = staticPosts.find((p) => p.slug === slug)
    if (found) return setState({ post: found, loading: false })
    if (!backendEnabled) return setState({ post: null, loading: false })

    let cancelled = false
    setState({ post: null, loading: true })
    supabase
      .from('posts')
      .select('id, slug, title, summary, body, read_time, series, published_at, cover_image')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setState({ post: data ? adapt(data, 0) : null, loading: false })
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  return state
}
