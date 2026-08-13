import { Link } from 'react-router-dom'
import { themeFor } from '@/lib/palette'
import { cn } from '@/lib/utils'

/**
 * Cover art, generated rather than photographed.
 *
 * Thirty posts would need thirty stock photos, and generic stock on a research
 * post is worse than no image. The series hue plus the post number gives each
 * card a distinct, honest thumbnail.
 */
export function PostCover({ post, className }) {
  const theme = themeFor(post.series)
  return (
    <div
      className={cn(
        'relative flex aspect-video items-center justify-center overflow-hidden',
        theme.tint,
        className,
      )}
    >
      <svg
        viewBox="0 0 48 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className={cn('absolute -right-6 -top-4 size-40 opacity-15', theme.ink)}
        aria-hidden
      >
        <path d="M2 17Q24 3 46 17" />
        <path d="M14 30v-6q10-9 20 0v6" />
      </svg>
      <span className={cn('relative text-5xl font-extrabold tabular-nums', theme.ink)}>
        {String(post.id).padStart(2, '0')}
      </span>
    </div>
  )
}

/** Grid tile on the blog index. The whole card is one target. */
export default function PostCard({ post }) {
  const theme = themeFor(post.series)
  return (
    <article className="h-full">
      <Link
        to={`/blog/${post.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-muted-foreground/30"
      >
        <PostCover post={post} />
        <div className="flex flex-1 flex-col p-5">
          <span className="flex items-center gap-2 text-xs">
            <span className={cn('size-2 rounded-full', theme.bar)} aria-hidden />
            <span className={cn('font-bold', theme.ink)}>{post.seriesName}</span>
          </span>
          <h3 className="mt-2 text-lg leading-snug group-hover:text-primary">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {post.abstract}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            {post.readTime}
            {!post.body && ' · summary only'}
          </p>
        </div>
      </Link>
    </article>
  )
}
