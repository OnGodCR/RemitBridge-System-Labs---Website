/**
 * A small markdown renderer for posts written in the browser.
 *
 * It builds React elements rather than an HTML string, so there is no
 * `dangerouslySetInnerHTML` anywhere and a post cannot inject script or markup
 * into the page. That matters more than feature coverage here: writing access
 * is granted to students, and one compromised account should not be able to
 * run code for every reader.
 *
 * Supported: # headings, paragraphs, - and 1. lists, > quotes, ![](images),
 * --- rules, and inline **bold**, *italic*, `code` and [links](url).
 */

/** Only these can appear in an href or an image src. */
const SAFE_URL = /^(https?:\/\/|\/|#|mailto:)/i
const safeUrl = (url) => (SAFE_URL.test(url.trim()) ? url.trim() : null)

const INLINE = /(\*\*.+?\*\*|\*.+?\*|`[^`]+`|\[[^\]]*\]\([^)]+\))/g

/** Inline spans inside one line of text. */
function inline(text, keyPrefix = '') {
  return text.split(INLINE).filter(Boolean).map((token, i) => {
    const key = `${keyPrefix}-${i}`

    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={key}>{token.slice(2, -2)}</strong>
    }
    if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      return <em key={key}>{token.slice(1, -1)}</em>
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code key={key} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">
          {token.slice(1, -1)}
        </code>
      )
    }

    const link = token.match(/^\[([^\]]*)\]\(([^)]+)\)$/)
    if (link) {
      const href = safeUrl(link[2])
      // An unsafe scheme renders as plain text rather than disappearing, so a
      // writer can see what they typed and fix it.
      if (!href) return <span key={key}>{link[1]}</span>
      const external = /^https?:/i.test(href)
      return (
        <a
          key={key}
          href={href}
          className="font-medium text-primary underline underline-offset-2"
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {link[1]}
        </a>
      )
    }

    return <span key={key}>{token}</span>
  })
}

const HEADING_CLASS = {
  2: 'mt-12 text-2xl sm:text-3xl',
  3: 'mt-10 text-xl sm:text-2xl',
  4: 'mt-8 text-lg',
}

export function renderMarkdown(source) {
  if (!source?.trim()) return []

  // Blank lines separate blocks. Lists keep their own line breaks inside.
  const blocks = source.replace(/\r\n/g, '\n').split(/\n{2,}/)
  const out = []

  blocks.forEach((raw, b) => {
    const block = raw.trim()
    if (!block) return

    if (/^---+$/.test(block)) {
      out.push(<hr key={b} className="my-12 border-border" />)
      return
    }

    // A lone image gets a figure, so a caption can sit under it.
    const image = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/)
    if (image) {
      const src = safeUrl(image[2])
      if (!src) return
      out.push(
        <figure key={b} className="my-10">
          <img
            src={src}
            alt={image[1]}
            loading="lazy"
            className="w-full rounded-2xl border border-border"
          />
          {image[1] && (
            <figcaption className="mt-3 text-sm text-muted-foreground">{image[1]}</figcaption>
          )}
        </figure>,
      )
      return
    }

    const heading = block.match(/^(#{1,4})\s+(.*)$/)
    if (heading) {
      const level = Math.max(2, heading[1].length)
      const Tag = `h${level}`
      out.push(
        <Tag key={b} className={HEADING_CLASS[level] ?? HEADING_CLASS[4]}>
          {inline(heading[2], b)}
        </Tag>,
      )
      return
    }

    if (block.split('\n').every((line) => /^>\s?/.test(line))) {
      out.push(
        <blockquote
          key={b}
          className="my-8 border-l-4 border-primary pl-5 text-lg italic leading-relaxed"
        >
          {inline(block.replace(/^>\s?/gm, '').replace(/\n/g, ' '), b)}
        </blockquote>,
      )
      return
    }

    const lines = block.split('\n')
    const bulleted = lines.every((line) => /^[-*]\s+/.test(line))
    const numbered = lines.every((line) => /^\d+[.)]\s+/.test(line))

    if (bulleted || numbered) {
      const List = numbered ? 'ol' : 'ul'
      out.push(
        <List
          key={b}
          className={`my-6 space-y-2 pl-6 leading-relaxed ${
            numbered ? 'list-decimal' : 'list-disc'
          }`}
        >
          {lines.map((line, i) => (
            <li key={i}>{inline(line.replace(/^([-*]|\d+[.)])\s+/, ''), `${b}-${i}`)}</li>
          ))}
        </List>,
      )
      return
    }

    out.push(
      <p key={b} className="my-5 leading-relaxed">
        {inline(block.replace(/\n/g, ' '), b)}
      </p>,
    )
  })

  return out
}

/** Plain text, for summaries and read-time estimates. */
export const stripMarkdown = (source = '') =>
  source
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*`_-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

/** 200 words a minute, rounded up, matching the static posts' phrasing. */
export const readTimeFor = (source = '') => {
  const words = stripMarkdown(source).split(' ').filter(Boolean).length
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}
