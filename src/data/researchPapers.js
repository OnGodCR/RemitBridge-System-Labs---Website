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

/*
 * One paper. The cost model and the workshop findings were listed here as
 * drafting, but nobody had started either, and a list of papers that do not
 * exist is the same overclaim as a statistic without a source.
 */
export const papers = [
  {
    id: 'rb-01',
    title:
      'Comparing sharding, sidechains and payment channels under realistic remittance load',
    authors: ['Systems team'],
    status: 'drafting',
    year: 2026,
    // The question the paper actually sets out to answer, in full, rather than
    // a summary of it. A reader can hold us to this.
    question:
      'What sharding, sidechain, or off-chain transaction architectures would most effectively increase throughput and reduce settlement cost for blockchain-based remittance systems, and how would interoperability between these architectures and existing fiat rails, such as SWIFT and RTGS, be achieved?',
    abstract:
      'The methods paper for RemitBench. Sets out the six synthetic workloads, why each one was chosen, how the traffic is generated, and what would count as one setup outperforming another. Written so the runs can be reproduced rather than taken on trust.',
    topics: ['Benchmarking', 'Scaling architectures', 'Reproducibility'],
  },
]
