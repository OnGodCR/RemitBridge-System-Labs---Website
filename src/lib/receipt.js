/**
 * The arithmetic behind "check my receipt".
 *
 * Kept apart from the page so it can be tested without a browser, and so the
 * formula published in "How the number is worked out" has exactly one
 * implementation to match.
 *
 * Symbols, matching the published formula:
 *   S  amount sent, in the sending currency
 *   F  fee charged, in the sending currency
 *   Q  the exchange rate the provider gave, receiving per 1 sending
 *   M  the mid-market reference rate, receiving per 1 sending
 *   R  charge at pickup, in the receiving currency
 */

/**
 * The markup applies to what is actually converted, S - F, not to the gross S.
 * The fee is taken first and never reaches the exchange, so charging it the
 * spread as well counts the same money twice and overstates the loss. The
 * calculator this replaced had that bug.
 */
export function computeReceipt({ sent, fee = 0, quotedRate, midRate, pickupCharge = 0 }) {
  const S = Number(sent)
  const F = Number(fee) || 0
  const Q = Number(quotedRate)
  const M = Number(midRate)
  const R = Number(pickupCharge) || 0

  const converted = S - F
  const receivedLocal = converted * Q - R
  const benchmarkLocal = S * M

  const fxMarginPct = ((M - Q) / M) * 100
  const fxLossSend = converted * ((M - Q) / M)
  const pickupInSend = R / M

  const totalCostSend = F + fxLossSend + pickupInSend
  const totalCostPct = (totalCostSend / S) * 100

  return {
    converted,
    receivedLocal,
    benchmarkLocal,
    shortfallLocal: benchmarkLocal - receivedLocal,
    fxMarginPct,
    fxLossSend,
    pickupInSend,
    feeSend: F,
    totalCostSend,
    totalCostPct,
  }
}

/**
 * Whether the numbers can be computed at all, and anything worth saying about
 * them that is not an error.
 *
 * Split from the maths so the form never blocks: someone can leave a field
 * empty, come back to it, and nothing is lost. `problems` stops the result
 * rendering. `notes` are shown alongside a result that did compute.
 */
export function validateReceipt({ sent, fee = 0, quotedRate, midRate }) {
  const problems = []
  const notes = []

  const S = Number(sent)
  const F = Number(fee) || 0
  const Q = Number(quotedRate)
  const M = Number(midRate)

  const missing = (v) => v === '' || v === null || v === undefined
  const bad = (v) => !Number.isFinite(v)

  if (missing(sent) || bad(S)) problems.push('Enter the amount you sent as a number.')
  else if (S <= 0) problems.push('The amount sent has to be more than zero.')

  if (bad(F)) problems.push('Enter the fee as a number, or 0 if there was none.')
  else if (F < 0) problems.push('A fee cannot be negative.')
  else if (Number.isFinite(S) && S > 0 && F >= S)
    problems.push('The fee is the whole amount or more, so nothing was left to convert. Check the two figures against the receipt.')

  if (missing(quotedRate) || bad(Q)) problems.push('Enter the exchange rate you were given.')
  else if (Q <= 0) problems.push('The exchange rate has to be more than zero.')

  if (bad(M) || M <= 0) problems.push('A mid-market rate is needed before this can be worked out.')

  if (problems.length > 0) return { ok: false, problems, notes }

  // A rate better than mid-market is real: promotional rates and first-transfer
  // offers do it. It is not an error, and showing a negative markup without
  // saying why would read as a bug.
  if (Q > M) {
    notes.push(
      'The rate you were given is better than the mid-market rate. That happens with promotional or first-transfer offers. The exchange line below is a gain rather than a cost.',
    )
  }

  // Wrong by a factor of ten or more is almost always a decimal in the wrong
  // place. Worth saying, not worth refusing: the arithmetic is still correct
  // for whatever was typed.
  const ratio = Q / M
  if (ratio >= 10 || ratio <= 0.1) {
    notes.push(
      `The rate you entered is ${
        ratio >= 10 ? 'far higher' : 'far lower'
      } than the mid-market rate of ${M.toFixed(4)}. That is usually a decimal point in the wrong place. The figures below use exactly what you typed.`,
    )
  }

  return { ok: true, problems, notes }
}

/** Twelve identical transfers. No compounding, no assumption about future rates. */
export function annualise(result) {
  return {
    totalCostSend: result.totalCostSend * 12,
    shortfallLocal: result.shortfallLocal * 12,
  }
}
