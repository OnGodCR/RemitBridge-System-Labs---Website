import calculatorImage from '@/assets/truecost-calculator.jpg'
import labImage from '@/assets/remitbench-lab.jpg'

/**
 * Full post bodies, keyed by post id.
 *
 * A post without an entry here renders its summary and a "still being written"
 * note rather than inventing a body. Every figure below is either the sample
 * rate set used by the TrueCost calculator or a definition — nothing here is a
 * research finding we have not actually published.
 *
 * Block types: p, h, quote, list, image, callout.
 */
export const bodies = {
  2: [
    {
      type: 'p',
      text: 'Someone hands over $200 at a counter, and about a week later a family member picks up cash on the other side. Almost nobody can tell you what happened in between, including a lot of the people working at the counter. This post follows one transfer the whole way through.',
    },
    { type: 'h', text: 'The counter' },
    {
      type: 'p',
      text: 'The first deduction is the one you can see. On the US to Mexico corridor we use as a sample, the advertised fee is $4.99. It is printed on the receipt, it is the number in the ad, and it is the number people compare between providers.',
    },
    {
      type: 'p',
      text: 'So $195.01 carries on to the next step. If this were the only deduction, the whole thing would be simple and this post would end here.',
    },
    { type: 'h', text: 'The conversion' },
    {
      type: 'p',
      text: 'The dollars have to become pesos somewhere. The rate you get is set by the provider, and it is almost never the rate banks trade at with each other (the mid-market rate). In our sample the real rate is 17.20 pesos to the dollar and the quoted rate is 16.65.',
    },
    {
      type: 'callout',
      text: 'That gap is 3.2%. On $200 it works out to about $6.40 — more than the $4.99 fee that gets all the attention.',
    },
    {
      type: 'image',
      src: calculatorImage,
      alt: 'A desk calculator beside printed figures',
      caption: 'The arithmetic is not hard. Finding the numbers to put into it is the hard part.',
    },
    { type: 'h', text: 'The other end' },
    {
      type: 'p',
      text: 'Depending on the corridor there may be a charge to actually collect the money. On this route our sample has it at zero, which is genuinely how some corridors work. On the US to Philippines route in the same sample set it is $2.00, and that is charged to the person receiving, so the sender never sees it at all.',
    },
    { type: 'h', text: 'What is left' },
    {
      type: 'p',
      text: 'At the real rate, $200 would have arrived as 3,440 pesos. What actually arrives is 3,246.92. The difference is 193.08 pesos, which is about $11.39 back in dollars, or 5.69% of what was sent.',
    },
    {
      type: 'list',
      items: [
        'Fee on the receipt: $4.99',
        'Lost in the exchange rate: $6.40',
        'Charged at pickup: $0.00',
        'Total: $11.39, or 5.69%',
      ],
    },
    {
      type: 'p',
      text: 'The point is not that 5.69% is outrageous. It is that someone comparing providers on the advertised fee alone is comparing $4.99 against numbers that decide less than half of what they actually pay.',
    },
    {
      type: 'quote',
      text: 'You can check this yourself on any corridor in the calculator. The rates are samples, so treat the output as an illustration rather than a quote.',
      cite: 'Try it on the TrueCost page',
    },
  ],

  3: [
    {
      type: 'p',
      text: 'Every provider advertises a fee. Almost none of them advertise the exchange rate margin, and on most corridors the margin is the larger number. This post writes out the full cost as an equation so it can be checked rather than argued about.',
    },
    { type: 'h', text: 'The equation' },
    {
      type: 'callout',
      text: 'Total cost = fixed fee + percentage fee + [(mid-market rate − quoted rate) ÷ mid-market rate × amount sent] + recipient charges',
    },
    {
      type: 'p',
      text: 'Four terms. Providers reliably disclose the first, sometimes the second, rarely the third, and the fourth is often charged to someone who is not in the room when the decision gets made.',
    },
    { type: 'h', text: 'Why the third term hides so well' },
    {
      type: 'p',
      text: 'A fee is a number subtracted from another number, so it shows up as a line. A rate margin is a worse price, and a worse price does not look like a deduction. It looks like a rate. There is nothing on the receipt that says "we kept 3.2% here", because from the provider\'s side nothing was kept — they simply sold pesos at their price.',
    },
    {
      type: 'p',
      text: 'This is also why "zero fee" offers are worth reading twice. Removing the first term while widening the third can leave the total higher than before.',
    },
    { type: 'h', text: 'What to do with it' },
    {
      type: 'list',
      items: [
        'Look up the mid-market rate first, before opening any provider.',
        'Work out what the amount would convert to at that rate.',
        'Compare it against what the provider says will actually arrive.',
        'The difference is the real price, fee included.',
      ],
    },
    {
      type: 'p',
      text: 'That last step is the whole method. It skips the fee entirely and compares the only two numbers that matter: what you handed over, and what showed up.',
    },
  ],

  20: [
    {
      type: 'p',
      text: 'Payment systems get compared on average settlement time. Average is the wrong statistic for this, and using it makes systems look considerably better than they feel to the people using them.',
    },
    { type: 'h', text: 'Why averages flatter' },
    {
      type: 'p',
      text: 'Suppose 99 transfers out of 100 settle in two seconds and one takes four days. The average is roughly an hour, which describes precisely none of the transfers that happened. It is far too slow to describe the 99 and far too fast to describe the one.',
    },
    {
      type: 'p',
      text: 'The single transfer that took four days is also the only one anybody will remember, because it is the one where somebody had to explain to a family member that the money was sent, it just is not there.',
    },
    {
      type: 'callout',
      text: 'P99 latency is the time by which 99 out of 100 transfers have settled. It describes the bad day rather than the typical one, which is the day worth designing for.',
    },
    {
      type: 'image',
      src: labImage,
      alt: 'A row of desktop workstations in a computer lab',
      caption: 'Every run we do records the full distribution, not just the mean.',
    },
    { type: 'h', text: 'What we measure instead' },
    {
      type: 'list',
      items: [
        'P50 — the median, what a typical transfer looks like.',
        'P99 — the slow tail, what one in a hundred people experience.',
        'Failure rate — transfers that did not complete at all.',
        'Spread between P50 and P99, which is really a measure of predictability.',
      ],
    },
    {
      type: 'p',
      text: 'That last one matters more than it sounds. A rail that always takes three days is easier to plan around than one that usually takes ten seconds and occasionally takes three days. Households sending money for rent are budgeting against the worst case, not the average one.',
    },
  ],
}
