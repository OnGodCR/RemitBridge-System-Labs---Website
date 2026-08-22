// Blog post catalogue. Data only — rendering lives in the Blog page.
export const seriesCategories = [
  {
    "id": "all",
    "label": "All 30 posts"
  },
  {
    "id": "series1",
    "label": "Series 1: Why people send money (1-6)"
  },
  {
    "id": "series2",
    "label": "Series 2: How banks move it (7-12)"
  },
  {
    "id": "series3",
    "label": "Series 3: Blockchain scaling (13-18)"
  },
  {
    "id": "series4",
    "label": "Series 4: Cost, speed, failure (19-23)"
  },
  {
    "id": "series5",
    "label": "Series 5: Connecting it up (24-30)"
  }
]

export const posts = [
  {
    "id": 1,
    "series": "series1",
    "seriesName": "Why people send money",
    "title": "What a remittance actually is, and why it acts like income",
    "abstract": "For a lot of families this money covers groceries or school fees rather than being spare cash on top. We also separate personal transfers from business payments here, since the two get counted together in a lot of statistics and it makes the numbers hard to read.",
    "readTime": "6 min read",
    "tags": [
      "Development Economics",
      "Household Income",
      "Migration"
    ]
  },
  {
    "id": 2,
    "series": "series1",
    "seriesName": "Why people send money",
    "title": "Where does a $200 transfer actually go?",
    "author": {
      "name": "Angad Kochar",
      "role": "RemitBridge Systems Lab",
      "consentOn": "2026-08-21"
    },
    "abstract": "Two paths a $200 transfer can take, and what each one takes out of it: correspondent banks on one, pre-funded currency pools on the other. Then we price a real US to Mexico transfer at two providers, where the bank turns out to be both cheaper and faster than the money transfer operator.",
    "readTime": "10 min read",
    "tags": [
      "Corridor Fee Anatomy",
      "Intermediary Chains"
    ]
  },
  {
    "id": 3,
    "series": "series1",
    "seriesName": "Why people send money",
    "title": "The advertised fee is not the price",
    "abstract": "Writing out the full cost as an equation. Fixed fee, percentage fee, the exchange rate markup, and the cash-out charge on the other end. The advertised number usually covers the first one and stops there.",
    "readTime": "8 min read",
    "tags": [
      "TrueCost Equation",
      "FX Markup Opacity"
    ]
  },
  {
    "id": 4,
    "series": "series1",
    "seriesName": "Why people send money",
    "title": "Why the same transfer costs more on one route than another",
    "abstract": "Why the same $200 costs different amounts depending on where it is going. Competition, which banks talk to each other, how much of the currency is floating around, local rules, distance, and how many cash pickup points exist nearby.",
    "readTime": "9 min read",
    "tags": [
      "Corridor Variations",
      "FX Liquidity"
    ]
  },
  {
    "id": 5,
    "series": "series1",
    "seriesName": "Why people send money",
    "title": "Why families send small amounts often",
    "abstract": "Sending $40 every week instead of $300 once is about managing cash week to week and being able to react to an emergency. Fixed fees punish this pattern, since a flat $5 costs a lot more proportionally on $30 than it does on $300.",
    "readTime": "6 min read",
    "tags": [
      "Behavioral Economics",
      "Regressive Fees"
    ]
  },
  {
    "id": 6,
    "series": "series1",
    "seriesName": "Why people send money",
    "title": "Remittances as a kind of insurance",
    "abstract": "When there is a medical emergency, a job loss, a bad harvest, a storm, or political trouble, transfers from abroad tend to go up. This paper tries to put actual numbers on that pattern.",
    "readTime": "7 min read",
    "tags": [
      "Household Insurance",
      "Macro Economic Shocks"
    ]
  },
  {
    "id": 7,
    "series": "series2",
    "seriesName": "How banks move it",
    "title": "SWIFT sends the message, so who moves the money?",
    "author": {
      "name": "Angad Kochar",
      "role": "RemitBridge Systems Lab",
      "consentOn": "2026-08-21"
    },
    "abstract": "Three systems do three different jobs on every cross-border payment: SWIFT carries the instruction, correspondent banks move the value, and RTGS makes it final. No money ever touches SWIFT itself. Knowing which layer you are looking at is what explains a bank saying \"sent\" three days before anyone can spend it.",
    "readTime": "8 min read",
    "tags": [
      "SWIFT Cooperative",
      "Financial Messaging"
    ]
  },
  {
    "id": 8,
    "series": "series2",
    "seriesName": "How banks move it",
    "title": "The chain of banks nobody tells you about",
    "abstract": "The banks sitting between a sender and a recipient, what Nostro and Vostro accounts are, and what each intermediary does. A longer chain means more time, more cost, and less ability to see where the money currently is.",
    "readTime": "10 min read",
    "tags": [
      "Correspondent Banking",
      "Vostro Accounts"
    ]
  },
  {
    "id": 9,
    "series": "series2",
    "seriesName": "How banks move it",
    "title": "Clearing, settlement, and finality are three different things",
    "abstract": "What each of those words means, and why an app can say \"sent\" while the receiving bank still does not have money anyone can actually spend. The gap between those two moments is where most of the confusion lives.",
    "readTime": "7 min read",
    "tags": [
      "Settlement Mechanics",
      "Payment Finality"
    ]
  },
  {
    "id": 10,
    "series": "series2",
    "seriesName": "How banks move it",
    "title": "Why a transfer can still take several days",
    "abstract": "Time zones, banking hours, batch schedules, compliance checks, currency conversion, and the last step of getting cash out to a local branch. Each one adds a bit, and they stack.",
    "readTime": "9 min read",
    "tags": [
      "Settlement Latency",
      "Banking Operating Hours"
    ]
  },
  {
    "id": 11,
    "series": "series2",
    "seriesName": "How banks move it",
    "title": "How mismatched standards slow everything down",
    "abstract": "Different countries and banks use different message formats, so information gets dropped or retyped at every handoff. We look at the mess, and at ISO 20022, which is the current attempt to standardise it.",
    "readTime": "8 min read",
    "tags": [
      "ISO 20022 Standard",
      "Messaging Interoperability"
    ]
  },
  {
    "id": 12,
    "series": "series2",
    "seriesName": "How banks move it",
    "title": "Why a new system has to connect to the old banks",
    "abstract": "Ripping out the banking infrastructure that already exists is not realistic, so the useful work is in building bridges that are secure and legal. This paper argues for that approach and looks at what it requires.",
    "readTime": "8 min read",
    "tags": [
      "Fiat Bridges",
      "Institutional Banking"
    ]
  },
  {
    "id": 13,
    "series": "series3",
    "seriesName": "Blockchain scaling",
    "title": "Why base-layer blockchains struggle with this traffic",
    "abstract": "Throughput limits, block capacity, congestion, fees that jump around, and confirmation times. Many small frequent transfers turn out to be a hard traffic pattern for a base layer to handle.",
    "readTime": "9 min read",
    "tags": [
      "Layer-1 Constraints",
      "Throughput Bottlenecks"
    ]
  },
  {
    "id": 14,
    "series": "series3",
    "seriesName": "Blockchain scaling",
    "title": "Sharding explained through a remittance network",
    "author": {
      "name": "Angad Kochar",
      "role": "RemitBridge Systems Lab",
      "consentOn": "2026-08-21"
    },
    "abstract": "Doubling the shards roughly doubles the capacity, but only for transfers that stay inside one shard. A remittance has three parties by default, so it is cross-shard from the start, and adding shards makes that more likely rather than less.",
    "readTime": "9 min read",
    "tags": [
      "Sharding Architecture",
      "Parallel Processing"
    ]
  },
  {
    "id": 15,
    "series": "series3",
    "seriesName": "Blockchain scaling",
    "title": "Could sidechains be built just for remittances?",
    "abstract": "Custom rules, a dedicated validator set, how the two-way bridge works, checkpointing back to the main chain, and what exactly you have to trust for any of it to hold up.",
    "readTime": "9 min read",
    "tags": [
      "Layer-2 Sidechains",
      "Bridge Security"
    ]
  },
  {
    "id": 16,
    "series": "series3",
    "seriesName": "Blockchain scaling",
    "title": "Payment channels are fast, but the money has to be there",
    "abstract": "Channels are the quickest option on paper. But they only work when somebody has funds parked on the receiving side, so this paper is mostly about that: capacity lockup, rebalancing, routing, and what happens when liquidity runs out mid-route.",
    "readTime": "11 min read",
    "tags": [
      "State Channels",
      "Channel Liquidity"
    ]
  },
  {
    "id": 17,
    "series": "series3",
    "seriesName": "Blockchain scaling",
    "title": "Sharding vs. sidechains vs. payment channels: are we comparing equivalent systems?",
    "author": {
      "name": "Angad Kochar",
      "role": "RemitBridge Systems Lab",
      "consentOn": "2026-08-21"
    },
    "abstract": "The impressive benchmark numbers for these three architectures were not measured the same way, under the same conditions, or against the same definition of a transaction. Setting them side by side compares a top speed on a closed track to an average speed in traffic, which is why published figures cannot settle which one suits a remittance workload.",
    "readTime": "8 min read",
    "tags": [
      "RemitBench Methodology",
      "System Comparison"
    ]
  },
  {
    "id": 18,
    "series": "series3",
    "seriesName": "Blockchain scaling",
    "title": "The remittance version of the blockchain trilemma",
    "abstract": "Speed, decentralisation, security, cost, privacy, following the rules, and being usable by someone who is not technical. You cannot max out all of them at once, and this paper is about which trade-offs matter here.",
    "readTime": "8 min read",
    "tags": [
      "Blockchain Trilemma",
      "System Trade-offs"
    ]
  },
  {
    "id": 19,
    "series": "series4",
    "seriesName": "Cost, speed, failure",
    "title": "How many transactions per second would a remittance network really need?",
    "author": {
      "name": "Angad Kochar",
      "role": "RemitBridge Systems Lab",
      "consentOn": "2026-08-21"
    },
    "abstract": "The $200 everyone divides by is a fixed benchmark, not a measured average: the real US to Mexico average is $488. Working the throughput question properly, across four demand levels and an honest market share, lands nearer 14 to 33 transactions per second than the headline 143.",
    "readTime": "9 min read",
    "tags": [
      "Capacity Planning",
      "TPS Scenarios"
    ]
  },
  {
    "id": 20,
    "series": "series4",
    "seriesName": "Cost, speed, failure",
    "title": "Averages hide the transfers that go wrong",
    "abstract": "An argument for measuring the slowest 1% (P99) instead of the average. A recipient who has been waiting three days does not care what the average was that week, and averages make a system look better than it feels.",
    "readTime": "7 min read",
    "tags": [
      "Tail Latency P99",
      "Finality Metrics"
    ]
  },
  {
    "id": 21,
    "series": "series4",
    "seriesName": "Cost, speed, failure",
    "title": "What does a blockchain transfer really cost?",
    "abstract": "Adding up every cost layer: gas, bridge fees, the cost of locking up liquidity in a channel, currency conversion, and the fee to turn it into cash locally. The last one gets left out of most comparisons.",
    "readTime": "9 min read",
    "tags": [
      "Total Cost Modeling",
      "Gas vs FX Loss"
    ]
  },
  {
    "id": 22,
    "series": "series4",
    "seriesName": "Cost, speed, failure",
    "title": "What happens when nodes, validators, or bridges fail?",
    "abstract": "We design failure experiments for each setup, taking nodes offline and slowing bridges down on purpose, then look at whether transfers roll back or funds get stuck somewhere in the middle.",
    "readTime": "10 min read",
    "tags": [
      "Fault Tolerance",
      "Bridge Resilience"
    ]
  },
  {
    "id": 23,
    "series": "series4",
    "seriesName": "Cost, speed, failure",
    "title": "Security, KYC, AML, and privacy all pull against each other",
    "abstract": "Rules meant to stop financial crime require collecting data, and collecting data creates risk for exactly the people who already have the least protection. This paper sits with that tension instead of pretending it resolves.",
    "readTime": "11 min read",
    "tags": [
      "KYC / AML Compliance",
      "Data Privacy"
    ]
  },
  {
    "id": 24,
    "series": "series5",
    "seriesName": "Connecting it up",
    "title": "A plan for connecting blockchain rails to bank rails",
    "abstract": "A layered design: API gateways, translating messages into ISO 20022, regulated intermediaries handling settlement, and liquidity pools that work in real time rather than overnight.",
    "readTime": "12 min read",
    "tags": [
      "Fiat Interoperability",
      "API Gateway Blueprint"
    ]
  },
  {
    "id": 25,
    "series": "series5",
    "seriesName": "Connecting it up",
    "title": "How RemitBench is built so someone else can rerun it",
    "abstract": "Which variables we change, what we assume going in, how the synthetic data gets generated, how the code is organised, and the log of every change we made along the way.",
    "readTime": "10 min read",
    "tags": [
      "Open Source Reproducibility",
      "Benchmarking"
    ]
  },
  {
    "id": 26,
    "series": "series5",
    "seriesName": "Connecting it up",
    "title": "Building test traffic without touching anyone's real data",
    "abstract": "How we generate realistic transfer traffic, how we check that it behaves like the real thing, and why a student project has no business collecting families' financial records in the first place.",
    "readTime": "8 min read",
    "tags": [
      "Synthetic Workloads",
      "Data Minimization"
    ]
  },
  {
    "id": 27,
    "series": "series5",
    "seriesName": "Connecting it up",
    "title": "Does faster also mean less energy?",
    "abstract": "An energy-per-transaction accounting method, used to compare setups at the same transaction volume. Comparing them at different volumes proves nothing, which happens more often than it should.",
    "readTime": "8 min read",
    "tags": [
      "Energy Accounting",
      "Sustainability"
    ]
  },
  {
    "id": 28,
    "series": "series5",
    "seriesName": "Connecting it up",
    "title": "When digital access still leaves people out",
    "abstract": "The barriers that have nothing to do with the technology: language, whether someone owns a smartphone, the documents a bank asks for, rural internet, and knowing how any of this works to begin with.",
    "readTime": "9 min read",
    "tags": [
      "Digital Inclusion",
      "Financial Accessibility"
    ]
  },
  {
    "id": 29,
    "series": "series5",
    "seriesName": "Connecting it up",
    "title": "Scams, fake exchange rates, and crypto promises",
    "abstract": "A public guide to the patterns that keep showing up: rates that are too good, pressure to decide quickly, and cryptocurrency claims that fall apart under a look. We describe patterns and do not name or recommend any company.",
    "readTime": "9 min read",
    "tags": [
      "Consumer Protection",
      "Scam Prevention"
    ]
  },
  {
    "id": 30,
    "series": "series5",
    "seriesName": "Connecting it up",
    "title": "What we learned from the first community pilot",
    "abstract": "What came out of the first workshops in King County. What people understood better afterward, the questions that kept coming up, where our evaluation method fell short, and what we are changing because of it.",
    "readTime": "10 min read",
    "tags": [
      "Community Pilot",
      "Impact Evaluation"
    ]
  }
]
