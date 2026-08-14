/**
 * Every change made to a claim after it was published.
 *
 * A public register, not an internal log. If a number on this site moved, the
 * old number and the reason are recorded here, dated, with who reported it.
 *
 * The count is a credibility figure and is treated as one on the What we
 * measure page. A lab that publishes and never corrects is not being careful;
 * it is not checking.
 *
 * @typedef {Object} Correction
 * @property {string} date        ISO date the change was made.
 * @property {string} page        Where the claim appeared.
 * @property {string} claimed     What it said before, quoted.
 * @property {string} correctedTo What it says now.
 * @property {string} reportedBy  Who found it. 'A reader' is fine; do not
 *                                publish a name without asking first.
 * @property {'external report'|'internal review'|'new data'} prompt
 */

/** @type {Correction[]} */
export const corrections = []

/** Newest first, which is the only order this is ever read in. */
export const recentCorrections = () =>
  [...corrections].sort((a, b) => b.date.localeCompare(a.date))

export const correctionCount = () => corrections.length

export const PROMPT_LABEL = {
  'external report': 'Reported by a reader',
  'internal review': 'Found in internal review',
  'new data': 'Superseded by newer data',
}
