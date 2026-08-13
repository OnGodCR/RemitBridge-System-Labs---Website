import { Component } from 'react'
import { Container } from './Section'

/**
 * Catches a render error in a page and shows something instead of nothing.
 *
 * React 18 unmounts the whole tree when a render throws and nothing catches it.
 * The result is a blank page at a correct URL that comes back on refresh, which
 * is indistinguishable from the site being broken and gives no clue what went
 * wrong. This turns that into a message, keeps the header and footer, and shows
 * the actual error so it can be reported.
 *
 * Resets on navigation, so following a link out of a broken page works.
 */
export default class ErrorBoundary extends Component {
  state = { error: null, componentStack: '' }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidUpdate(prev) {
    // A new route is a fresh attempt; without this the boundary stays tripped
    // and every later page looks broken too.
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null, componentStack: '' })
    }
  }

  componentDidCatch(error, info) {
    // Kept as an error, not a warning, so it survives in the browser console
    // for anyone reporting the problem.
    console.error('Page failed to render:', error, info?.componentStack)
    this.setState({ componentStack: info?.componentStack ?? '' })
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <Container width="prose" className="py-24">
        <h1 className="text-3xl">This page did not load</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Something in this page threw an error. The rest of the site still works,
          so the links above and below will take you elsewhere. Reloading often
          gets you through.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 rounded-xl bg-primary px-6 py-3 font-bold text-primary-foreground"
        >
          Reload the page
        </button>

        {/* Message, then where it came from. "r is not a function" identifies
            nothing on its own: the build is minified, so the stack and the
            component list are what make it findable. Sourcemaps are on, so
            these resolve back to real files. */}
        {/* Component list first. In the last report the JS stack filled the
            box and pushed this below the fold, and it is the half that says
            which component is at fault. */}
        <pre className="mt-8 max-h-80 overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-muted p-4 text-xs leading-relaxed">
          {[
            String(this.state.error?.message || this.state.error),
            this.state.componentStack && `\nComponents:${this.state.componentStack}`,
            this.state.error?.stack && `\n${this.state.error.stack}`,
          ]
            .filter(Boolean)
            .join('\n')}
        </pre>

        <p className="mt-4 text-sm text-muted-foreground">
          If you are reporting this, send the whole grey box, not just the first
          line.
        </p>
      </Container>
    )
  }
}
