import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link2,
  ImagePlus,
  Minus,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { seriesCategories } from '@/data/posts'
import { renderMarkdown, readTimeFor, stripMarkdown } from '@/lib/markdown'
import { isStaff } from '@/lib/auth'
import { cn } from '@/lib/utils'

const SERIES = seriesCategories.filter((s) => s.id !== 'all')

const STATUS_LABEL = {
  draft: 'Draft',
  review: 'With an editor',
  published: 'Published',
}

const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

const field =
  'w-full rounded-xl border border-border bg-card p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif,image/avif'

/*
 * Must match the post-images bucket in schema.sql. The bucket is the real
 * limit; this copy exists so a writer is told before the upload rather than
 * after it, and in words rather than as "EntityTooLarge".
 */
const MAX_BYTES = 5 * 1024 * 1024
const LIMITS = 'PNG, JPEG, WebP, GIF or AVIF, up to 5 MB'

const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`

/** Uploads to the writer's own folder, which is what the storage policy checks. */
async function uploadImage(file, userId) {
  // Checked here first because the server rejects on size before it looks at
  // anything else, so the alternative is waiting out a doomed upload to be told
  // "The object exceeded the maximum allowed size".
  if (file.size > MAX_BYTES) {
    return {
      error: `That image is ${mb(file.size)}. The limit is 5 MB, so it needs resizing or exporting at a lower quality first.`,
    }
  }

  const path = `${userId}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, '-')}`
  const { error } = await supabase.storage.from('post-images').upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
  })
  if (error) return { error: error.message }
  const { data } = supabase.storage.from('post-images').getPublicUrl(path)
  return { url: data.publicUrl }
}

/* -------------------------------------------------------------------- list */

export function Editor({ user, profile }) {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)

  const load = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(
        'id, title, slug, status, updated_at, author_id, summary, series, body, cover_image',
      )
      .order('updated_at', { ascending: false })
    if (error) setError(error.message)
    setRows(data ?? [])
  }

  useEffect(() => {
    load()
  }, [])

  if (editing) {
    return (
      <PostForm
        post={editing}
        user={user}
        profile={profile}
        onDone={() => {
          setEditing(null)
          load()
        }}
      />
    )
  }

  if (rows === null) return <p className="text-sm text-muted-foreground">Loading posts…</p>

  if (error) {
    return (
      <div className="rounded-xl border border-border bg-muted p-4">
        <p className="text-sm font-bold">Could not load posts</p>
        <p className="mt-2 font-mono text-xs text-muted-foreground">{error}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          If the table is missing, re-run <code className="font-mono">supabase/schema.sql</code>.
        </p>
      </div>
    )
  }

  const mine = rows.filter((r) => r.author_id === user.id)
  const others = rows.filter((r) => r.author_id !== user.id)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {mine.length === 0
            ? 'Nothing written yet.'
            : `${mine.length} of yours${others.length ? `, ${others.length} from other people` : ''}.`}
        </p>
        <button
          onClick={() =>
            setEditing({
              isNew: true,
              title: '',
              summary: '',
              body: '',
              series: SERIES[0].id,
              status: 'draft',
              cover_image: null,
            })
          }
          className={buttonVariants({ size: 'lg' })}
        >
          Start a post
        </button>
      </div>

      <PostList heading="Yours" rows={mine} onEdit={setEditing} />
      {isStaff(profile) && others.length > 0 && (
        <PostList heading="Everyone else's" rows={others} onEdit={setEditing} />
      )}
    </div>
  )
}

function PostList({ heading, rows, onEdit }) {
  if (rows.length === 0) return null
  return (
    <div className="mt-8">
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {heading}
      </p>
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li
            key={row.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-4"
          >
            {row.cover_image ? (
              <img
                src={row.cover_image}
                alt=""
                className="size-12 shrink-0 rounded-lg border border-border object-cover"
              />
            ) : (
              <span className="grid size-12 shrink-0 place-items-center rounded-lg border border-dashed border-border text-muted-foreground">
                <ImagePlus className="size-4" aria-hidden />
              </span>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{row.title || 'Untitled'}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {STATUS_LABEL[row.status]}, changed{' '}
                {new Date(row.updated_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex shrink-0 gap-2">
              {row.status === 'published' && (
                <Link
                  to={`/blog/${row.slug}`}
                  className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                >
                  View
                </Link>
              )}
              <button
                onClick={() => onEdit(row)}
                className={buttonVariants({ variant: 'outline', size: 'sm' })}
              >
                Edit
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ----------------------------------------------------------------- toolbar */

function ToolbarButton({ label, onClick, children, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-card hover:text-foreground disabled:opacity-40"
    >
      {children}
    </button>
  )
}

/* -------------------------------------------------------------------- form */

function PostForm({ post, user, profile, onDone }) {
  const [form, setForm] = useState({
    title: post.title ?? '',
    summary: post.summary ?? '',
    series: post.series ?? SERIES[0].id,
    body: post.body ?? '',
    cover: post.cover_image ?? null,
  })
  const [status, setStatus] = useState(post.status ?? 'draft')
  const [id, setId] = useState(post.id ?? null)
  const [preview, setPreview] = useState(false)
  const [busy, setBusy] = useState('')
  const [note, setNote] = useState('')
  const bodyRef = useRef(null)
  const inlineInputRef = useRef(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  /**
   * Every toolbar action goes through here.
   *
   * Works on the current selection and puts the caret back where a writer
   * would expect it: inside new emphasis, or after text they just wrapped.
   * Losing your place on every button press is what makes a markdown box feel
   * like a form rather than a document.
   */
  const apply = (fn) => {
    const el = bodyRef.current
    if (!el) return
    const { selectionStart: start, selectionEnd: end, value } = el
    const selected = value.slice(start, end)
    const { text, caret } = fn(selected, { value, start, end })

    setForm((f) => ({ ...f, body: value.slice(0, start) + text + value.slice(end) }))

    requestAnimationFrame(() => {
      el.focus()
      const at = start + (caret ?? text.length)
      el.setSelectionRange(at, at)
    })
  }

  /** Wraps the selection, or drops in the marker pair ready to type between. */
  const surround = (marker) => () =>
    apply((sel) => ({
      text: `${marker}${sel}${marker}`,
      caret: sel ? undefined : marker.length,
    }))

  /** Puts a prefix on every selected line. Lists and quotes are line-based. */
  const prefixLines = (prefix) => () =>
    apply((sel, { value, start }) => {
      // Extend backwards to the start of the line so a caret mid-line still
      // prefixes the whole line rather than splitting it.
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      const head = value.slice(lineStart, start)
      const lines = `${head}${sel}`.split('\n')
      const out = lines
        .map((line, i) => `${typeof prefix === 'function' ? prefix(i) : prefix}${line}`)
        .join('\n')
      return { text: out.slice(head.length) }
    })

  const insertBlock = (text) => () =>
    apply(() => ({ text: `\n\n${text}\n\n` }))

  const addLink = () =>
    apply((sel) => ({
      text: `[${sel || 'link text'}](https://)`,
      caret: sel ? sel.length + 3 : 1,
    }))

  const uploadInline = async (file) => {
    if (!file) return
    setBusy('inline')
    setNote('')
    const { url, error } = await uploadImage(file, user.id)
    setBusy('')
    if (error) return setNote(error)
    apply(() => ({ text: `\n\n![Describe this image](${url})\n\n` }))
    setNote('Image added where your cursor was. Replace the text in the square brackets with a description of it.')
  }

  const uploadCover = async (file) => {
    if (!file) return
    setBusy('cover')
    setNote('')
    const { url, error } = await uploadImage(file, user.id)
    setBusy('')
    if (error) return setNote(error)
    setForm((f) => ({ ...f, cover: url }))
  }

  const save = async (nextStatus) => {
    if (!form.title.trim()) return setNote('A post needs a title before it can be saved.')
    setBusy(nextStatus)
    setNote('')

    const payload = {
      title: form.title.trim(),
      summary: form.summary.trim() || stripMarkdown(form.body).slice(0, 180) || null,
      series: form.series,
      body: form.body,
      cover_image: form.cover,
      read_time: readTimeFor(form.body),
      status: nextStatus,
    }

    let result
    if (id) {
      result = await supabase.from('posts').update(payload).eq('id', id).select('id').single()
    } else {
      // Two posts with the same title would collide on the unique slug, so the
      // first save carries a short suffix rather than failing at the database.
      const slug = `${slugify(form.title)}-${Math.random().toString(36).slice(2, 6)}`
      result = await supabase
        .from('posts')
        .insert({ ...payload, slug, author_id: user.id })
        .select('id')
        .single()
    }

    setBusy('')
    if (result.error) return setNote(result.error.message)
    setId(result.data.id)
    setStatus(nextStatus)
    if (nextStatus === 'published' || nextStatus === 'review') onDone()
    else setNote('Saved.')
  }

  const remove = async () => {
    if (!id) return onDone()
    setBusy('delete')
    const { error } = await supabase.from('posts').delete().eq('id', id)
    setBusy('')
    if (error) return setNote(error.message)
    onDone()
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button onClick={onDone} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          ← All posts
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {STATUS_LABEL[status]}
          </span>
          <button
            onClick={() => setPreview((p) => !p)}
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
          >
            {preview ? 'Back to editing' : 'Preview'}
          </button>
        </div>
      </div>

      {preview ? (
        <article className="mx-auto mt-8 max-w-2xl">
          {form.cover && (
            <img
              src={form.cover}
              alt=""
              className="mb-8 aspect-video w-full rounded-2xl border border-border object-cover"
            />
          )}
          <h1 className="text-3xl sm:text-4xl">{form.title || 'Untitled'}</h1>
          {form.summary && (
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{form.summary}</p>
          )}
          <div className="mt-8">{renderMarkdown(form.body)}</div>
          {!form.body.trim() && (
            <p className="mt-8 text-sm text-muted-foreground">Nothing written yet.</p>
          )}
        </article>
      ) : (
        <div className="mt-6 space-y-6">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Title</span>
            <Input value={form.title} onChange={set('title')} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Series</span>
              <select value={form.series} onChange={set('series')} className={field}>
                {SERIES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">
                Summary <span className="font-normal text-muted-foreground">(optional)</span>
              </span>
              <Input
                value={form.summary}
                onChange={set('summary')}
                placeholder="Taken from the first lines if you leave it empty"
              />
            </label>
          </div>

          {/*
            Cover image, kept well away from the body. There is exactly one, it
            is not part of the text, and it appears in places the writer is not
            looking at: the blog index tile and the top of the article.
          */}
          <div className="rounded-xl border border-border p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-bold">Cover image</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  One per post. Used as the tile on the blog index and the banner at the
                  top of the article. It is not part of the text, so it does not appear
                  in the body. For images inside the post, use{' '}
                  <span className="font-medium text-foreground">Add image</span> on the
                  toolbar below. {LIMITS}.
                </p>
              </div>
              {form.cover && (
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, cover: null }))}
                  className="shrink-0 text-sm font-bold text-destructive hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            {form.cover ? (
              <img
                src={form.cover}
                alt="Cover"
                className="mt-4 aspect-video w-full max-w-sm rounded-xl border border-border object-cover"
              />
            ) : (
              <label className="mt-4 block cursor-pointer">
                <input
                  type="file"
                  accept={ACCEPT}
                  onChange={(e) => uploadCover(e.target.files?.[0])}
                  className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border file:border-border file:bg-card file:px-3 file:py-1.5 file:text-sm file:font-medium"
                />
              </label>
            )}
            {busy === 'cover' && (
              <p className="mt-2 text-sm text-muted-foreground">Uploading cover…</p>
            )}
          </div>

          {/* Body, with the toolbar attached to it so it reads as one control. */}
          <div>
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-medium">Body</span>
              <span className="text-xs text-muted-foreground">{readTimeFor(form.body)}</span>
            </div>

            <div className="overflow-hidden rounded-xl border border-border focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
              <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted px-2 py-1.5">
                <ToolbarButton label="Bold" onClick={surround('**')}>
                  <Bold className="size-4" />
                </ToolbarButton>
                <ToolbarButton label="Italic" onClick={surround('*')}>
                  <Italic className="size-4" />
                </ToolbarButton>
                <ToolbarButton label="Heading" onClick={prefixLines('## ')}>
                  <Heading2 className="size-4" />
                </ToolbarButton>

                <span className="mx-1 h-5 w-px bg-border" aria-hidden />

                <ToolbarButton label="Bulleted list" onClick={prefixLines('- ')}>
                  <List className="size-4" />
                </ToolbarButton>
                <ToolbarButton
                  label="Numbered list"
                  onClick={prefixLines((i) => `${i + 1}. `)}
                >
                  <ListOrdered className="size-4" />
                </ToolbarButton>
                <ToolbarButton label="Quote" onClick={prefixLines('> ')}>
                  <Quote className="size-4" />
                </ToolbarButton>

                <span className="mx-1 h-5 w-px bg-border" aria-hidden />

                <ToolbarButton label="Link" onClick={addLink}>
                  <Link2 className="size-4" />
                </ToolbarButton>
                <ToolbarButton label="Divider" onClick={insertBlock('---')}>
                  <Minus className="size-4" />
                </ToolbarButton>

                {/* The one that answers "how do I put a picture in the middle". */}
                <button
                  type="button"
                  onClick={() => inlineInputRef.current?.click()}
                  disabled={busy === 'inline'}
                  className="ml-1 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-card disabled:opacity-40"
                >
                  <ImagePlus className="size-4" />
                  {busy === 'inline' ? 'Uploading…' : 'Add image'}
                </button>
                <input
                  ref={inlineInputRef}
                  type="file"
                  accept={ACCEPT}
                  className="hidden"
                  onChange={(e) => {
                    uploadInline(e.target.files?.[0])
                    e.target.value = ''
                  }}
                />
              </div>

              <textarea
                ref={bodyRef}
                rows={20}
                value={form.body}
                onChange={set('body')}
                placeholder="Write here. Put the cursor where you want a picture and press Add image."
                className="w-full resize-y bg-card p-4 font-mono text-sm leading-relaxed outline-none"
              />
            </div>

            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Images added from the toolbar land at your cursor, so a post can have as
              many as it needs. {LIMITS}. Every one takes a description in the square
              brackets, which is what a screen reader reads out.
            </p>
          </div>
        </div>
      )}

      {note && (
        <p role="status" className="mt-4 text-sm text-muted-foreground">
          {note}
        </p>
      )}

      <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-6">
        <button
          onClick={() => save(status === 'published' ? 'published' : 'draft')}
          disabled={Boolean(busy)}
          className={cn(buttonVariants({ size: 'lg' }), busy && 'opacity-50')}
        >
          {busy === 'draft' || busy === 'published' ? 'Saving…' : 'Save'}
        </button>

        {status !== 'published' && !isStaff(profile) && (
          <button
            onClick={() => save('review')}
            disabled={Boolean(busy)}
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            Send to an editor
          </button>
        )}

        {/* Only editors publish, including their own work, so nothing reaches
            the public site without a second person having seen it. */}
        {isStaff(profile) && status !== 'published' && (
          <button
            onClick={() => save('published')}
            disabled={Boolean(busy)}
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            Publish
          </button>
        )}

        {isStaff(profile) && status === 'published' && (
          <button
            onClick={() => save('draft')}
            disabled={Boolean(busy)}
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
          >
            Unpublish
          </button>
        )}

        {status !== 'published' && (
          <button
            onClick={remove}
            disabled={Boolean(busy)}
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'lg' }),
              'ml-auto text-destructive',
            )}
          >
            {busy === 'delete' ? 'Deleting…' : 'Delete'}
          </button>
        )}
      </div>
    </div>
  )
}
