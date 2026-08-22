import Section, { Container, SectionImage } from '@/components/Section'
import ReceiptChecker from '@/components/truecost/ReceiptChecker'
import { FX_SOURCE } from '@/lib/fx'
import calculatorImage from '@/assets/truecost-calculator.jpg'

/*
 * TrueCost.
 *
 * The tool this replaced ran on four hardcoded corridors with sample exchange
 * rates that were invented to demonstrate the arithmetic. It produced a number
 * that looked like a price and was not one. This one asks for the figures off a
 * real receipt and computes the real total, which needs no provider database
 * and works on a transfer from any counter anywhere.
 */

export default function TrueCost() {
  return (
    <>
      <Section
        heading="h1"
        title="Check my receipt"
        description="Enter what you were charged and find out what the transfer really cost, including the exchange-rate markup that was not itemised."
      >
        <ReceiptChecker />
      </Section>

      <Section tone="card" title="How the number is worked out">
        <div className="grid gap-10 md:grid-cols-[1fr_240px] md:items-start">
          <div className="max-w-2xl">
            <p className="leading-relaxed">
              The fee on the receipt is usually the small part. The bigger part is the
              exchange rate. A provider quotes a rate slightly worse than the mid-market
              one and keeps the difference, and because it is a rate rather than a charge
              it never appears as a line on the receipt.
            </p>

            <p className="mt-6 font-bold">The whole formula</p>
            <ol className="mt-3 space-y-2 leading-relaxed">
              <li>
                Take the fee off the amount you sent. What is left is what actually got
                converted.
              </li>
              <li>
                Compare the rate you were given against the mid-market rate. The gap,
                applied to the converted amount, is the exchange-rate cost.
              </li>
              <li>
                Convert any pickup charge back into your currency at the mid-market rate.
              </li>
              <li>Add the three together. That is the total, and its share of what you sent.</li>
            </ol>

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              The markup applies to the converted amount and not to the gross, because the
              fee is taken first and never reaches the exchange. Charging it the spread as
              well would count the same money twice.
            </p>

            <p className="mt-8 font-bold">Where the mid-market rate comes from</p>
            <p className="mt-3 leading-relaxed">
              One of two sources, and the tool names the one that answered rather than
              crediting a fixed one.{' '}
              <a
                href={FX_SOURCE.href}
                className="font-medium text-primary underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                {FX_SOURCE.name}
              </a>{' '}
              aggregates daily reference rates published by central banks. It needs no key
              and its code is open, so anyone can check what it returns. Where a live feed
              is configured, that one answers instead and updates through the day.
            </p>
            <p className="mt-3 leading-relaxed">
              Either way the date the rate was published for is shown next to it. A
              reference rate is a market midpoint, not the rate at the moment a particular
              transfer was processed, and no provider was ever offering you exactly it.
            </p>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              For a currency it cannot price, the tool asks for the mid-market rate instead
              of substituting one, and labels every figure that follows as using the rate
              you entered.
            </p>
          </div>

          <SectionImage
            src={calculatorImage}
            alt="A desk calculator beside printed figures"
            className="mb-0 hidden h-40 md:block"
          />
        </div>
      </Section>

      {/*
        Full weight, not a footnote. This page invites someone to act on a
        number, so what the number does not account for belongs at the same size
        as the number itself.
      */}
      <Section title="What this does not tell you">
        <div className="max-w-2xl space-y-5 leading-relaxed">
          <p>
            <span className="font-bold">It is arithmetic on your figures, not a quote.</span>{' '}
            Nothing here is priced by a provider or checked against one. It takes the
            numbers you entered and works out what they add up to.
          </p>
          <p>
            <span className="font-bold">The mid-market rate is a daily reference.</span> It
            is published once a day, and the rate at the moment your transfer was processed
            may have been different. On a volatile day it could be different by more than
            the markup you are trying to measure.
          </p>
          <p>
            <span className="font-bold">It does not know about offers.</span> Promotional
            rates, first-transfer discounts, fee waivers above a certain amount and loyalty
            pricing are all invisible to it. A rate better than mid-market usually means you
            got one of these.
          </p>
          <p>
            <span className="font-bold">
              It does not capture taxes or agent-level variation.
            </span>{' '}
            Some receiving countries tax inbound transfers. Some agents add a charge at the
            counter that is not on the paperwork. If it was not on your receipt, it is not
            in this calculation.
          </p>
          <p>
            <span className="font-bold">
              For some currencies the mid-market rate is whatever you typed.
            </span>{' '}
            When the reference service cannot price a pair, the tool asks you for the rate.
            Everything downstream is then only as good as that number.
          </p>
          <p className="text-muted-foreground">
            None of this is hedging. The tool is useful precisely because it is narrow: it
            measures the gap between what you were charged and a published reference, and
            it says nothing else.
          </p>
        </div>
      </Section>
    </>
  )
}
