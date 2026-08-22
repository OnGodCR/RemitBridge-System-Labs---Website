import { posts as raw, seriesCategories } from './posts'
import { bodies } from './postBodies'
import cover1 from '@/assets/local-shop.jpg'
import cover2 from '@/assets/remittance-counter.jpg'
import cover17 from '@/assets/measurement-scale.jpg'
import cover19 from '@/assets/trading-floor.jpg'
import { coverArt } from '@/components/blog/Covers'
// Shared with the build-time sitemap, which cannot import this file.
// Slugs stay stable as long as titles do, which is the tradeoff for not
// hand-maintaining a second identifier on every post.
import { slugify } from '@/lib/slug'

/**
 * Cover photographs, by post id. Only for posts that have earned one.
 *
 * PostCover still generates art for the rest, and that stays the default: a
 * generic stock photo on a research post is worse than an honest number.
 */
const covers = { 1: cover1, 2: cover2, 17: cover17, 19: cover19 }

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
