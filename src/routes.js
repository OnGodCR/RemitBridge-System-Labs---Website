/**
 * Single source of truth for the site's pages.
 *
 * `navGroups` drives the header dropdowns, the footer columns and the home
 * page index, so a page added here appears everywhere at once.
 */
export const navGroups = [
  {
    label: 'Tools',
    blurb: 'The two things you can actually run.',
    items: [
      {
        path: '/truecost',
        label: 'TrueCost',
        blurb: 'Work out what a transfer really costs once the exchange rate is counted.',
      },
      {
        path: '/remitbench',
        label: 'RemitBench',
        blurb: 'Our testbed for comparing payment rails against a normal bank transfer.',
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
        blurb: 'The student roles, and the adult board that reviews the work.',
      },
      {
        path: '/impact',
        label: 'What we measure',
        blurb: 'The evidence we keep for each thing we claim, and the annual brief.',
      },
      {
        path: '/contact',
        label: 'Contact',
        blurb: 'Questions, corrections, workshop requests, or joining the lab.',
      },
    ],
  },
]

/** Flat list, for anything that just needs every page. */
export const routes = navGroups.flatMap((group) =>
  group.items.map((item) => ({ ...item, group: group.label })),
)

/** What a first-time visitor should look at, in order. */
export const featured = ['/truecost', '/remitbench', '/blog', '/papers'].map((path) =>
  routes.find((route) => route.path === path),
)
