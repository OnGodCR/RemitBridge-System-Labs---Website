/**
 * The lab's term list: every word the research and the workshop material rely
 * on, defined once, in plain English first.
 *
 * This exists so six translators do not render "exchange-rate margin" six
 * different ways. The English column is the canonical one; a translated column
 * ships only after a named speaker of that language has reviewed it, the same
 * consent-gated pattern the advisory group uses. Machine output never goes up
 * unreviewed: a wrong definition about money, in the reader's own language, is
 * worse than no definition.
 *
 * Definitions carry no statistics on purpose. A number belongs in figures.js
 * with a source, not inside prose that will be translated six times.
 */

/**
 * The six workshop languages, matching the Workshops page.
 *
 * `reviewer` stays null until a real speaker has agreed, by name and in
 * writing, to stand behind that column. The page renders a language's
 * translations only when a reviewer with a consent date exists, enforced in
 * code below rather than trusted to whoever edits this file next.
 */
export const LANGUAGES = [
  { code: 'es', name: 'Español', english: 'Spanish', reviewer: null },
  { code: 'zh', name: '中文', english: 'Mandarin', reviewer: null },
  { code: 'hi', name: 'हिन्दी', english: 'Hindi', reviewer: null },
  { code: 'vi', name: 'Tiếng Việt', english: 'Vietnamese', reviewer: null },
  { code: 'ar', name: 'العربية', english: 'Arabic', reviewer: null },
  { code: 'tl', name: 'Tagalog', english: 'Filipino', reviewer: null },
]

/** Consent is structural, exactly as on the Leadership page. */
const reviewed = (lang) =>
  lang.reviewer && lang.reviewer.name && lang.reviewer.consentOn ? lang : null

export const reviewedLanguages = () => LANGUAGES.filter((l) => reviewed(l))

/**
 * @typedef {Object} Term
 * @property {string} id
 * @property {string} term
 * @property {string} plain          The English definition. Canonical.
 * @property {Object<string,string>} [translations]
 *   Keyed by language code. Rendered only for languages whose reviewer has
 *   consented, whatever this object contains.
 */

/** @type {Term[]} */
export const terms = [
  {
    id: 'remittance',
    term: 'Remittance',
    plain:
      'Money a person working in one country sends to family or friends in another. Usually regular, usually small amounts, usually spent on essentials like food, rent, school and medicine.',
  },
  {
    id: 'corridor',
    term: 'Corridor',
    plain:
      'A sending country and a receiving country, taken as a pair. United States to Mexico is one corridor, United States to India is another. Costs are measured per corridor because they differ enormously between them.',
  },
  {
    id: 'mid-market-rate',
    term: 'Mid-market rate',
    plain:
      'The midpoint between what banks pay to buy a currency and what they charge to sell it, published daily. It is the fairest available yardstick for an exchange rate, and no provider offers it to customers exactly.',
  },
  {
    id: 'exchange-rate-margin',
    term: 'Exchange-rate margin',
    plain:
      'The gap between the mid-market rate and the rate a provider actually gives you. It is a real cost of the transfer, but it does not appear as a fee on the receipt, which is why it is where most of the cost hides.',
  },
  {
    id: 'transfer-fee',
    term: 'Transfer fee',
    plain:
      'The charge a provider states openly for sending money. It is the number in the advertisement, and it is usually the smaller part of what a transfer really costs.',
  },
  {
    id: 'total-cost',
    term: 'Total cost',
    plain:
      'The fee plus the exchange-rate margin plus anything charged at pickup, taken together as a share of the amount sent. The only honest way to compare two providers.',
  },
  {
    id: 'provider',
    term: 'Provider',
    plain:
      'Any business that moves the money: a bank, a money-transfer company, a mobile money service, or a post office. Also called an MTO, for money transfer operator, when it is not a bank.',
  },
  {
    id: 'sender',
    term: 'Sender',
    plain: 'The person paying for the transfer, in the country the money leaves.',
  },
  {
    id: 'recipient',
    term: 'Recipient',
    plain:
      'The person the money is for, in the country it arrives. Some paperwork calls this person the beneficiary.',
  },
  {
    id: 'cash-pickup',
    term: 'Cash pickup',
    plain:
      'Collecting the transfer as physical cash at an agent, a shop or a branch in the receiving country. Common where the recipient has no bank account, and sometimes carries its own extra charge at the counter.',
  },
  {
    id: 'bank-deposit',
    term: 'Bank deposit',
    plain: 'The transfer arrives directly into the recipient’s bank account.',
  },
  {
    id: 'mobile-money',
    term: 'Mobile money',
    plain:
      'An account that lives on a phone number rather than at a bank, common across Africa and Asia. Transfers can arrive into it like a deposit, and it can be spent or cashed out at agents.',
  },
  {
    id: 'settlement',
    term: 'Settlement',
    plain:
      'The moment money actually and finally moves between the institutions involved. A transfer can look instant to the sender while settlement between the banks behind it takes days.',
  },
  {
    id: 'payment-rails',
    term: 'Payment rails',
    plain:
      'The underlying systems money travels on, the way trains travel on tracks. Bank wires, card networks, mobile money systems and blockchains are all different rails with different speeds and costs.',
  },
  {
    id: 'swift',
    term: 'SWIFT',
    plain:
      'The messaging network banks use to instruct each other across borders. It moves instructions, not money: the money follows by settlement between the banks, which is part of why bank transfers take days.',
  },
  {
    id: 'reference-rate',
    term: 'Reference rate',
    plain:
      'A published daily snapshot of an exchange rate, from a central bank or a data service, used as a yardstick. It is a measuring stick, not a price anyone is offering you.',
  },
  {
    id: 'informal-channel',
    term: 'Informal channel',
    plain:
      'Sending money outside licensed providers, through a courier, a shopkeeper network or a trusted intermediary. Often cheaper or the only option, but unprotected: if it goes missing there is no complaint to file.',
  },
  {
    id: 'money-mule',
    term: 'Money mule',
    plain:
      'A person recruited, often through a job offer or a friendship, to receive money and forward it on. The money is usually someone else’s fraud proceeds, and moving it is a crime even when the mule did not know.',
  },
]

/** Case-insensitive match on the term or its definition. */
export const searchTerms = (query) => {
  const q = query.trim().toLowerCase()
  if (!q) return terms
  return terms.filter(
    (t) => t.term.toLowerCase().includes(q) || t.plain.toLowerCase().includes(q),
  )
}
