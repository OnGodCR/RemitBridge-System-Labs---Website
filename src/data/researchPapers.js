/**
 * Long-form research papers by lab members.
 *
 * Distinct from the blog: posts are short explainers, these are full papers
 * with a methods section and a reference list.
 *
 * Nothing here is marked `published` until it actually is, and no entry gets a
 * `pdf` until that file exists. An empty reading list is honest; a list of
 * papers nobody can open is not.
 *
 * status: 'drafting' | 'internal review' | 'advisory review' | 'published'
 */
export const statuses = {
  drafting: {
    label: 'Drafting',
    note: 'Being written. No draft circulated yet.',
  },
  'internal review': {
    label: 'Internal review',
    note: 'Complete draft, being checked by the team.',
  },
  'advisory review': {
    label: 'Advisory review',
    note: 'With the adult advisory group for technical and factual review.',
  },
  published: {
    label: 'Published',
    note: 'Reviewed and released, with the data and code behind it.',
  },
}

export const papers = [
  {
    id: 'rb-01',
    title:
      'Comparing sharding, sidechains and payment channels under realistic remittance load',
    authors: ['Systems team'],
    status: 'drafting',
    year: 2026,
    abstract:
      'The methods paper for RemitBench. Sets out the six synthetic workloads, why each one was chosen, how the traffic is generated, and what would count as one setup outperforming another. Written so the runs can be reproduced rather than taken on trust.',
    topics: ['Benchmarking', 'Scaling architectures', 'Reproducibility'],
  },
  {
    id: 'rb-02',
    title: 'A complete-cost model for cross-border transfers',
    authors: ['Economics team'],
    status: 'drafting',
    year: 2026,
    abstract:
      'Formalises the model behind the TrueCost calculator: fixed fee, percentage fee, exchange-rate margin and payout charges, and how each is disclosed or hidden in practice. Includes a corridor-by-corridor comparison of advertised price against total cost.',
    topics: ['Pricing', 'Exchange-rate margins', 'Consumer disclosure'],
  },
  {
    id: 'rb-03',
    title:
      'What families actually ask: findings from the first Money Across Borders workshops',
    authors: ['Community education team', 'Evaluation team'],
    status: 'drafting',
    year: 2026,
    abstract:
      'The questions that came up repeatedly across the first workshops in King County, what participants could and could not work out before and after, and where our own teaching materials fell short.',
    topics: ['Community education', 'Evaluation', 'Financial literacy'],
  },
]
