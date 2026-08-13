import { cn } from '@/lib/utils'

/**
 * The bridge mark, drawn as an SVG rather than shipped as an image.
 *
 * Two reasons it lives in code: it stays crisp at 20px and at 200px, and it
 * inherits `currentColor`, so it recolours with the theme tokens instead of
 * needing a separate white file for the dark footer.
 *
 * Even stroke weight throughout — a tapered crown disappears at nav size.
 */
export function LogoMark({ className, ...props }) {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="RemitBridge"
      className={cn('size-6', className)}
      {...props}
    >
      {/*
        Two strokes, kept far enough apart that the opening survives at 16px.
        The deck is a shallow curve; the arch beneath it is much tighter, so
        the two never nest into a single blob.
      */}
      <path d="M2 17Q24 3 46 17" />
      <path d="M14 30v-6q10-9 20 0v6" />
    </svg>
  )
}

/** Mark plus wordmark, as used in the header and footer. */
export default function Logo({ className, markClassName }) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className={cn('size-8 text-primary', markClassName)} />
      <span className="whitespace-nowrap text-lg font-extrabold tracking-tight">
        RemitBridge
      </span>
    </span>
  )
}
