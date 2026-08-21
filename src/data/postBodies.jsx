import {
  CorrespondentChain,
  LiquidityPools,
  CostComparison,
} from '@/components/blog/Diagrams'

/**
 * Full post bodies, keyed by post id.
 *
 * The blog index counts entries in this map to say how many posts are written
 * in full, so a post lands here only once the text has been through the team.
 * A post with no entry renders its summary and a "still being written" note
 * instead of inventing a body, which is the same rule the papers page follows.
 *
 * Post 2 is the first one through. Its prose is the approved draft verbatim,
 * including the numbers: every figure in it is also recorded in
 * `src/data/figures.js` with its source and the places it is used.
 *
 * Drafts of 3 and 20 were written but never reviewed. They are in git at
 * commit afdc44f, and `git show afdc44f:src/data/postBodies.jsx` brings them
 * back verbatim.
 *
 * Block types: p, h (level 3 for a subheading), label, quote, list, image,
 * callout, table, figure, sources.
 */
export const bodies = {
  2: [
    {
      type: 'p',
      text: 'This blog post follows one $200 transfer the whole way through: the fee at the counter, the exchange rate markup, whatever the middle banks take, what the receiving bank deducts, and the pickup charge at the end.',
    },
    {
      type: 'p',
      text: 'There are two main paths that a $200 remittance can take, especially when transacted through bigger institutions that already have set guidelines on how they transfer money internationally (such as big banks and MTO organizations with the sole purpose of assisting with remittances, which are actually the 2 different categories). These paths are especially important to understand as they are the foundation for understanding who takes cuts throughout the process.',
    },
    { type: 'h', text: 'Path A: Traditional Bank Wire' },
    {
      type: 'p',
      text: 'Let\'s start by exploring Path A: Traditional bank wire. The sender initiates a transfer at their bank, providing the recipient\'s bank details. The sender\'s bank runs compliance screening. This includes very important processes like KYC verification, sanctions-list checks against lists like OFAC\'s. In short, all of these ensure that the transaction is not fraudulent and isn\'t related to illegal activity. These screenings do, however, add delay. This is especially true if anything flags for manual review. The most interesting part about this entire process however, is that most banks don\'t have a direct relationship with the recipient\'s bank, especially across borders and especially with smaller banks. This causes the payment to route through one or more correspondent banks. This involves the usage of an intermediary institution that hold Nostro accounts (money the sender\'s bank keeps with the correspondent) and Vostro accounts (money the correspondent holds on behalf of another bank) specifically to bridge banks that aren\'t directly connected. Each intermediary organization in this chain can deduct its own fee. These fees are often small and often completely opaque to the sender, who frequently has no idea how many hops occurred. Currency conversion happens while the money is hopping through these intermediary organizations as well. This can occur at many different points throughout the process; sometimes at the sender\'s bank, sometimes at an intermediary, sometimes at the recipient\'s bank. Wherever it happens, however, is where a spread over the real market rate gets applied. This is basically a markup above the actual market rate that is determined by market forces such as supply and demand. Final settlement between banks happens through the relevant country\'s RTGS system, which only runs during business hours, so a wire submitted Friday evening might not settle completely until Monday. This causes the total time for a remittance to be completely delivered to often lay in 1-5 business days range.The total cost of this transfer is the visible wire fee plus whatever got deducted at each correspondent hop plus the FX spread/markup. The FX markup is especially important to be vary of since it is not clearly advertised and can lead to misunderstandings between remittance senders and recipients.',
    },
    { type: 'figure', render: CorrespondentChain },
    { type: 'h', text: 'Path B: Digital-First Fintech or MTO' },
    {
      type: 'p',
      text: 'Now let\'s take a look at Path B: Digital-first fintech or MTO (Western Union, Wise, Remitly). Many digital remittance companies don\'t actually move money across the border per transaction at all. Instead, they maintain pre-funded pools of local currency in both the sending and receiving country. When you send $200, the company just draws down its existing dollar pool on the sending side and pays out from its existing peso, rupee, or naira pool on the receiving side. These MTOs and organizations then periodically rebalance those pools in bulk behind the scenes by buying currency. This is all done on the terms of the organization. This is why a Western Union cash pickup can be available in minutes even though a bank wire takes days. The "instant" part is a liquidity trick utilized by these organizations and is not a faster settlement rail. If the transaction is a cash pickup or it involves a local agent (a shop, pharmacy, or dedicated kiosk), an additional commission is added. Another hidden cost in this process is the recipient\'s own time and transportation cost to reach that location.',
    },
    { type: 'figure', render: LiquidityPools },
    { type: 'h', text: 'Case Study: A $200 Transfer From the US to Mexico' },
    {
      type: 'p',
      text: 'The two paths above are the general pattern that most remittance providers follow. To fully contextualize the information above, we must also take a look of a real $200 transaction. For the purposes of this post, we will follow the transaction from the USA to Mexico. It\'s widely tracked as the largest single country-to-country remittance corridor in the world by dollar volume, allowing for credible metrics that can support this case study.',
    },
    { type: 'h', text: 'Path A: Wells Fargo, Bank Account Transfer', level: 3 },
    {
      type: 'p',
      text: 'Wells Fargo offers a bank-to-bank product for this corridor. Here\'s what RPW recorded for a $200 send, collected in August 2025:',
    },
    {
      type: 'list',
      items: [
        'Fee charged: $6.00',
        'Reference mid-market rate: 18.75 MXN per USD',
        'Rate actually applied: 18.54 MXN per USD',
        'Exchange rate margin: 1.12%',
        'Total cost: 4.12% of the amount sent',
        'Delivery speed: less than one hour, straight to a Mexican bank account',
      ],
    },
    {
      type: 'p',
      text: '$200 converted at the mid-market rate of 18.75 would land the recipient 3,750.00 MXN. Converted at Wells Fargo\'s actual rate of 18.54, the recipient gets 3,708.00 MXN instead. 42 MXN is the difference between the mid-market rate and the actual rate. Once we add on the $6.00 fee, the 4.12% fee becomes clear. In USD the sender incurs a transaction cost of about $8.24 out of $200, split between the flat fee and the FX margin. This is much better than several other corridors, specifically in the sub-saharan region but still does not fall under the UN\'s 3% target for remittance based transactions.',
    },
    { type: 'h', text: 'Path B: Delgado Travel, Cash Agent', level: 3 },
    {
      type: 'p',
      text: 'Delgado Travel is a smaller MTO that specializes in cash-funded transfers through local agent locations. This is a much closer match to path B, especially within the USA-Mexico corridor. RPW\'s numbers for the same $200 send, collected the same quarter:',
    },
    {
      type: 'list',
      items: [
        'Fee charged: $6.00',
        'Reference mid-market rate: 18.74 MXN per USD',
        'Rate actually applied: 18.37 MXN per USD',
        'Exchange rate margin: 1.99%',
        'Total cost: 4.99% of the amount sent',
        'Delivery speed: next day',
      ],
    },
    {
      type: 'p',
      text: 'We can apply the same math we applied previously here. $200 at the mid-market rate of 18.74 would deliver 3,748.00 MXN. At Delgado Travel\'s actual rate of 18.37, the recipient gets 3,674.00 MXN. This opens a 74 MXN gap from the FX margin alone, plus the $6.00 fee, landing at roughly $9.95 of total cost out of $200. Again, this is better than other corridors in sub-saharan Africa, but there\'s room to improve.',
    },
    { type: 'h', text: 'What the Real Numbers Show' },
    {
      type: 'p',
      text: 'Put side by side, the two paths look like this for a $200 send:',
    },
    {
      type: 'table',
      rowHeader: 'Measure',
      columns: ['Wells Fargo', 'Delgado Travel'],
      rows: [
        ['Fee', '$6.00', '$6.00'],
        ['FX margin', '1.12%', '1.99%'],
        ['Total cost', '4.12% ($8.24)', '4.99% ($9.95)'],
        ['Recipient gets', '3,708.00 MXN', '3,674.00 MXN'],
        ['Speed', 'Under 1 hour', 'Next day'],
      ],
    },
    { type: 'figure', render: CostComparison },
    {
      type: 'p',
      text: 'This is where the real numbers complicate the general story from Path A and Path B above. In this specific corridor, the bank product is not slower or more expensive than the MTO. It\'s both faster and cheaper. An important realization, though, is that this is not a universal rule about banks, it\'s a fact about this particular Wells Fargo product on this particular high-volume corridor. Wells Fargo has built a direct payout relationship into Mexico for this route, so the transfer skips the correspondent bank chain described in Path A entirely. This leads to them not having to deal with Nostro or Vostro accounts or the multi-day RTGS settlement window. In this particular instance, the bank behaves more like a liquidity based MTO rather than a classic bank.',
    },
    {
      type: 'p',
      text: 'This relationship is the exception and certainly not the default. The classic correspondent-bank SWIFT wire, the one most people picture when they think of a "bank wire," runs a different pricing structure entirely. Independent fee analyses of Wells Fargo\'s standard international wire product put the exchange rate markup at roughly 3% to 6% above the mid-market rate, on top of a separate flat fee of $25 to $40. If that math is done on a $200 transfer, the flat fee alone eats 12.5% to 20% of the send amount before the FX markup is even applied. This is exactly why nobody sends $200 through that product; the fee structure only makes sense at much larger amounts. The biggest lesson from this case study is that banks don\'t always have 1 rate; rates change from corridor to corridor and even within the same corridor over time.',
    },
    {
      type: 'p',
      text: 'For this specific $200, US-to-Mexico, this specific week: the bank kept about $8.24 and the MTO kept about $9.95, out of every $200 sent. Both numbers sit in a very similar range, both are dominated more by the FX margin than by the visible fee, and neither one matches the "bank are slow and expensive while MTOs are automatically fast and cheap" assumption. The corridor a transfer runs through, and the specific product a provider has built for that corridor, matters more than which category of institution is sending it.',
    },
    { type: 'h', text: 'So Which One Is Actually Better?' },
    {
      type: 'p',
      text: 'There isn\'t a single answer that holds across every corridor, and the case study above is proof of that. There is a clear pattern in what each path is good at and what it costs you, however, and that\'s what we will explore in the last part of this article.',
    },
    { type: 'h', text: 'Path A: Traditional Bank Wire', level: 3 },
    { type: 'label', text: 'Advantages:' },
    {
      type: 'list',
      items: [
        'Highly regulated and predictable. The compliance screening that adds delay is the same screening that makes the transfer traceable and reversible if something goes wrong.',
        'No cap on transfer size in most cases. Bank wires are built for amounts far larger than $200, and the fixed fee structure means the cost as a percentage of the transfer shrinks fast as the amount grows.',
        'Some banks, as the case study shows, have built direct payout rails into high-volume corridors. When that direct relationship exists, a bank wire can be just as fast and just as cheap as an MTO, sometimes cheaper.',
      ],
    },
    { type: 'label', text: 'Disadvantages:' },
    {
      type: 'list',
      items: [
        'At small amounts like $200, the fee structure is usually a bad fit for remittance based transfers. A flat $25 to $40 fee on the standard SWIFT wire product eats a huge share of a small transfer.',
        'Cost is hard to see upfront. The FX margin is buried in the exchange rate, not listed as a line item, and most senders never find out how many correspondent banks touched their money or what each one took.',
        'Speed depends entirely on whether a direct rail exists. Without one, a wire is at the mercy of correspondent banks and RTGS business hours, and a Friday transfer can sit until Monday.',
      ],
    },
    { type: 'h', text: 'Path B: Digital-First Fintech or MTO', level: 3 },
    { type: 'label', text: 'Advantages:' },
    {
      type: 'list',
      items: [
        'Built for small, frequent transfers. The pricing and speed are designed around amounts like $200, not $20,000.',
        'Usually faster for the recipient, especially for cash pickup, because the "instant" delivery comes from a pre-funded local pool rather than waiting on cross-border settlement.',
        'Pricing tends to be more visible. Most of these companies show a fee and a rate on screen before the sender confirms, even if the rate still carries a markup.',
      ],
    },
    { type: 'label', text: 'Disadvantages:' },
    {
      type: 'list',
      items: [
        'Cash pickup and agent-based delivery add a commission on top of the transfer, and that commission is easy to miss if you\'re only comparing headline fees.',
        'The recipient\'s own time and transportation cost to reach a pickup location is a real cost that never shows up on any receipt.',
        'Because the model relies on the company\'s own liquidity pools, it depends on that company staying well capitalized and well run in a given corridor. If a provider\'s local pool runs thin, service in that corridor can slow down or become unreliable.',
      ],
    },
    {
      type: 'p',
      text: 'Long Story Short: for a small, one-off transfer like $200, the fintech or MTO path is usually the better default, mainly because that\'s the amount its fee structure was built for. But "usually" isn\'t "always," and the case study above shows exactly why. On a high-volume corridor where a bank has invested in a direct payout relationship, like Wells Fargo has for US-Mexico, the bank product can match or beat the MTO on both cost and speed. The only way to actually know which is better for a specific transfer is to compare the real total cost, fee plus FX margin plus any pickup commission, for that specific corridor and that specific provider. Category alone doesn\'t decide it.',
    },
    { type: 'h', text: 'Sources' },
    {
      type: 'sources',
      items: [
        'World Bank, Remittance Prices Worldwide - Wells Fargo USA-MEX bank account transfer record, Q3 2025 collection: remittanceprices.worldbank.org/node/396138',
        'World Bank, Remittance Prices Worldwide - Delgado Travel USA-MEX cash agent record, Q3 2025 collection: remittanceprices.worldbank.org/node/396082',
        'World Bank, Remittance Prices Worldwide - homepage and corridor database: remittanceprices.worldbank.org',
        'Wells Fargo standard international wire fee and FX markup figures: moneytransfer.store/guides/wells-fargo-international-money-transfer and idealremit.com/en/blog/wells-fargo-international-money-transfer',
        'Wells Fargo wire fee and exchange rate margin comparison: monito.com/en/wiki/international-wire-transfers-wells-fargo-us and wise.com/us/blog/wells-fargo-international-wire-transfer',
        'US-Mexico as the largest global remittance corridor: EMARKETER briefing, "Western Union advances brick-and-mortar push with Mexico rollout," emarketer.com',
      ],
    },
  ],
}
