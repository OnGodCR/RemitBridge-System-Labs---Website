import { correctionCount } from './corrections'

/**
 * What the lab measures, and what it has actually measured so far.
 *
 * Same shape as figures.js: the data lives here so the Sources page can read
 * from it, and so a number cannot appear on a page without the record that
 * backs it travelling alongside.
 *
 * Every entry ships with `value: null` and `status: 'not-yet'` unless a value
 * came from data/measures.seed.md. That file does not exist yet, so nothing
 * here carries a number. A page of nulls is the launch state and is not a
 * failure: it says the programmes have not run, which is true, rather than
 * showing six methods and implying six results.
 *
 * @typedef {Object} Measure
 * @property {string} title
 * @property {string} measure   How it is counted.
 * @property {string} evidence  The record that would prove it.
 * @property {number|null} value
 * @property {string|null} asOf ISO date collected. Required when value is set.
 * @property {'collected'|'zero'|'not-yet'} status
 * @property {string} [unit]
 * @property {string} [note]    Required for 'not-yet': when it starts.
 */

/** @type {Measure[]} */
const RAW = [
  {
    id: 'research',
    title: 'Research quality',
    measure:
      'How many setups we tested, how many test runs finished, and whether someone else could rerun them.',
    evidence: 'Public code repository, methods paper, version history, replication log.',
    value: null,
    asOf: null,
    status: 'not-yet',
    note: 'First collection when the RemitBench methodology is settled and the first full run completes.',
  },
  {
    id: 'reach',
    title: 'Community reach',
    measure: 'Workshops held, how many people came, how many languages, and where.',
    evidence: 'Head counts and locations. No names, nothing sensitive.',
    value: null,
    asOf: null,
    status: 'not-yet',
    note: 'First collection after the pilot workshop. No workshop has run yet.',
  },
  {
    id: 'learning',
    title: 'Did people learn anything',
    measure:
      'Whether attendees could work out a full transfer cost and spot a scam afterwards when they could not before.',
    evidence: 'Anonymous surveys before and after each session.',
    value: null,
    asOf: null,
    status: 'not-yet',
    note: 'First collection after the pilot workshop, from the before-and-after surveys.',
  },
  {
    id: 'students',
    title: 'Student leadership',
    measure: 'Active fellows, finished deliverables, hours put in, and talks given.',
    evidence: 'Quarterly delivery logs from each team.',
    value: null,
    asOf: null,
    status: 'not-yet',
    note: 'First collection at the end of the first quarter with fellows on a team.',
  },
  {
    id: 'tools',
    title: 'Is anyone using the tools',
    measure: 'Calculator sessions, guide downloads, and anyone citing the papers.',
    evidence: 'Aggregate counts only. We do not track individual users.',
    value: null,
    asOf: null,
    status: 'not-yet',
    note: 'First collection one full quarter after the site goes live.',
  },
  {
    id: 'holds-up',
    title: 'Does the work hold up',
    measure: 'Adult reviewers who checked it, revisions we had to make, and corrections published.',
    evidence: 'Review letters, revision logs, and the corrections log on this page.',
    // Not null, and not a placeholder. Zero corrections is a real measurement
    // that is true today, and it renders as zero.
    value: correctionCount(),
    asOf: null,
    status: 'zero',
    unit: 'corrections published',
    note: null,
  },
]

/**
 * A value and its date travel together or neither renders.
 *
 * Enforced here rather than trusted to whoever edits the array next: a number
 * without a collection date is the exact shape of a figure nobody can check,
 * which is what this page exists to argue against. The zero case is exempt,
 * because a count that is currently zero has no collection date to give.
 */
export const measures = RAW.map((m) => {
  const hasValue = m.value !== null && m.value !== undefined
  if (hasValue && m.status !== 'zero' && !m.asOf) {
    return { ...m, value: null, status: 'not-yet', note: m.note ?? 'Awaiting a collection date.' }
  }
  return m
})

export const STATUS_LABEL = {
  collected: 'Measured',
  zero: 'Measured',
  'not-yet': 'Not measured yet',
}

/** Counted from the data so the summary line cannot drift from the table. */
export const measuredCount = () =>
  measures.filter((m) => m.status === 'collected' || m.status === 'zero').length
