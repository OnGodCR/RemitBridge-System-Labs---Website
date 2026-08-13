/**
 * Full post bodies, keyed by post id.
 *
 * Empty on purpose. Three posts (2, 3 and 20) had drafted bodies here, but
 * nothing had been through the team, and the blog index counts entries in this
 * map to say how many posts are written in full. A post readable in full is a
 * claim that it is finished, and none of them were.
 *
 * The drafts are not lost: they are in git at commit afdc44f, and
 * `git show afdc44f:src/data/postBodies.jsx` brings them back verbatim.
 *
 * Adding one back is enough to publish it. A post with no entry renders its
 * summary and a "still being written" note instead of inventing a body, which
 * is the same rule the papers page follows.
 *
 * Block types, for when they return: p, h, quote, list, image, callout.
 */
export const bodies = {}
