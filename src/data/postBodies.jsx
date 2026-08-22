import {
  CorrespondentChain,
  LiquidityPools,
  CostComparison,
  TwoProducts,
  SwiftMessage,
  SwiftChain,
  ThreeLayers,
  SettlementSystems,
  SymptomsByLayer,
  BenchmarkVsActual,
  TpsBySize,
  DemandLevels,
  MarketShare,
  BeyondTps,
  TpsRange,
  TxnDefinitions,
  BurstConditions,
  HeldConstant,
  SecurityModels,
  FinalityMeanings,
  FairComparison,
  ClaimedTps,
} from '@/components/blog/Diagrams'

/**
 * Full post bodies, keyed by post id.
 *
 * The blog index counts entries in this map to say how many posts are written
 * in full, so a post lands here only once the text has been through the team.
 * A post with no entry renders its summary and a "still being written" note
 * instead of inventing a body, which is the same rule the papers page follows.
 *
 * Post 2 is the first one through. The wording is the approved draft; what
 * this file adds is structure. Long paragraphs are split, load-bearing
 * sentences are bolded, and the words a reader is least likely to know carry
 * a glossary token, {{id|the words as they appear}}, so the definition is one
 * hover away. Each term is tokenised on its first use only.
 *
 * Definitions live in glossary.js, never here. Two copies of a definition is
 * one copy too many, and that file is the one the translators work from.
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
      text: 'There are two main paths that a $200 {{remittance|remittance}} can take, especially when transacted through bigger institutions that already have set guidelines on how they transfer money internationally (such as big banks and {{money-transfer-operator|MTO}} organizations with the sole purpose of assisting with remittances, which are actually the 2 different categories). **These paths are especially important to understand as they are the foundation for understanding who takes cuts throughout the process.**',
    },
    { type: 'h', text: 'Path A: Traditional Bank Wire' },
    {
      type: 'p',
      text: 'Let\'s start by exploring Path A: Traditional bank wire. The sender initiates a transfer at their bank, providing the recipient\'s bank details. The sender\'s bank runs compliance screening. This includes very important processes like {{kyc|KYC verification}}, sanctions-list checks against lists like OFAC\'s. In short, all of these ensure that the transaction is not fraudulent and isn\'t related to illegal activity. These screenings do, however, add delay. This is especially true if anything flags for manual review.',
    },
    {
      type: 'p',
      text: '**The most interesting part about this entire process however, is that most banks don\'t have a direct relationship with the recipient\'s bank**, especially across borders and especially with smaller banks. This causes the payment to route through one or more {{correspondent-bank|correspondent banks}}. This involves the usage of an intermediary institution that hold {{nostro-vostro|Nostro accounts}} (money the sender\'s bank keeps with the correspondent) and Vostro accounts (money the correspondent holds on behalf of another bank) specifically to bridge banks that aren\'t directly connected. **Each intermediary organization in this chain can deduct its own fee.** These fees are often small and often completely opaque to the sender, who frequently has no idea how many hops occurred.',
    },
    {
      type: 'p',
      text: 'Currency conversion happens while the money is hopping through these intermediary organizations as well. This can occur at many different points throughout the process; sometimes at the sender\'s bank, sometimes at an intermediary, sometimes at the recipient\'s bank. **Wherever it happens, however, is where a spread over the real market rate gets applied.** This is basically a markup above the actual market rate that is determined by market forces such as supply and demand.',
    },
    {
      type: 'p',
      text: 'Final {{settlement|settlement}} between banks happens through the relevant country\'s {{rtgs|RTGS}} system, which only runs during business hours, so a wire submitted Friday evening might not settle completely until Monday. This causes the total time for a remittance to be completely delivered to often lay in 1-5 business days range.',
    },
    {
      type: 'p',
      text: 'The total cost of this transfer is the visible wire fee plus whatever got deducted at each correspondent hop plus the FX spread/markup. **The FX markup is especially important to be wary of since it is not clearly advertised** and can lead to misunderstandings between remittance senders and recipients.',
    },
    { type: 'figure', render: CorrespondentChain },
    { type: 'h', text: 'Path B: Digital-First Fintech or MTO' },
    {
      type: 'p',
      text: 'Now let\'s take a look at Path B: Digital-first fintech or MTO (Western Union, Wise, Remitly). **Many digital remittance companies don\'t actually move money across the border per transaction at all.** Instead, they maintain {{pre-funded-pool|pre-funded pools}} of local currency in both the sending and receiving country.',
    },
    {
      type: 'p',
      text: 'When you send $200, the company just draws down its existing dollar pool on the sending side and pays out from its existing peso, rupee, or naira pool on the receiving side. These MTOs and organizations then periodically rebalance those pools in bulk behind the scenes by buying currency. This is all done on the terms of the organization.',
    },
    {
      type: 'p',
      text: 'This is why a Western Union {{cash-pickup|cash pickup}} can be available in minutes even though a bank wire takes days. **The "instant" part is a liquidity trick utilized by these organizations and is not a faster settlement rail.** If the transaction is a cash pickup or it involves a local agent (a shop, pharmacy, or dedicated kiosk), an additional commission is added. Another hidden cost in this process is the recipient\'s own time and transportation cost to reach that location.',
    },
    { type: 'figure', render: LiquidityPools },
    { type: 'h', text: 'Case Study: A $200 Transfer From the US to Mexico' },
    {
      type: 'p',
      text: 'The two paths above are the general pattern that most remittance providers follow. To fully contextualize the information above, we must also take a look at a real $200 transaction. For the purposes of this post, we will follow the transaction from the USA to Mexico. **It\'s widely tracked as the largest single country-to-country {{corridor|remittance corridor}} in the world by dollar volume**, allowing for credible metrics that can support this case study.',
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
        '**Total cost: 4.12% of the amount sent**',
        'Delivery speed: less than one hour, straight to a Mexican bank account',
      ],
    },
    {
      type: 'p',
      text: '$200 converted at the {{mid-market-rate|mid-market rate}} of 18.75 would land the recipient 3,750.00 MXN. Converted at Wells Fargo\'s actual rate of 18.54, the recipient gets 3,708.00 MXN instead. 42 MXN is the difference between the mid-market rate and the actual rate.',
    },
    {
      type: 'p',
      text: 'Once we add on the $6.00 fee, the 4.12% fee becomes clear. **In USD the sender incurs a transaction cost of about $8.24 out of $200**, split between the flat fee and the FX margin. This is much better than several other corridors, specifically in the Sub-Saharan region but still does not fall under the UN\'s 3% target for remittance based transactions.',
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
        '**Total cost: 4.99% of the amount sent**',
        'Delivery speed: next day',
      ],
    },
    {
      type: 'p',
      text: 'We can apply the same math we applied previously here. $200 at the mid-market rate of 18.74 would deliver 3,748.00 MXN. At Delgado Travel\'s actual rate of 18.37, the recipient gets 3,674.00 MXN. **This opens a 74 MXN gap from the {{exchange-rate-margin|FX margin}} alone, plus the $6.00 fee, landing at roughly $9.95 of total cost out of $200.** Again, this is better than other corridors in Sub-Saharan Africa, but there\'s room to improve.',
    },
    { type: 'h', text: 'What the Real Numbers Show' },
    {
      type: 'p',
      text: 'Put side by side, the two paths look like this for a $200 send:',
    },
    {
      type: 'table',
      rowHeader: 'Measure',
      rowHeaderHidden: true,
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
      text: 'This is where the real numbers complicate the general story from Path A and Path B above. **In this specific corridor, the bank product is not slower or more expensive than the MTO. It\'s both faster and cheaper.**',
    },
    {
      type: 'p',
      text: 'An important realization, though, is that this is not a universal rule about banks, it\'s a fact about this particular Wells Fargo product on this particular high-volume corridor. Wells Fargo has built a direct payout relationship into Mexico for this route, so the transfer skips the correspondent bank chain described in Path A entirely. This leads to them not having to deal with Nostro or Vostro accounts or the multi-day RTGS settlement window. In this particular instance, the bank behaves more like a liquidity based MTO rather than a classic bank.',
    },
    {
      type: 'p',
      text: '**This relationship is the exception and certainly not the default.** The classic correspondent-bank {{swift|SWIFT}} wire, the one most people picture when they think of a "bank wire," runs a different pricing structure entirely. Independent fee analyses of Wells Fargo\'s standard international wire product put the exchange rate markup at roughly 3% to 6% above the mid-market rate, on top of a separate flat fee of $25 to $40.',
    },
    {
      type: 'p',
      text: 'If that math is done on a $200 transfer, **the flat fee alone eats 12.5% to 20% of the send amount before the FX markup is even applied.** This is exactly why nobody sends $200 through that product; the fee structure only makes sense at much larger amounts. The biggest lesson from this case study is that banks don\'t always have 1 rate; rates change from corridor to corridor and even within the same corridor over time.',
    },
    { type: 'figure', render: TwoProducts },
    {
      type: 'p',
      text: 'For this specific $200, US-to-Mexico, this specific week: the bank kept about $8.24 and the MTO kept about $9.95, out of every $200 sent. Both numbers sit in a very similar range, the flat fee is the larger share of both, with the FX margin accounting for the entire difference between them, and neither one matches the "banks are slow and expensive while MTOs are automatically fast and cheap" assumption.',
    },
    {
      type: 'p',
      text: '**The corridor a transfer runs through, and the specific product a provider has built for that corridor, matters more than which category of institution is sending it.**',
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
      icon: 'pro',
      items: [
        '**Highly regulated and predictable.** The compliance screening that adds delay is the same screening that makes the transfer traceable and reversible if something goes wrong.',
        '**No cap on transfer size in most cases.** Bank wires are built for amounts far larger than $200, and the fixed fee structure means the cost as a percentage of the transfer shrinks fast as the amount grows.',
        '**Some banks, as the case study shows, have built direct payout rails into high-volume corridors.** When that direct relationship exists, a bank wire can be just as fast and just as cheap as an MTO, sometimes cheaper.',
      ],
    },
    { type: 'label', text: 'Disadvantages:' },
    {
      type: 'list',
      icon: 'con',
      items: [
        '**At small amounts like $200, the fee structure is usually a bad fit for remittance based transfers.** A flat $25 to $40 fee on the standard SWIFT wire product eats a huge share of a small transfer.',
        '**Cost is hard to see upfront.** The FX margin is buried in the exchange rate, not listed as a line item, and most senders never find out how many correspondent banks touched their money or what each one took.',
        '**Speed depends entirely on whether a direct rail exists.** Without one, a wire is at the mercy of correspondent banks and RTGS business hours, and a Friday transfer can sit until Monday.',
      ],
    },
    { type: 'h', text: 'Path B: Digital-First Fintech or MTO', level: 3 },
    { type: 'label', text: 'Advantages:' },
    {
      type: 'list',
      icon: 'pro',
      items: [
        '**Built for small, frequent transfers.** The pricing and speed are designed around amounts like $200, not $20,000.',
        '**Usually faster for the recipient, especially for cash pickup**, because the "instant" delivery comes from a pre-funded local pool rather than waiting on cross-border settlement.',
        '**Pricing tends to be more visible.** Most of these companies show a fee and a rate on screen before the sender confirms, even if the rate still carries a markup.',
      ],
    },
    { type: 'label', text: 'Disadvantages:' },
    {
      type: 'list',
      icon: 'con',
      items: [
        '**Cash pickup and agent-based delivery add a commission on top of the transfer**, and that commission is easy to miss if you\'re only comparing headline fees.',
        '**The recipient\'s own time and transportation cost to reach a pickup location is a real cost that never shows up on any receipt.**',
        '**Because the model relies on the company\'s own liquidity pools, it depends on that company staying well capitalized and well run in a given corridor.** If a provider\'s local pool runs thin, service in that corridor can slow down or become unreliable.',
      ],
    },
    {
      type: 'p',
      text: '**Long Story Short:** for a small, one-off transfer like $200, the fintech or MTO path is usually the better default, mainly because that\'s the amount its fee structure was built for. But "usually" isn\'t "always," and the case study above shows exactly why. On a high-volume corridor where a bank has invested in a direct payout relationship, like Wells Fargo has for US-Mexico, the bank product can match or beat the MTO on both cost and speed.',
    },
    {
      type: 'p',
      text: 'The only way to actually know which is better for a specific transfer is to compare the real {{total-cost|total cost}}, fee plus FX margin plus any pickup commission, for that specific corridor and that specific provider. **Category alone doesn\'t decide it.**',
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

  7: [
    {
      type: 'p',
      text: 'When {{swift|SWIFT}} is brought up in the context of the global fintech industry, people instantly think of the global system that powers wire transfers and moves money. This isn\'t exactly what SWIFT is, though, and that\'s what this blog post aims to explore. Simply put, SWIFT is simply a messaging API with built-in security parameters.',
    },
    {
      type: 'p',
      text: '**Three separate systems are doing three separate jobs every time money crosses a border through the traditional banking system: SWIFT sends the instruction, correspondent banks hold and move the value, and RTGS systems coordinate the final settlement.** After all three of these steps have been followed, the transaction becomes irreversible.',
    },
    { type: 'h', text: 'SWIFT: The Messenger, Not the Mover' },
    {
      type: 'p',
      text: 'SWIFT stands for the Society for Worldwide Interbank Financial Telecommunication. SWIFT is a telecommunication network that was founded in 1973. It exists to let banks send each other standardized, secure messages, and that\'s it. **No money or monetary assets touch SWIFT at any point.** It simply connects banks in a secure way.',
    },
    {
      type: 'p',
      text: 'When a bank wants to pay another bank on a customer\'s behalf, it sends a formatted message over the SWIFT network. Historically this was an MT103, the message type used for a single customer credit transfer. This message basically says "pay this amount, to this account, for this reason." SWIFT messages carry the sender\'s details, the recipient\'s details, the amount, the currency, and routing information. **It does not carry the money itself.** It\'s closer to a very secure, very structured email or an API that many software systems rely on than it is to a payment/money-moving platform.',
    },
    { type: 'figure', render: SwiftMessage },
    {
      type: 'p',
      text: 'The misconception is that when people hear "SWIFT payment," they assume SWIFT itself is what physically transferred the funds, which is not what it does. SWIFT simply relays messages across banks. The bank\'s systems are the ones who actually made the money transfer happen.',
    },
    {
      type: 'p',
      text: 'Once we understand what SWIFT is, we can understand so much more about International wire transfers. For example, people are often confused on why the money they wired seems to "disappear" for a few days, why a bank can confirm they "sent" a payment while the recipient\'s bank swears they never received it, and other such quirks of the system. SWIFT sent a message, which is what allows for these things to be known. **Whether that message actually resulted in money moving depends on what happens next, at a completely different layer of the system.**',
    },
    { type: 'h', text: 'Correspondent Banks: Where the Actual Money Moves' },
    {
      type: 'p',
      text: 'If SWIFT is viewed as the messenger, {{correspondent-bank|correspondent banks}} are the ones who read the message and transfer money across bank accounts. These institutions have the ability to move funds internationally because of two specific kinds of account relationships: {{nostro-vostro|Nostro accounts}} and Vostro accounts.',
    },
    {
      type: 'p',
      text: 'A Nostro account is an account a bank holds with another bank, usually in a foreign currency, in a foreign country. Vostro is the same relationship, described from the other side. If a Mexican bank holds a dollar account with a bank in the US, the Mexican bank calls that account its Nostro account. The US bank calls that same account a Vostro account, because it\'s an account it holds on behalf of another bank. **Basically, a Nostro account can be a Vostro account and a Vostro account can be a Nostro account based on where you stand.** Truly confusing stuff!',
    },
    {
      type: 'p',
      text: 'These accounts are what let two banks with no direct relationship still get value from one to the other. Let\'s assume a small regional bank in the US wants to pay a small regional bank in Vietnam, and the two of them have never done business together and have no account relationship at all. This payment won\'t take place directly. Instead, the transaction is routed through one or more correspondent banks, larger institutions that do have relationships, sometimes with both original banks, sometimes just with the next bank in the chain.',
    },
    {
      type: 'p',
      text: 'Each correspondent in that chain debits and credits its own ledger to reflect the payment moving through, and **each one can charge its own fee for the service.** A payment between two smaller, less-connected banks might pass through two or three correspondents before it reaches its destination.',
    },
    { type: 'figure', render: SwiftChain },
    {
      type: 'p',
      text: 'This is also the part of the process most senders never see. The SWIFT message that started the payment is visible, at least to the banks involved. The correspondent chain underneath it usually isn\'t. **A sender who wires $200 has no way of knowing whether that payment touched one correspondent bank or four**, and no itemized way of seeing what each one took. That opacity is a big part of why the total cost of a bank wire is so hard to predict from the outside.',
    },
    { type: 'h', text: 'RTGS: Where the Money Actually, Finally Moves' },
    {
      type: 'p',
      text: 'SWIFT sends the instructions and money moves through correspondent banks, but what is actually moving the money? That brings us to our next item, {{rtgs|RTGS}}, also known as Real Time Gross Settlement. Correspondent banks passed the value along their chain of Nostro and Vostro accounts. But at some point, for the payment to be real and final, actual money has to move between actual bank accounts in a way that can\'t be reversed or disputed.',
    },
    {
      type: 'p',
      text: 'Let\'s break the word up and take a look at what this system entails in terms of constraints, features and more. "Real-time" means each transaction settles individually and immediately as it comes in. This means it is not batched up and processed later alongside a pile of others. "Gross" means each transaction settles at its full value, one at a time, rather than getting netted against other transactions between the same two banks. A bank that owes another bank $10 million and is owed $9 million back doesn\'t just settle the $1 million difference in an RTGS system. Each transaction moves in full, on its own.',
    },
    {
      type: 'p',
      text: 'These systems are typically run by a country\'s central bank. In the US, Fedwire is the RTGS system, and CHIPS runs alongside it, netting payments against each other rather than settling every one in full. In the Eurozone, it\'s T2, which replaced TARGET2 in March 2023. When a payment settles through one of these systems, it settles in central bank money, meaning the balances actually being debited and credited sit at the central bank itself, not at a commercial intermediary. **That\'s why RTGS settlement is considered the final, risk-free layer underneath the entire system.** Once it happens, it\'s done. There\'s no bank in the chain that can reverse it or claim it never happened, because the central bank\'s ledger says otherwise.',
    },
    { type: 'figure', render: SettlementSystems },
    {
      type: 'p',
      text: 'RTGS systems also run on limited hours, tied to the business day of the country they operate in. **This is where the "wire submitted Friday evening might not settle until Monday" problem stems from.** SWIFT messages can technically be sent at any hour, and correspondent banks can process internal steps outside business hours in some cases, but final {{settlement|settlement}} through RTGS is stuck. It can only happen during business hours. A payment can be instructed and even routed through its entire correspondent chain, and still sit unsettled until the relevant RTGS system opens for business again.',
    },
    { type: 'h', text: 'Putting the Three Layers Together' },
    {
      type: 'p',
      text: 'Tracing one $200 international transfer through all three systems allows us to understand how each layer sits on top of another. The sender\'s bank sends a SWIFT message, most likely an MT103 today or its newer ISO 20022 equivalent, saying who\'s getting paid, how much, and why. **That message is instruction only.** It moves at the speed of a network message, which is essentially instant.',
    },
    {
      type: 'p',
      text: 'The instruction then has to actually get executed by banks with real value to move. If the sender\'s bank and the recipient\'s bank don\'t have a direct account relationship, the payment routes through one or more correspondent banks, each one debiting and crediting its Nostro and Vostro accounts to pass the value along the chain. **This is where fees accumulate and payments start being delayed**, especially if anything about the payment gets flagged for manual review along the way.',
    },
    {
      type: 'p',
      text: 'Finally, the actual, final, irreversible movement of money between banks happens through the relevant RTGS system, in central bank money, during that system\'s operating hours. Everything before this was instruction and internal bookkeeping between correspondent banks. **RTGS is where the money, in the fullest sense of the word, actually changes hands and truly changes on the ledger of the central bank.**',
    },
    { type: 'figure', render: ThreeLayers },
    { type: 'h', text: 'Why the Distinction Actually Matters' },
    {
      type: 'p',
      text: 'While this knowledge could help you win a SWIFT vs RTGS trivia competition, that\'s not its only purpose. Knowing which layer does what explains most of the questions people actually have about international transfers.',
    },
    {
      type: 'p',
      text: 'Why did my bank say the payment was "sent" three days ago and the recipient still hasn\'t gotten it? **Because "sent" usually means the SWIFT message went out, not that RTGS settlement happened.** Why did a fee show up that nobody told me about? Probably a correspondent bank in the middle of the chain, invisible from either end, taking its cut on the way through. Why did a Friday transfer not show up until Tuesday? Because RTGS systems run on business hours, and a weekend sitting between the correspondent chain and final settlement adds unavoidable delay.',
    },
    { type: 'figure', render: SymptomsByLayer },
    {
      type: 'p',
      text: '**Understanding SWIFT, correspondent banking, and RTGS as three separate systems, each with a distinct and limited job, is the difference between finding international payments mysterious and understanding exactly where your money is, and isn\'t, at any point along the way.**',
    },
    { type: 'h', text: 'Sources' },
    {
      type: 'sources',
      items: [
        'SWIFT founding date, structure, and function as a messaging cooperative: en.wikipedia.org/wiki/SWIFT',
        'SWIFT message types and the MT103 single customer credit transfer format: docs.oracle.com SWIFT Integration Projects reference, Category 1 message types',
        'Nostro and Vostro account relationships in correspondent banking: standard correspondent banking terminology, cross-referenced against Federal Reserve and ECB payment system documentation',
        'Fedwire as a real-time gross settlement service operated by the Federal Reserve: federalreserve.gov/paymentsystems/fedfunds_about.htm and en.wikipedia.org/wiki/Fedwire',
        'CHIPS as the privately-owned US large-value payment system operating alongside Fedwire: en.wikipedia.org/wiki/Clearing_House_Interbank_Payments_System',
        'TARGET2 as the Eurozone\'s real-time gross settlement system, settlement in central bank money: ecb.europa.eu/paym/target/target2 and en.wikipedia.org/wiki/TARGET2',
      ],
    },
  ],

  19: [
    {
      type: 'p',
      text: 'Every blockchain-remittance solution is judged on various factors, including latency, security, interoperability with other technologies and more. One of the most important metrics that I haven\'t yet mentioned is architectural stability in the form of throughput. Can a blockchain\'s architecture truly support the amount of transactions per second that are needed for a {{remittance|remittance}} network? This blog post aims to figure out how many transactions per second a blockchain based network would need to withstand remittance workload.',
    },
    {
      type: 'p',
      text: 'Before this number can be computed, we must ask two very important questions, however. First: is $200, the figure the World Bank\'s own price data keeps using, actually the average size of a real remittance? Can this differ from corridor to corridor and how much nuance is there in this claim? Second: even with a defensible dollar figure, is dividing global remittance volume by one number and calling it "the TPS requirement" actually a fair test, or does it hide more than it reveals?',
    },
    {
      type: 'p',
      text: '**The short answer to both of these questions is that $200 is not a measured average but rather a fixed benchmark and a single annual TPS number is nowhere close to enough to size a network against due to differing loads during peak times and other conditions.**',
    },
    { type: 'h', text: 'Is $200 an Average, or a Benchmark?' },
    {
      type: 'p',
      text: 'Let\'s first get started with what the World Bank\'s Remittance Prices Worldwide (RPW) database actually says $200 is. According to RPW\'s own published methodology, the database surveys two amounts in every corridor: the local-currency equivalent of $200, and the local-currency equivalent of $500. Those two amounts were set in 2008. They were adjusted only one time in 2009 and never touched again. This allows for long-term trends with fees to be kept track of.',
    },
    {
      type: 'p',
      text: 'RPW says that the local-currency amounts may no longer match the current USD equivalent due to foreign exchange rates changing. They were still frozen on purpose, though. **$200 was not claimed to be an "average" transaction size but rather a fixed reference point chosen for comparability**, the same way a wet-lab might always test at exactly 200 milliliters regardless of what a "typical" sample size actually is in the field.',
    },
    {
      type: 'p',
      text: 'This then presents an interesting question, what does a real, observed average look like? It depends enormously on which corridor you\'re observing. The UN and IFAD describe the global pattern as migrant workers typically sending between $200 and $300 home every one or two months, a range that happens to sit close to the RPW benchmark, but it\'s a description of typical behavior. This by no means a precise measured mean, and exact averages depend on a corridor-by-corridor basis.',
    },
    {
      type: 'p',
      text: 'Let\'s take a look at one specific, heavily-documented corridor; research from the Inter-American Dialogue tracking the US-Mexico {{corridor|corridor}}, the same corridor covered in this blog\'s earlier case study [(Blog Post #2 - Click to access)](/blog/where-does-a-200-transfer-actually-go) on where a $200 transfer actually goes, puts the actual average principal per transaction at $488 as of 2023, with the average sender remitting around 16 times a year, up from 12 to 14 times a year in prior decades. **That\'s more than double the RPW benchmark, in the single largest remittance corridor in the world.**',
    },
    { type: 'figure', render: BenchmarkVsActual },
    {
      type: 'p',
      text: 'The honest takeaway from this case study was that a $200 is a reasonable, defensible number to use for price comparison, because that\'s what the $200 number was created for in the first place. **It is not a safe number to treat as "the average remittance," however, when the goal is estimating real transaction volume or sizing a network\'s required throughput.** Real average transaction size varies by corridor, by sending frequency, and by time period.',
    },
    { type: 'h', text: 'The Baseline Math' },
    {
      type: 'p',
      text: 'With these caveats and constraints being clearly identified, doing the calculations and math still provides us with valuable information.',
    },
    {
      type: 'p',
      text: 'Let\'s start with the numbers that are globally accepted. Global remittance flows reached $905 billion in 2024, according to the World Bank\'s Migration and Development Brief. This number is up 4.6% from $865 billion in 2023. This is the total volume in USD moved across the world. Turning this into a transaction count requires picking an average transaction size, and turning a transaction count into a TPS figure requires dividing by the number of seconds in a year which is 31,536,000.',
    },
    {
      type: 'p',
      text: 'It\'s important that we run this math across a range of plausible average sizes instead of committing to just one:',
    },
    {
      type: 'table',
      rowHeader: 'Assumed average transaction size',
      columns: ['Transactions per year', 'Average TPS'],
      rows: [
        ['$100', '~9.05 billion', '~287'],
        ['$200 (RPW benchmark)', '~4.53 billion', '~143'],
        ['$300', '~3.02 billion', '~96'],
        ['$500 (RPW\'s other benchmark)', '~1.81 billion', '~57'],
      ],
    },
    {
      type: 'p',
      text: 'Every one of these numbers provides us with an average number of TPS but **it\'s very important to understand that these transactions are an oversimplification of an extremely nuanced topic.** Remittance throughput can go above 300 TPS during peak times but can also drop below 57.',
    },
    { type: 'figure', render: TpsBySize },
    { type: 'h', text: 'Why an Annual Average Isn\'t a Real Requirement' },
    {
      type: 'p',
      text: 'A network that can sustain 143 TPS as a year-round average has not been shown to handle a single day where real-world demand runs 30% above that average. **Ultimately, remittance demand is not flat across days. It moves with paydays, holidays, and crises.** It\'s important that we categorize remittance demands into different levels.',
    },
    {
      type: 'p',
      text: '**Ordinary demand.** The baseline scenario above, an average day with no disasters or cultural celebrations nearby. This is a must have, if a blockchain can\'t support this number then it is not the right fit for remittance based transactions.',
    },
    {
      type: 'p',
      text: '**Peak, holiday-driven demand.** Remittance volume rises measurably around culturally significant periods. Industry sources describe remittance transaction volumes during Ramadan and the run-up to Eid al-Fitr rising by up to 20% to 30%. This is primarily driven by zakat, holiday spending, and pre-Eid salary disbursements concentrated in a short window. December also shows a comparable pattern for other diaspora communities. One US-based remittance provider reported a 39% increase in transaction volume during the eleven days leading up to Christmas 2023 compared to the same period the year before. Applying a 25% to 40% peak multiplier to the $200-benchmark baseline of ~143 TPS pushes the requirement into a range of roughly 179 to 200 TPS.',
    },
    {
      type: 'p',
      text: '**Emergency-driven demand.** Remittances reliably spike after disasters, but the shape of that spike looks different from a holiday surge. After the 2010 Haiti earthquake, the World Bank projected remittances to the country would rise about 20% over the following year. This would be an extra $360 million above the normal baseline we established earlier. However, this number would be sustained across months rather than concentrated into a single burst like peak times. This showcases a different load profile than a two-week Christmas spike as it is slower to build, but longer to persist. These transactions are also layered on top of whatever ordinary or seasonal demand is already happening in that window. Publicly available data on hour-by-hour or day-by-day disaster-driven spikes is thin, which makes this particular instance a little hard to measure. This is why we can\'t provide a direct assumption about the TPS requirement; more research is needed for emergency-driven demand\'s remittance volume and throughput.',
    },
    {
      type: 'p',
      text: '**Growth over time.** The last factor that needs to be considered in that remittances as a whole are growing in volume overtime. They grew from roughly $586 billion in 2015 to $905 billion in 2024, a compound annual growth rate of just under 5%. If we hold that growth rate steady and project forward ten years, global flows can be estimated to reach as high as $1.47 trillion. At the same $200 benchmark and the same smoothed-average approach, a baseline requirement of roughly 234 TPS is needed. This is before any peak multiplier is applied, and something closer to 290 to 330 TPS is an estimate for peak demand. **A network sized only against today\'s volume will simply not be strong enough to support remittances in the future**, so the biggest requirement for a remittance transacting system is the potential for growth in the future.',
    },
    { type: 'figure', render: DemandLevels },
    { type: 'h', text: 'The Missing Variable: Market Share' },
    {
      type: 'p',
      text: 'Every figure above assumes one thing that\'s almost certainly false, though. **A single blockchain-based architecture would certainly not carry 100% of global remittance volume.** That\'s not how payment infrastructure gets adopted with the current systems we have. New rails start with a fraction of the market and grow from there, if they grow at all.',
    },
    {
      type: 'p',
      text: 'A new architecture capturing 10% of global remittance volume, a reasonably ambitious but not implausible early-adoption target, would need to sustain roughly 14 to 20 TPS at the $200 benchmark. This is very far from the 143 to 200 TPS estimate presented earlier. Capturing 1% of the market drops that down ever more, to roughly 1.4 to 2 TPS. **This is the single most important adjustment that blockchain-remittance throughput claims need to make.** The headline that "global remittances need X TPS" number is only the right target for a system that expects to eventually replace the entire existing system outright, and that\'s a target for the architecture\'s ceiling, not its minimum viable requirement for adoption to be pushed.',
    },
    { type: 'figure', render: MarketShare },
    { type: 'h', text: 'What This Number Still Doesn\'t Tell You' },
    {
      type: 'p',
      text: 'Even a fully scenario-built, market-share-adjusted TPS target only answers the question of raw capacity: can the network process this many transactions per second, under load. It says nothing about whether those transactions actually finish, how long finality takes once a transaction is submitted, what happens to the transactions that fail partway through, or whether the network holds up when demand is concentrated in the worst possible hour rather than spread evenly across the scenario window. **A network that hits its TPS target on average while its slowest 5% of transactions take ten times as long to settle has not actually solved the problem.** That\'s a separate question, with its own separate data, and it\'s where the next post in this series picks up.',
    },
    { type: 'figure', render: BeyondTps },
    { type: 'h', text: 'Putting a Number on It' },
    {
      type: 'p',
      text: 'Based on all the math done in this blog post (based off the world bank\'s estimates), the honest range looks like this: an ordinary-demand floor of roughly 57 to 287 TPS depending entirely on which average transaction size is assumed, a peak-demand ceiling in the 180 to 330 TPS range once holiday effects and a decade of projected growth are layered on top. All these numbers are for a system that will outright replace {{swift|SWIFT}} based transacting, which isn\'t realistic.',
    },
    {
      type: 'p',
      text: '**The more realistic target is closer to 14 to 33 TPS once a defensible early market-share assumption is applied (10% of remittance load during peak times).** None of these numbers is "the" TPS requirement, as each scenario, corridor and time has a different requirement but they are a strong base to build a baseline off.',
    },
    { type: 'figure', render: TpsRange },
    { type: 'h', text: 'Sources' },
    {
      type: 'sources',
      items: [
        'World Bank, Remittance Prices Worldwide methodology, on the 200/500 benchmark amounts fixed in 2008: remittanceprices.worldbank.org/methodology',
        'World Bank Migration and Development Brief, global remittance flows reaching $905 billion in 2024, up from $865 billion in 2023: migrationdataportal.org/themes/remittances-overview',
        'UN / IFAD, on migrant workers typically sending $200-300 every one to two months: un.org, "Remittances matter: 8 facts you don\'t know about the money migrants send back home"; ifad.org, "15 reasons remittances matter"',
        'Inter-American Dialogue, US-Mexico corridor average transaction size ($488) and annual sending frequency (~16 times/year): thedialogue.org, "Understanding the Recent Growth in Remittances to Mexico"',
        'Qatar Tribune, Ramadan/Eid remittance volume increases of 20-30% compared to other months: qatar-tribune.com, "Ramadan drives surge in workers\' remittances from Qatar"',
        'IDT Corp / BOSS Money, 39% Christmas-period transaction volume increase: idt.net, "BOSS Money Reports Strong Remittance Topline Increase over the Christmas Holiday Season"',
        'World Bank, on the projected 20% post-earthquake remittance surge to Haiti in 2010: worldbank.org, "Haiti: Remittances Key to Earthquake Recovery"',
        'World Bank Migration and Development Brief historical figures (2015 global remittance flow of $586 billion), used for the 2015-2024 growth-rate calculation: business-standard.com World Bank remittance coverage, 2015-2022 editions',
      ],
    },
  ],

  17: [
    {
      type: 'p',
      text: 'Sharding, sidechains, and off-chain payment channels are advancements within cryptocurrency that use alternative methods to achieve faster throughput, latency, and more. When one searches for benchmarks related to these technologies, the internet hands over a pile of extremely impressive figures. One architecture claims thousands of transactions per second. Another claims near-instant finality. A third claims fees measured in fractions of a cent. If we put those numbers side by side, it looks like a straightforward comparison. This is not exactly the case, however, and that’s what this blog post aims to dive into.',
    },
    {
      type: 'p',
      text: '**Almost none of the benchmarks mentioned earlier were measured the same way, against the same conditions, using the same definitions of what counts as a transaction, a cost, or a finished payment.** Comparing them directly is closer to comparing a car\'s top speed on a closed track to another car\'s average speed in city traffic, which leads to a very hazy view of what each technology\'s advantages and disadvantages are.',
    },
    { type: 'figure', render: ClaimedTps },
    { type: 'h', text: 'The Industry Doesn\'t Even Agree on What "TPS" Means' },
    {
      type: 'p',
      text: 'Let’s start by looking at the metric everyone reaches for first: transactions per second. This is something that one would assume is standardized, but this is not exactly the case. Independent analysis of blockchain benchmarking has pointed out that most research studies that test these tools don’t do so under the same workload and the same environment. One chain advertised tens of thousands of TPS, while another advertised very little TPS. The work surrounding these technologies can reflect completely different definitions of "transaction," among other features that are not standardized. A simple payment on one network compared to a complex smart-contract call on another are not interchangeable, so this begs the question, how can we compare existing metrics of just one technology, without even branching out to compare multiple technologies against each other?',
    },
    {
      type: 'p',
      text: 'Independent research on blockchain performance measurement has made the same point from a different angle: **not all transactions are equal**, and without breaking performance down into multiple components instead of one headline number, comparisons end up obscuring what matters. A payment channel processing a simple balance update and a sharded network processing a cross-shard smart-contract call are not doing the same amount of work, even if both get reported as "one transaction."',
    },
    { type: 'figure', render: TxnDefinitions },
    { type: 'h', text: 'Short Bursts Aren\'t the Same as Sustained Load' },
    {
      type: 'p',
      text: 'Even when two systems are measuring the same kind of transaction, the conditions under which that number was produced matter enormously. Analysis from the team behind Celestia has argued that the primary reason blockchain benchmarks mislead is that they run short bursts of traffic rather than sustained load. There\'s very clearly a large difference between a system that can accept a huge volume of transactions for a few minutes and one that can sustain that volume indefinitely in production, with all the storage growth, indexing overhead, and syncing demands that come with continuous operation, 24/7. **A number pulled from a ten-minute test on optimized hardware does not speak for the technology as a whole.**',
    },
    {
      type: 'p',
      text: 'This isn\'t a hypothetical concern for sharded networks specifically. Zilliqa, one of the earliest public blockchains to implement sharding in production, published testnet results in 2017 showing 2,488 transactions per second using six shards and 3,600 nodes, a test run entirely on Amazon Web Service\'s Singapore data center, using up the region\'s available server capacity in the process. While that number is real, the methodology has a few holes in it that are worth digging into. Their tests have nodes sitting close together in one cloud region, with no real-world latency between continents, no adversarial nodes, no competing background traffic, and no sustained multi-day operation. **It describes what sharding can do under laboratory conditions, not necessarily what a geographically distributed, publicly reachable production network handling real {{remittance|remittance}} traffic would sustain.**',
    },
    { type: 'figure', render: BurstConditions },
    { type: 'h', text: 'Hardware, Validator Count, and Geography Are Rarely Held Constant' },
    {
      type: 'p',
      text: 'A sharded network\'s throughput scales with the number of shards and the number of validators available to fill them. A sidechain\'s throughput depends on how many validators it runs and how demanding its consensus mechanism is. A payment channel network\'s effective throughput depends on how much liquidity is actually available and how well-connected the channel topology is. **None of these numbers are architecture-neutral**, meaning that they all rely on different architectural capacities to increase their throughput. This makes it extremely hard to develop a fair comparison because having a low number of validators, for example, could negatively impact a sidechain while not having an impact on an off-chain technology.',
    },
    {
      type: 'p',
      text: 'It is also important to consider what changes between a benchmark run on a handful of validators in a single data center versus one run across globally distributed nodes with realistic network latency and packet loss between them. Real-world guidance on designing fair blockchain benchmarks emphasizes exactly this; results need to be objective and verifiable by anyone through open scripts, configurations, and disclosed machine specs. If this is not possible, a benchmark\'s headline number can\'t be trusted to represent anything beyond the specific hardware and network topology it was run on. **A sidechain benchmarked on ten validators in one region and another benchmarked on a hundred validators spread across five continents are not comparable numbers, even if both get reported simply as "TPS."**',
    },
    { type: 'figure', render: HeldConstant },
    { type: 'h', text: 'Different Architectures Carry Different Security Guarantees, and That Changes What the Number Means' },
    {
      type: 'p',
      text: 'These three architectures don\'t just process transactions differently, they protect them differently with a different security protocol. **A throughput number that ignores that difference is comparing systems that aren\'t actually offering the same thing.**',
    },
    {
      type: 'p',
      text: 'A sharded network\'s transactions are typically still secured by validators drawn from and accountable to the same overall network, even though any single shard only sees a fraction of the total transaction load. A sidechain, by contrast, usually runs its own independent validator set and its own consensus mechanism, meaning its security is not directly inherited from the main chain it bridges to. This is a distinction repeatedly flagged in technical overviews of Layer 2 scaling: sidechains carry independent security models that can be meaningfully weaker than the chain they connect to. This is a tradeoff that needs to be evaluated with additional literature in the field. A payment channel\'s security rests on a different foundation still, cryptographic commitments and the ability to dispute an invalid state on-chain if a counterparty misbehaves, which works well for funds actively sitting in an open channel. What this doesn’t address though, is that the liquidity of the money is locked up until delivery.',
    },
    {
      type: 'p',
      text: 'If we put a sidechain\'s throughput number next to a payment channel\'s throughput number next to a sharded network\'s throughput number, without accounting for the fact that one of them is trusting an independent validator set, one of them is trusting cryptographic dispute resolution between two specific parties, and one of them is trusting the same validator pool as the base layer, the comparison is simply not fair. **There are way too many other factors at play for TPS to be the end-all, be-all determining factor that we treat it as.**',
    },
    { type: 'figure', render: SecurityModels },
    { type: 'h', text: '"Cost" and "Finality" Don\'t Mean the Same Thing Across Architectures' },
    {
      type: 'p',
      text: 'The same problem shows up in the other two numbers usually placed next to throughput: cost and finality.',
    },
    {
      type: 'p',
      text: 'A sidechain\'s per-transaction cost is usually just its own gas fee, but that ignores the separate cost of bridging value onto and off of the sidechain in the first place. This is a cost that doesn\'t exist for a sharded network processing a transaction natively within one chain. A payment channel\'s advertised near-zero fee ignores the cost of the capital sitting locked inside the channel the whole time. This produces a major opportunity cost as this money isn’t being used to produce more money or for consumption. **It is completely illiquid.**',
    },
    {
      type: 'p',
      text: 'Finality is arguably worse. "Final" on a sharded network usually means the transaction has been committed within its shard and cross-shard confirmation has completed. "Final" on a sidechain can mean confirmed on the sidechain itself, which is a different and often weaker guarantee than confirmed and settled back on the main chain through its bridge. "Final" on a payment channel can mean the payment has been acknowledged instantly between the two parties in the channel, while the actual on-chain {{settlement|settlement}} of that channel\'s balance doesn\'t happen until the channel closes, potentially much later. This once again, showcases the lack of standardization. **A fair metric needs to be developed for finality as well for all 3 of these technologies to be compared against each other.**',
    },
    { type: 'figure', render: FinalityMeanings },
    { type: 'h', text: 'What a Fair Comparison Actually Requires' },
    {
      type: 'p',
      text: 'All the points I made earlier in the blog post can lead you to think one thing and one thing only, these three technologies simply can’t be compared. This is not true, however. Everything above illustrates that you can’t compare these three technologies with published benchmarks due to a lack of standardization. **What is possible, however, is publishing and testing your own benchmarks under a standardized methodology and procedure.** This is what our lab is currently working on with our research paper.',
    },
    {
      type: 'p',
      text: 'At minimum, a comparison worth trusting needs matched hardware specifications across every architecture being tested, a comparable number of validators or nodes rather than whatever each project happened to test with, geographically realistic network conditions instead of a single data center, sustained load over hours or days rather than a short burst, a shared and explicit definition of what counts as one transaction, separate accounting for bridge, liquidity and a stated definition of finality for each architecture. **Every one of these variables gets held differently, or not held at all, across most of the benchmark numbers currently circulating for these three approaches, which is exactly why the headline figures don\'t actually settle which architecture performs best for a remittance workload.**',
    },
    { type: 'figure', render: FairComparison },
    { type: 'h', text: 'Sources' },
    {
      type: 'sources',
      items: [
        'ACM, "BBSF: Blockchain Benchmarking Standardized Framework," on the lack of standardized metrics and workloads across blockchain performance evaluations: dl.acm.org/doi/fullHtml/10.1145/3595647.3595649',
        'a16z crypto, "Why blockchain performance is hard to measure," on the absence of standardized metrics and the problem of treating all transactions as equal: a16zcrypto.com/posts/article/why-blockchain-performance-is-hard-to-measure',
        'Celestia, "Why Blockchain Benchmarks Are Usually Deceiving," on short-burst benchmarks versus sustained production load: blog.celestia.org/why-blockchain-benchmarks-are-usually-deceiving',
        'BNB Chain Blog, "Designing Benchmarks for Trading-Focused Blockchains," on objective, verifiable, and transparent benchmarking design principles: bnbchain.org/en/blog/designing-benchmarks-for-trading-focused-blockchains',
        'Easy Crypto / Zilliqa project history, on Zilliqa\'s 2017 testnet results of 2,488 TPS using 3,600 nodes on AWS Singapore: hub.easycrypto.com/zilliqa-coin and blog.zilliqa.com, "Zilliqa Testnet v1.0 Release: Codename Red Prawn"',
        'iCryptoAI, "Scalability Solutions for Blockchain: Sharding and Layer-2 Technologies," on sidechains carrying independent, potentially weaker security models than the main chain: icryptoai.com/2025/11/26/scalability-solutions-for-blockchain-sharding-and-layer-2-technologies',
        'European Commission Blockchain Observatory, "An overview of blockchain scalability, interoperability and sustainability," on sharding, off-chain payment channels, and cross-shard communication challenges: blockchain-observatory.ec.europa.eu',
      ],
    },
  ],
}
