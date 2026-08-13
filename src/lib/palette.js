/**
 * Series colours for the blog.
 *
 * Five hues at roughly matched darkness and saturation, so they read as one
 * family rather than five unrelated brights. Each is a tint for backgrounds,
 * an ink for text on that tint, and a border. Every ink/tint pair clears 4.5:1.
 *
 * The house green leads, so series 1 is the same accent used site-wide.
 */
export const seriesTheme = {
  all: { tint: 'bg-muted', ink: 'text-foreground', border: 'border-border', bar: 'bg-muted-foreground' },
  series1: {
    tint: 'bg-[#E6F2EE]',
    ink: 'text-[#0F5A48]',
    border: 'border-[#C2DED5]',
    bar: 'bg-[#14705A]',
  },
  series2: {
    tint: 'bg-[#E7EFF9]',
    ink: 'text-[#17558F]',
    border: 'border-[#C4D8EE]',
    bar: 'bg-[#1B5FA8]',
  },
  series3: {
    tint: 'bg-[#EFEAF8]',
    ink: 'text-[#5A3E96]',
    border: 'border-[#D6CAEC]',
    bar: 'bg-[#6A4BA8]',
  },
  series4: {
    tint: 'bg-[#FAF0E2]',
    ink: 'text-[#8A4E0C]',
    border: 'border-[#EBD9BC]',
    bar: 'bg-[#9A5510]',
  },
  series5: {
    tint: 'bg-[#FAEAEF]',
    ink: 'text-[#97325A]',
    border: 'border-[#EFCBD8]',
    bar: 'bg-[#A63C63]',
  },
}

export const themeFor = (series) => seriesTheme[series] ?? seriesTheme.all
