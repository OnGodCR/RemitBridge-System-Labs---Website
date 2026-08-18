/**
 * Single source of truth for the site's pages.
 *
 * `navGroups` drives the header dropdowns, the footer columns and the home
 * page index, so a page added here appears everywhere at once.
 */
export const navGroups = [
  {
    label: 'Tools',
    blurb: 'Things you can actually run, today.',
    items: [
      {
        path: '/truecost',
        label: 'TrueCost',
        blurb: 'Work out what a transfer really costs once the exchange rate is counted.',
      },
      {
        path: '/fair-rate',
        label: 'Fair rate',
        blurb: 'See the mid-market rate now, and what each point of markup takes.',
      },
      {
        path: '/reckoner',
        label: 'Yearly cost',
        blurb: 'The same transfer, every month for a year, against the benchmarks.',
      },
      {
        path: '/rate-history',
        label: 'Rate history',
        blurb: 'The mid-market rate for your corridor, day by day, as this site records it.',
      },
      {
        path: '/scam-check',
        label: 'Scam check',
        blurb: 'Warning signs of a transfer scam, checked against your situation.',
      },
      {
        path: '/coming-soon',
        label: 'Coming soon',
        blurb: 'What we are building next, including RemitBench, and how to suggest something.',
      },
    ],
  },
  {
    label: 'Reading',
    blurb: 'Everything we have written down.',
    items: [
      {
        path: '/blog',
        label: 'Blog',
        blurb: 'Thirty posts, from why people send money home to how the rails settle.',
      },
      {
        path: '/papers',
        label: 'Research papers',
        blurb: 'Long-form work by lab members, with methods and references.',
      },
    ],
  },
  {
    label: 'Community',
    blurb: 'Getting the research to people who need it.',
    items: [
      {
        path: '/workshops',
        label: 'Workshops',
        blurb: 'Free sessions and guides for families in King County, in six languages.',
      },
      {
        path: '/glossary',
        label: 'Glossary',
        blurb: 'Every term the research relies on, in plain language. Six translations planned.',
      },
      {
        path: '/fellowships',
        label: 'Fellowships',
        blurb: 'How students join the lab, and what each team works on.',
      },
    ],
  },
  {
    label: 'About',
    blurb: 'Who runs this and who checks it.',
    items: [
      {
        path: '/leadership',
        label: 'Leadership',
        blurb: 'Who is accountable for what, which seats are open, and who reviews the work.',
      },
      {
        path: '/impact',
        label: 'What we measure',
        blurb: 'What has actually been measured so far, and every correction we have published.',
      },
      {
        path: '/contact',
        label: 'Contact',
        blurb: 'Questions, corrections, workshop requests, or joining the lab. Read by students.',
      },
    ],
  },
]

/** Flat list, for anything that just needs every page. */
export const routes = navGroups.flatMap((group) =>
  group.items.map((item) => ({ ...item, group: group.label })),
)

/**
 * What a first-time visitor should look at, in order.
 *
 * Filtered, because `find` returns undefined for a path that is no longer in
 * navGroups and the home page reads `.path` off every entry. Renaming a route
 * here should drop a card, not take the home page down with it.
 */
export const featured = ['/truecost', '/coming-soon', '/blog', '/papers']
  .map((path) => routes.find((route) => route.path === path))
  .filter(Boolean)
