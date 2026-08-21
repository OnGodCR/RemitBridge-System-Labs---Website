import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Check, X } from 'lucide-react'
import { Container } from '@/components/Section'
import PostCard, { PostCover } from '@/components/PostCard'
import { relatedTo } from '@/data/blog'
import { usePost } from '@/lib/usePosts'
import { renderMarkdown } from '@/lib/markdown'
import { themeFor } from '@/lib/palette'
import { postText } from '@/lib/postText'
import { cn } from '@/lib/utils'
import NotFound from './NotFound'

/**
 * A bare domain inside a reference line, made clickable in place.
 *
 * Citations are written the way they would be written on paper, with the URL
 * as part of the sentence. Splitting on the domain keeps that text exactly as
 * the author wrote it and only wraps the address itself in an anchor.
 */
const DOMAIN = /((?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s,"]*)?)/g
/* Not the same regex with .test(): a global regex carries lastIndex between
   calls and would match every other token. */
const IS_DOMAIN = /^(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s,"]*)?$/

function linkify(text, keyPrefix) {
  return text
    .split(DOMAIN)
    .filter(Boolean)
    .map((token, i) => {
      const key = `${keyPrefix}-${i}`
      if (!IS_DOMAIN.test(token)) return <span key={key}>{token}</span>
      return (
        <a
          key={key}
          href={`https://${token}`}
          target="_blank"
          rel="noreferrer noopener"
          className="break-words text-primary underline underline-offset-2"
        >
          {token}
        </a>
      )
    })
}

/** One content block. Kept deliberately small: this is an article, not a CMS. */
function Block({ block, theme }) {
  switch (block.type) {
    case 'h':
      return block.level === 3 ? (
        <h3 className="mt-10 mb-3 text-xl">{block.text}</h3>
      ) : (
        <h2 className="mt-12 mb-4 text-2xl">{block.text}</h2>
      )

    /* A run-in label above a list. Not a heading: it names the list rather
       than opening a section, so it stays out of the document outline. */
    case 'label':
      return <p className="mt-8 mb-1 font-bold">{block.text}</p>

    case 'quote':
      return (
        <blockquote className={cn('my-8 border-l-4 pl-5', theme.border)}>
          <p className="text-lg leading-relaxed">{postText(block.text, theme)}</p>
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
          {postText(block.text, theme)}
        </p>
      )

    /* A plain dot by default. `icon` marks a list as advantages or
       disadvantages, which the two comparison sections need and a list of
       measured figures does not. */
    case 'list': {
      const Mark = block.icon === 'pro' ? Check : block.icon === 'con' ? X : null
      return (
        <ul className="my-6 space-y-2.5">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3 leading-relaxed">
              {Mark ? (
                <Mark
                  className={cn(
                    'mt-1 size-4 shrink-0',
                    block.icon === 'pro' ? theme.ink : 'text-muted-foreground',
                  )}
                  aria-hidden
                />
              ) : (
                <span
                  className={cn('mt-2.5 size-1.5 shrink-0 rounded-full', theme.bar)}
                  aria-hidden
                />
              )}
              <span>{postText(item, theme, item.slice(0, 12))}</span>
            </li>
          ))}
        </ul>
      )
    }

    case 'image':
      return (
        <figure className="my-10">
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            className="aspect-[16/9] w-full rounded-2xl border border-border object-cover [filter:saturate(0.8)]"
          />
          {block.caption && (
            <figcaption className="mt-3 text-sm text-muted-foreground">
              {block.caption}
            </figcaption>
          )}
        </figure>
      )

    /* Scrolls rather than wraps below the prose column. A comparison table
       that reflows into two columns stops being a comparison. */
    case 'table':
      return (
        <div className="-mx-6 my-8 overflow-x-auto px-6 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[26rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th scope="col" className="py-2 pr-4 font-bold">
                  <span className={cn(block.rowHeaderHidden && 'sr-only')}>
                    {block.rowHeader}
                  </span>
                </th>
                {block.columns.map((col) => (
                  <th key={col} scope="col" className="py-2 pr-4 font-bold last:pr-0">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map(([label, ...cells]) => (
                <tr key={label} className="border-b border-border last:border-0">
                  <th scope="row" className="py-2.5 pr-4 text-left font-bold">
                    {label}
                  </th>
                  {cells.map((cell, i) => (
                    <td key={i} className="py-2.5 pr-4 tabular-nums last:pr-0">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    /* A diagram component rather than a picture file. It gets the series
       theme so a figure never hardcodes a colour the palette owns. */
    case 'figure': {
      const Figure = block.render
      return <Figure theme={theme} />
    }

    case 'sources':
      return (
        <ol className="my-6 space-y-3 text-sm">
          {block.items.map((item, i) => (
            <li key={item} className="flex gap-3 leading-relaxed">
              <span className="shrink-0 tabular-nums text-muted-foreground">{i + 1}.</span>
              <span className="min-w-0 break-words">{linkify(item, i)}</span>
            </li>
          ))}
        </ol>
      )

    default:
      return <p className="my-5 leading-relaxed">{postText(block.text, theme)}</p>
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

          {/* No consent date, no name. Same rule as the advisor list. */}
          {post.author?.name && post.author?.consentOn && (
            <p className="mt-6 border-t border-border/60 pt-5 text-sm">
              <span className="text-muted-foreground">Written by </span>
              <span className="font-bold">{post.author.name}</span>
              {post.author.role && (
                <span className="text-muted-foreground">, {post.author.role}</span>
              )}
            </p>
          )}
        </Container>
      </header>

      <article className="py-14">
        <Container width="prose">
          {/* Banner, only for posts written in the dashboard. Repo posts carry
              their generated cover on the index tile and no banner here. */}
          {post.coverArt ? (
            <div className="mb-10 aspect-[21/9] w-full overflow-hidden rounded-2xl border border-border [container-type:size]">
              <post.coverArt />
            </div>
          ) : (
            post.cover && (
              <img
                src={post.cover}
                alt=""
                className="mb-10 aspect-[21/9] w-full rounded-2xl border border-border object-cover [filter:saturate(0.8)]"
              />
            )
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
