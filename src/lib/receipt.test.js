import { describe, it, expect } from 'vitest'
import { computeReceipt, validateReceipt, annualise } from './receipt'

/*
 * The invariant is the point of this file.
 *
 * The result is shown twice: as a cost in the sending currency, and as a
 * shortfall in the receiving currency. If those two are not the same quantity
 * seen from two sides, the page is telling a reader two different stories about
 * one transfer. Converting the cost at the mid-market rate has to land exactly
 * on the shortfall.
 */
const holdsInvariant = (input) => {
  const r = computeReceipt(input)
  const converted = r.totalCostSend * Number(input.midRate)
  return Math.abs(r.shortfallLocal - converted)
}

describe('the invariant: cost in sending currency === shortfall in receiving currency', () => {
  const cases = [
    { name: 'typical USD to MXN', sent: 200, fee: 8, quotedRate: 16.2, midRate: 17.05 },
    { name: 'no fee, markup only', sent: 500, fee: 0, quotedRate: 90.1, midRate: 95.35 },
    { name: 'fee only, rate at mid-market', sent: 300, fee: 12, quotedRate: 61.27, midRate: 61.27 },
    { name: 'with a pickup charge', sent: 200, fee: 5, quotedRate: 16.2, midRate: 17.05, pickupCharge: 40 },
    { name: 'rate better than mid-market', sent: 200, fee: 3, quotedRate: 17.6, midRate: 17.05 },
    { name: 'very small transfer', sent: 5, fee: 0.5, quotedRate: 16, midRate: 17.05 },
    { name: 'very large transfer', sent: 250000, fee: 40, quotedRate: 16.9, midRate: 17.05 },
    { name: 'high-magnitude rate, VND', sent: 200, fee: 6, quotedRate: 24000, midRate: 25400 },
    { name: 'sub-unit rate, USD to GBP', sent: 200, fee: 4, quotedRate: 0.74, midRate: 0.78 },
    { name: 'everything at once', sent: 1234.56, fee: 17.25, quotedRate: 122.4, midRate: 123.25, pickupCharge: 250 },
  ]

  for (const c of cases) {
    it(c.name, () => {
      // Scaled to the size of the numbers involved: an absolute epsilon would
      // be meaninglessly tight at 5 and meaninglessly loose at 250,000.
      const scale = Math.max(1, Math.abs(c.sent * c.midRate))
      expect(holdsInvariant(c)).toBeLessThan(scale * 1e-9)
    })
  }
})

describe('the markup applies to the converted amount, not the gross', () => {
  it('excludes the fee from the amount exposed to the spread', () => {
    const r = computeReceipt({ sent: 200, fee: 20, quotedRate: 16, midRate: 17 })
    // (200 - 20) * (17 - 16) / 17
    expect(r.fxLossSend).toBeCloseTo((180 * 1) / 17, 12)
    // The bug being guarded against would use the gross 200 here.
    expect(r.fxLossSend).not.toBeCloseTo((200 * 1) / 17, 6)
  })

  it('charges nothing for FX when the rate is exactly mid-market', () => {
    const r = computeReceipt({ sent: 200, fee: 10, quotedRate: 17, midRate: 17 })
    expect(r.fxLossSend).toBeCloseTo(0, 12)
    expect(r.totalCostSend).toBeCloseTo(10, 12)
    expect(r.totalCostPct).toBeCloseTo(5, 12)
  })

  it('costs nothing at all when there is no fee and no markup', () => {
    const r = computeReceipt({ sent: 200, fee: 0, quotedRate: 17, midRate: 17 })
    expect(r.totalCostSend).toBeCloseTo(0, 12)
    expect(r.receivedLocal).toBeCloseTo(r.benchmarkLocal, 9)
  })
})

describe('pickup charges', () => {
  it('converts the pickup charge back at the mid-market rate', () => {
    const r = computeReceipt({ sent: 200, fee: 0, quotedRate: 17, midRate: 17, pickupCharge: 34 })
    expect(r.pickupInSend).toBeCloseTo(2, 12)
    expect(r.totalCostSend).toBeCloseTo(2, 12)
  })

  it('subtracts it from what actually landed', () => {
    const a = computeReceipt({ sent: 200, fee: 0, quotedRate: 17, midRate: 17 })
    const b = computeReceipt({ sent: 200, fee: 0, quotedRate: 17, midRate: 17, pickupCharge: 34 })
    expect(a.receivedLocal - b.receivedLocal).toBeCloseTo(34, 9)
  })
})

describe('a rate better than mid-market', () => {
  it('reports a negative cost rather than treating it as an error', () => {
    const r = computeReceipt({ sent: 200, fee: 0, quotedRate: 18, midRate: 17 })
    expect(r.fxMarginPct).toBeLessThan(0)
    expect(r.totalCostSend).toBeLessThan(0)
    expect(r.receivedLocal).toBeGreaterThan(r.benchmarkLocal)
  })

  it('is a note, not a problem', () => {
    const v = validateReceipt({ sent: 200, fee: 0, quotedRate: 18, midRate: 17 })
    expect(v.ok).toBe(true)
    expect(v.notes.join(' ')).toMatch(/better than the mid-market/i)
  })
})

describe('input that cannot be computed', () => {
  const problem = (input) => validateReceipt(input).problems.join(' ')

  it('rejects a fee that swallows the whole amount', () => {
    const v = validateReceipt({ sent: 100, fee: 100, quotedRate: 17, midRate: 17 })
    expect(v.ok).toBe(false)
    expect(v.problems.join(' ')).toMatch(/nothing was left to convert/i)
  })

  it('rejects an amount of zero', () => {
    expect(problem({ sent: 0, fee: 0, quotedRate: 17, midRate: 17 })).toMatch(/more than zero/i)
  })

  it('rejects non-numeric input', () => {
    expect(problem({ sent: 'two hundred', fee: 0, quotedRate: 17, midRate: 17 })).toMatch(/as a number/i)
    expect(problem({ sent: 200, fee: 0, quotedRate: 'sixteen', midRate: 17 })).toMatch(/exchange rate you were given/i)
  })

  it('rejects a missing mid-market rate', () => {
    expect(problem({ sent: 200, fee: 0, quotedRate: 17, midRate: null })).toMatch(/mid-market rate is needed/i)
  })

  it('rejects negative and zero rates', () => {
    expect(problem({ sent: 200, fee: 0, quotedRate: -17, midRate: 17 })).toMatch(/more than zero/i)
    expect(problem({ sent: 200, fee: -1, quotedRate: 17, midRate: 17 })).toMatch(/cannot be negative/i)
  })

  it('accepts a fee of zero', () => {
    expect(validateReceipt({ sent: 200, fee: 0, quotedRate: 16, midRate: 17 }).ok).toBe(true)
  })
})

describe('a rate that looks like a typo', () => {
  it('flags an order-of-magnitude error without refusing it', () => {
    const v = validateReceipt({ sent: 200, fee: 0, quotedRate: 170, midRate: 17 })
    expect(v.ok).toBe(true)
    expect(v.notes.join(' ')).toMatch(/decimal point in the wrong place/i)
  })

  it('flags it in the other direction too', () => {
    const v = validateReceipt({ sent: 200, fee: 0, quotedRate: 1.7, midRate: 17 })
    expect(v.ok).toBe(true)
    expect(v.notes.join(' ')).toMatch(/far lower/i)
  })

  it('stays quiet about an ordinary markup', () => {
    const v = validateReceipt({ sent: 200, fee: 0, quotedRate: 16.2, midRate: 17.05 })
    expect(v.notes).toHaveLength(0)
  })
})

describe('the annual view', () => {
  it('multiplies by twelve and does nothing else', () => {
    const r = computeReceipt({ sent: 200, fee: 8, quotedRate: 16.2, midRate: 17.05 })
    const y = annualise(r)
    expect(y.totalCostSend).toBeCloseTo(r.totalCostSend * 12, 12)
    expect(y.shortfallLocal).toBeCloseTo(r.shortfallLocal * 12, 9)
  })
})
