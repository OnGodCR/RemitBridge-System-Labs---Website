import { useState } from 'react'
import Section, { DataRow, SectionImage } from '@/components/Section'
import TwoHundred from '@/components/TwoHundred'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import calculatorImage from '@/assets/truecost-calculator.jpg'

const corridors = {
  USD_MXN: { name: 'United States → Mexico', currency: 'MXN', benchmarkFX: 17.2, quotedFX: 16.65, advertisedFee: 4.99, recipientCharge: 0.0, fxMarkupPct: 3.2 },
  USD_INR: { name: 'United States → India', currency: 'INR', benchmarkFX: 83.1, quotedFX: 81.8, advertisedFee: 2.99, recipientCharge: 1.5, fxMarkupPct: 1.56 },
  USD_PHP: { name: 'United States → Philippines', currency: 'PHP', benchmarkFX: 56.4, quotedFX: 54.9, advertisedFee: 3.5, recipientCharge: 2.0, fxMarkupPct: 2.66 },
  USD_KES: { name: 'United States → Kenya', currency: 'KES', benchmarkFX: 145.0, quotedFX: 139.5, advertisedFee: 5.0, recipientCharge: 1.0, fxMarkupPct: 3.79 },
}

const money = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export default function TrueCost() {
  const [corridorKey, setCorridorKey] = useState('USD_MXN')
  const [sendAmount, setSendAmount] = useState(200)
  const c = corridors[corridorKey]

  // Complete-cost model: advertised fee + FX markup loss + recipient-side charges.
  const fxLoss = sendAmount * ((c.benchmarkFX - c.quotedFX) / c.benchmarkFX)
  const totalCostUSD = c.advertisedFee + fxLoss + c.recipientCharge
  const effectiveCostPct = (totalCostUSD / sendAmount) * 100

  // What actually lands, in local currency, versus a mid-market benchmark.
  const recipientLocal = (sendAmount - c.advertisedFee) * c.quotedFX - c.recipientCharge * c.quotedFX
  const benchmarkLocal = sendAmount * c.benchmarkFX
  const valueLostLocal = benchmarkLocal - recipientLocal

  return (
    <>

      <TwoHundred />

      {/* Calculator next — it is what people come to this page for. The
          explanation of the model sits underneath for anyone who wants it. */}
      <Section>
        <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
          <Card>
            <CardContent>
              <h2 className="mb-6 text-2xl">What you&rsquo;re sending</h2>

              <fieldset className="mb-6">
                <legend className="mb-2 text-sm text-muted-foreground">Corridor</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {Object.entries(corridors).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setCorridorKey(key)}
                      aria-pressed={corridorKey === key}
                      className={cn(
                        'rounded-xl border px-4 py-3 text-left text-sm transition-colors',
                        corridorKey === key
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'border-border text-muted-foreground hover:border-muted-foreground/40',
                      )}
                    >
                      {value.name}
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="mb-6">
                <label htmlFor="send-amount" className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-sm tabular-nums">${sendAmount}</span>
                </label>
                <input
                  id="send-amount"
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                  <span>$50</span>
                  <span>$1,000</span>
                </div>
              </div>

              <Separator className="mb-3" />
              <DataRow label="Real rate" value={`1 USD = ${c.benchmarkFX} ${c.currency}`} />
              <DataRow
                label="Their rate"
                value={`1 USD = ${c.quotedFX} ${c.currency} (${c.fxMarkupPct}% worse)`}
              />
              <DataRow label="Fee on the receipt" value={`$${money(c.advertisedFee)}`} />
              <DataRow label="Pickup charge" value={`$${money(c.recipientCharge)}`} />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="mb-6 text-2xl">What it actually costs</h2>

              <p className="text-4xl tabular-nums">${money(totalCostUSD)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {effectiveCostPct.toFixed(2)}% of what you sent
              </p>

              <Separator className="my-5" />
              <DataRow label="The fee you can see" value={`$${money(c.advertisedFee)}`} />
              <DataRow label="Lost in the exchange rate" value={`$${money(fxLoss)}`} emphasis />
              <DataRow label="Charged at pickup" value={`$${money(c.recipientCharge)}`} />

              <Separator className="my-5" />
              <p className="mb-1 text-sm font-medium">What lands on the other end</p>
              <DataRow label="They get" value={`${money(recipientLocal)} ${c.currency}`} />
              <DataRow
                label="Short of the real rate by"
                value={`−${money(valueLostLocal)} ${c.currency}`}
                emphasis
              />

              <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                This runs entirely in your browser. We never ask for a bank login, a card
                number, or anything about who you are.
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section tone="card" title="How the number is worked out">
        <div className="grid gap-8 md:grid-cols-[1fr_260px] md:items-start">
          <div>
            <p className="max-w-2xl leading-relaxed">
              The fee on the receipt is usually the small part. The bigger part is the
              exchange rate: a company quotes you a rate a little worse than the real one
              and keeps the difference. That markup is normally somewhere between 2% and
              5%, and it never shows up as a line item, which is sort of the point of it.
            </p>
            <div className="mt-5 rounded-2xl border border-border bg-muted p-4 text-sm leading-relaxed">
              What it costs = the fee + any percentage fee + [(real rate &minus; their
              rate) &times; what you send] + whatever the pickup place charges
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              The rates in the calculator are samples we picked to show the math, so treat
              the output as an example and not a quote.
            </p>
          </div>
          <SectionImage
            src={calculatorImage}
            alt="A desk calculator beside printed figures"
            className="mb-0 hidden h-40 md:block"
          />
        </div>
      </Section>
    </>
  )
}
