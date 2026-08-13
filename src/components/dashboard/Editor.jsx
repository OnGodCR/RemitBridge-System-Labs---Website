import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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

/* -------------------------------------------------------------------- list */

export function Editor({ user, profile }) {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)

  const load = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, slug, status, updated_at, author_id, summary, series, body')
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
          onClick={() => setEditing({ isNew: true, title: '', summary: '', body: '', series: SERIES[0].id, status: 'draft' })}
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
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4"
          >
            <div className="min-w-0">
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

/* -------------------------------------------------------------------- form */

function PostForm({ post, user, profile, onDone }) {
  const [form, setForm] = useState({
    title: post.title ?? '',
    summary: post.summary ?? '',
    series: post.series ?? SERIES[0].id,
    body: post.body ?? '',
  })
  const [status, setStatus] = useState(post.status ?? 'draft')
  const [id, setId] = useState(post.id ?? null)
  const [preview, setPreview] = useState(false)
  const [busy, setBusy] = useState('')
  const [note, setNote] = useState('')
  const bodyRef = useRef(null)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  /** Writes at the cursor rather than the end, so images land where you are. */
  const insertAtCursor = (text) => {
    const el = bodyRef.current
    if (!el) return setForm((f) => ({ ...f, body: `${f.body}\n\n${text}\n` }))
    const start = el.selectionStart
    const end = el.selectionEnd
    setForm((f) => ({ ...f, body: `${f.body.slice(0, start)}${text}${f.body.slice(end)}` }))
    requestAnimationFrame(() => {
      el.focus()
      el.selectionStart = el.selectionEnd = start + text.length
    })
  }

  const upload = async (file) => {
    if (!file) return
    setBusy('upload')
    setNote('')
    // The uploader's id is the folder name; the storage policy relies on it.
    const path = `${user.id}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, '-')}`
    const { error } = await supabase.storage.from('post-images').upload(path, file, {
      cacheControl: '31536000',
      upsert: false,
    })
    setBusy('')
    if (error) return setNote(error.message)
    const { data } = supabase.storage.from('post-images').getPublicUrl(path)
    insertAtCursor(`\n\n![Describe this image](${data.publicUrl})\n\n`)
    setNote('Image added. Replace the text in the square brackets with a description of it.')
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
        <button
          onClick={onDone}
          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
        >
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
        <div className="mt-6 space-y-4">
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
                Summary{' '}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </span>
              <Input
                value={form.summary}
                onChange={set('summary')}
                placeholder="Taken from the first lines if you leave it empty"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
              <span className="text-sm font-medium">Body</span>
              <span className="text-xs text-muted-foreground">
                {readTimeFor(form.body)}. Markdown: **bold**, *italic*, # heading, - list,
                &gt; quote, [text](url)
              </span>
            </span>
            <textarea
              ref={bodyRef}
              rows={20}
              value={form.body}
              onChange={set('body')}
              className={cn(field, 'font-mono leading-relaxed')}
            />
          </label>

          <div className="rounded-xl border border-dashed border-border p-4">
            <label className="block cursor-pointer">
              <span className="text-sm font-medium">Add an image</span>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                onChange={(e) => upload(e.target.files?.[0])}
                className="mt-2 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border file:border-border file:bg-card file:px-3 file:py-1.5 file:text-sm file:font-medium"
              />
            </label>
            <p className="mt-2 text-xs text-muted-foreground">
              Up to 5MB. It is dropped in at the cursor, and every image needs a
              description in the square brackets so it works with a screen reader.
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
