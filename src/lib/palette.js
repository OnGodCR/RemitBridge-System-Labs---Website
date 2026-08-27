/**
 * Series colours for the blog.
 *
 * Five hues at roughly matched darkness and saturation, so they read as one
 * family rather than five unrelated brights. Every ink/tint pair clears 4.5:1.
 *
 * The house green leads, so series 1 is the same accent used site-wide.
 *
 * Five keys, and which surface each is for matters now that the post page is
 * white rather than tinted:
 *
 * - `tint` and `border` go together, and only inside a figure, where a filled
 *   cell means "this is the one that counts" against a plain white one. They
 *   are no longer a page background.
 * - `ink` and `bar` are the saturated pair, for text and for a filled dot or
 *   bar. Both are legible on white.
 * - `rule` is a saturated left edge. The pale `border` was tuned to sit on the
 *   tint and goes washy on white, which is what a quote rule and a callout
 *   edge were using before the page went white.
 */
export const seriesTheme = {
  all: {
    tint: 'bg-muted',
    ink: 'text-foreground',
    border: 'border-border',
    rule: 'border-l-muted-foreground',
    bar: 'bg-muted-foreground',
  },
  series1: {
    tint: 'bg-[#E6F2EE]',
    ink: 'text-[#0F5A48]',
    border: 'border-[#C2DED5]',
    rule: 'border-l-[#14705A]',
    bar: 'bg-[#14705A]',
  },
  series2: {
    tint: 'bg-[#E7EFF9]',
    ink: 'text-[#17558F]',
    border: 'border-[#C4D8EE]',
    rule: 'border-l-[#1B5FA8]',
    bar: 'bg-[#1B5FA8]',
  },
  series3: {
    tint: 'bg-[#EFEAF8]',
    ink: 'text-[#5A3E96]',
    border: 'border-[#D6CAEC]',
    rule: 'border-l-[#6A4BA8]',
    bar: 'bg-[#6A4BA8]',
  },
  series4: {
    tint: 'bg-[#FAF0E2]',
    ink: 'text-[#8A4E0C]',
    border: 'border-[#EBD9BC]',
    rule: 'border-l-[#9A5510]',
    bar: 'bg-[#9A5510]',
  },
  series5: {
    tint: 'bg-[#FAEAEF]',
    ink: 'text-[#97325A]',
    border: 'border-[#EFCBD8]',
    rule: 'border-l-[#A63C63]',
    bar: 'bg-[#A63C63]',
  },
}

export const themeFor = (series) => seriesTheme[series] ?? seriesTheme.all
