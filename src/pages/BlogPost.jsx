import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Container } from '@/components/Section'
import PostCard, { PostCover } from '@/components/PostCard'
import { relatedTo } from '@/data/blog'
import { usePost } from '@/lib/usePosts'
import { renderMarkdown } from '@/lib/markdown'
import { themeFor } from '@/lib/palette'
import { cn } from '@/lib/utils'
import NotFound from './NotFound'

/** One content block. Kept deliberately small — this is an article, not a CMS. */
function Block({ block, theme }) {
  switch (block.type) {
    case 'h':
      return <h2 className="mt-12 mb-4 text-2xl">{block.text}</h2>

    case 'quote':
      return (
        <blockquote className={cn('my-8 border-l-4 pl-5', theme.border)}>
          <p className="text-lg leading-relaxed">{block.text}</p>
          {block.cite && (
            <footer className="mt-2 text-sm text-muted-foreground">{block.cite}</footer>
          )}
        </blockquote>
      )

    case 'callout':
      return (
        <p
          className={cn(
            'my-8 rounded-2xl border p-5 text-base leading-relaxed',
            theme.tint,
            theme.border,
          )}
        >
          {block.text}
        </p>
      )

    case 'list':
      return (
        <ul className="my-6 space-y-2">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3 leading-relaxed">
              <span className={cn('mt-2.5 size-1.5 shrink-0 rounded-full', theme.bar)} aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )

    case 'image':
      return (
        <figure className="my-10">
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            className="w-full rounded-2xl border border-border object-cover [filter:saturate(0.8)]"
          />
          {block.caption && (
            <figcaption className="mt-3 text-sm text-muted-foreground">
              {block.caption}
            </figcaption>
          )}
        </figure>
      )

    default:
      return <p className="my-5 leading-relaxed">{block.text}</p>
  }
}

export default function BlogPost() {
  const { slug } = useParams()
  const { post, loading } = usePost(slug)

  // The layout falls back to the site name for routes it does not know, so the
  // post sets its own once it exists. No cleanup: navigating away retitles via
  // the layout effect anyway.
  useEffect(() => {
    if (post?.title) document.title = `${post.title} · RemitBridge Systems Lab`
  }, [post])

  if (loading) {
    return (
      <Container width="prose" className="py-24">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </Container>
    )
  }

  if (!post) return <NotFound />

  const theme = themeFor(post.series)
  const related = relatedTo(post)

  return (
    <>
      <header className={cn('border-b border-border py-14', theme.tint)}>
        <Container width="prose">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            All posts
          </Link>

          <p className="mt-6 flex items-center gap-2 text-sm">
            <span className={cn('size-2.5 rounded-full', theme.bar)} aria-hidden />
            <span className={cn('font-bold', theme.ink)}>{post.seriesName}</span>
            <span className="text-muted-foreground">&middot; {post.readTime}</span>
          </p>

          <h1 className="mt-3 text-3xl leading-tight sm:text-4xl">{post.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-foreground/70">{post.abstract}</p>
        </Container>
      </header>

      <article className="py-14">
        <Container width="prose">
          {/* Banner, only for posts written in the dashboard. Repo posts carry
              their generated cover on the index tile and no banner here. */}
          {post.cover && (
            <img
              src={post.cover}
              alt=""
              className="mb-10 aspect-video w-full rounded-2xl border border-border object-cover"
            />
          )}
          {/* Repo posts are block arrays; posts written in the dashboard are
              markdown. Both end up as the same elements on the page. */}
          {post.markdown ? (
            renderMarkdown(post.markdown)
          ) : post.body ? (
            post.body.map((block, i) => <Block key={i} block={block} theme={theme} />)
          ) : (
            /* No invented body. Say so plainly rather than padding it out. */
            <div className="rounded-2xl border border-border bg-muted p-8">
              <h2 className="text-xl">This one is still being written</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                The summary above is the current state of it. The full post goes up once
                the work behind it is finished and reviewed, which is the same rule we
                apply to everything else on the site.
              </p>
              <Link
                to="/blog"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
              >
                <ArrowLeft className="size-4" />
                Back to all posts
              </Link>
            </div>
          )}

          <div
            className={cn(
              'mt-12 border-t border-border pt-8',
              post.tags.length === 0 && 'hidden',
            )}
          >
            <p className={cn('text-sm font-medium', theme.ink)}>
              {post.tags.join(' · ')}
            </p>
          </div>
        </Container>
      </article>

      <section className="border-t border-border bg-muted py-14">
        <Container>
          <h2 className="mb-8 text-2xl">Keep reading</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </Container>
      </section>
    </>
  )
}

export { PostCover }
