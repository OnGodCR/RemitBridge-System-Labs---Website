/**
 * Shrinks an oversized image in the browser, before it is uploaded.
 *
 * A phone photo is routinely 4000px wide and several megabytes. A full-width
 * image on this site is displayed at around 800 CSS pixels, so nearly all of
 * that is thrown away by the browser on every single page view. Resizing here
 * means a writer never has to go and find an image editor, and readers on a
 * phone are not made to download a file forty times larger than they can see.
 *
 * Two things it deliberately does not do:
 *
 * GIFs are passed through untouched. Canvas would keep the first frame and
 * silently discard the animation, and a silently broken image is worse than a
 * refusal to accept one.
 *
 * It never returns a file larger than the original. If re-encoding makes
 * something bigger, which happens with flat graphics already saved well, the
 * original is used.
 */

/** Long edge in device pixels. Twice the widest the site ever displays, so it
 *  still looks right on a high-density screen. */
const MAX_EDGE = 2000

/** Tried in order until one fits. Below about 0.5 the artefacts start to show
 *  on photographs, so the last resort is fewer pixels rather than worse ones. */
const QUALITY_STEPS = [0.85, 0.75, 0.62, 0.5]

const PASSTHROUGH = ['image/gif']

/** WebP everywhere modern; JPEG only if a browser somehow cannot encode it. */
function pickOutputType() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 1
  const webp = canvas.toDataURL('image/webp')
  return webp.startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg'
}

function toBlob(canvas, type, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

/** Decodes without attaching anything to the document. `from-image` applies the
 *  EXIF rotation, which is what stops phone photos arriving on their side. */
async function decode(file) {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' })
    } catch {
      // Falls through to the <img> path, which some older Safari needs.
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * @returns {Promise<{file: File, resized: boolean, from?: number, to?: number}>}
 *          or {error} when it cannot be made to fit.
 */
export async function resizeImage(file, { maxBytes, maxEdge = MAX_EDGE } = {}) {
  if (PASSTHROUGH.includes(file.type)) {
    if (file.size <= maxBytes) return { file, resized: false }
    return {
      error: `Animated GIFs cannot be resized without losing the animation. This one is ${(
        file.size /
        1024 /
        1024
      ).toFixed(1)} MB and the limit is ${Math.round(maxBytes / 1024 / 1024)} MB.`,
    }
  }

  let source
  try {
    source = await decode(file)
  } catch {
    return { error: 'That file could not be read as an image.' }
  }

  const width = source.width
  const height = source.height
  const longest = Math.max(width, height)

  // Nothing to do: already small enough in both bytes and pixels.
  if (file.size <= maxBytes && longest <= maxEdge) {
    source.close?.()
    return { file, resized: false }
  }

  const type = pickOutputType()
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  // Each pass halves the target edge again. Two passes take a 6000px photo to
  // 500px, which is far past anything acceptable, so it is not an open loop.
  let edge = Math.min(longest, maxEdge)

  for (let pass = 0; pass < 3; pass += 1) {
    const scale = edge / longest
    canvas.width = Math.max(1, Math.round(width * scale))
    canvas.height = Math.max(1, Math.round(height * scale))

    // A white base for JPEG, which has no alpha and would otherwise render
    // transparent pixels as black.
    if (type === 'image/jpeg') {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height)

    for (const quality of QUALITY_STEPS) {
      const blob = await toBlob(canvas, type, quality)
      if (!blob) continue
      if (blob.size <= maxBytes) {
        source.close?.()

        // Re-encoding can inflate an already well-compressed file. Keep
        // whichever is smaller, as long as the original itself fits.
        if (blob.size >= file.size && file.size <= maxBytes) {
          return { file, resized: false }
        }

        const name = file.name.replace(/\.[^.]+$/, '') + (type === 'image/webp' ? '.webp' : '.jpg')
        return {
          file: new File([blob], name, { type }),
          resized: true,
          from: file.size,
          to: blob.size,
          width: canvas.width,
          height: canvas.height,
        }
      }
    }

    edge = Math.round(edge / 2)
  }

  source.close?.()
  return { error: 'That image could not be reduced below the size limit.' }
}
