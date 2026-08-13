import { posts as raw, seriesCategories } from './posts'
import { bodies } from './postBodies'

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
}))

export const getPost = (slug) => posts.find((post) => post.slug === slug)

/** Same series first, falling back to neighbours so the rail is never empty. */
export const relatedTo = (post, count = 3) => {
  const sameSeries = posts.filter((p) => p.series === post.series && p.id !== post.id)
  const others = posts.filter((p) => p.series !== post.series && p.id !== post.id)
  return [...sameSeries, ...others].slice(0, count)
}

export { seriesCategories }
