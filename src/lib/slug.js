/**
 * URL slug from a title.
 *
 * Lives on its own rather than inside data/blog.js because the build-time
 * sitemap and head prerender need it too, and they run in plain Node where
 * blog.js cannot be imported: it pulls in JPEGs and JSX components that only
 * Vite knows how to resolve.
 */
export const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
