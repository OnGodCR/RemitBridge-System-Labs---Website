import GlossaryTerm from '@/components/blog/GlossaryTerm'

/**
 * Inline spans inside a post block.
 *
 * Two tokens only: **bold**, and {{term-id|the words as they appear}}. The
 * glossary token carries the display text separately from the id so the prose
 * can say "Nostro accounts" while pointing at the one entry that defines both
 * halves of the pair.
 *
 * Deliberately not markdown. These bodies are data files edited by hand, and
 * a renderer that accepts links and images is a renderer that has to be
 * audited for what it will inject.
 */
const TOKEN = /(\*\*[^*]+\*\*|\{\{[a-z0-9-]+\|[^}]+\}\})/g

export function postText(text, theme, keyPrefix = '') {
  if (!text) return null
  return text
    .split(TOKEN)
    .filter(Boolean)
    .map((token, i) => {
      const key = `${keyPrefix}-${i}`

      if (token.startsWith('**') && token.endsWith('**')) {
        /* Recurse: a bolded sentence often contains the term worth defining,
           and the bold pattern swallows the glossary token whole otherwise.
           It terminates because the inner text can hold no further '**'. */
        return (
          <strong key={key} className="font-bold text-foreground">
            {postText(token.slice(2, -2), theme, key)}
          </strong>
        )
      }

      if (token.startsWith('{{') && token.endsWith('}}')) {
        const [id, ...rest] = token.slice(2, -2).split('|')
        return (
          <GlossaryTerm key={key} id={id} theme={theme}>
            {rest.join('|')}
          </GlossaryTerm>
        )
      }

      return <span key={key}>{token}</span>
    })
}
