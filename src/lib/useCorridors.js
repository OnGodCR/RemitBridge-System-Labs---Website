import { useEffect, useState } from 'react'
import { corridorsFor, loadCorridor, loadIndex } from '@/data/corridors'

/**
 * The survey's corridors for a currency pair, and one of them loaded.
 *
 * Fetches the index once, works out which corridors the pair can mean, and
 * loads the chosen one. Everything starts empty and fills in an effect, so
 * the page hydrates the same markup the build wrote and the reference line
 * appears a moment later rather than being wrong first.
 */
export function useCorridorBenchmarks(sendCurrency, receiveCurrency) {
  const [index, setIndex] = useState(null)
  const [chosen, setChosen] = useState(null)
  const [corridor, setCorridor] = useState(null)

  useEffect(() => {
    let live = true
    loadIndex().then((i) => live && setIndex(i))
    return () => {
      live = false
    }
  }, [])

  const options = corridorsFor(index, sendCurrency, receiveCurrency)
  const code = options.some((o) => o.code === chosen) ? chosen : (options[0]?.code ?? null)

  useEffect(() => {
    if (!code) return setCorridor(null)
    let live = true
    loadCorridor(code).then((c) => live && setCorridor(c))
    return () => {
      live = false
    }
  }, [code])

  return { options, code, choose: setChosen, corridor, vintage: index?.vintage ?? null }
}
