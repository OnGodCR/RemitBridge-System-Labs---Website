import { posts as raw, seriesCategories } from './posts'
import { bodies } from './postBodies'
import cover2 from '@/assets/remittance-counter.jpg'
import cover19 from '@/assets/throughput-racks.jpg'
import { coverArt } from '@/components/blog/Covers'

/**
 * Cover photographs, by post id. Only for posts that have earned one.
 *
 * PostCover still generates art for the rest, and that stays the default: a
 * generic stock photo on a research post is worse than an honest number.
 */
const covers = { 2: cover2, 19: cover19 }

/**
 * URL slug from the title. Stable as long as titles are, which is the tradeoff
 * for not hand-maintaining a second identifier on every post.
 */
const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export const posts = raw.map((post) => ({
  ...post,
  slug: slugify(post.title),
  body: bodies[post.id] ?? null,
  cover: covers[post.id] ?? null,
  // Drawn cover art, for posts whose subject is a system rather than a scene.
  coverArt: coverArt[post.id] ?? null,
}))

export const getPost = (slug) => posts.find((post) => post.slug === slug)

/** Same series first, falling back to neighbours so the rail is never empty. */
export const relatedTo = (post, count = 3) => {
  const sameSeries = posts.filter((p) => p.series === post.series && p.id !== post.id)
  const others = posts.filter((p) => p.series !== post.series && p.id !== post.id)
  return [...sameSeries, ...others].slice(0, count)
}

export { seriesCategories }
