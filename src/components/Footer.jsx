import { Link } from 'react-router-dom'
import { Container } from './Section'
import { LogoMark } from './Logo'
import { navGroups } from '@/routes'

export default function Footer() {
  return (
    <footer className="bg-ink py-20 text-ink-foreground">
      <Container>
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div>
            <div className="flex items-center gap-2.5">
              {/* White on the dark footer — the green mark would sit at about
                  1.6:1 against this background. */}
              <LogoMark className="size-9 shrink-0 text-ink-foreground" />
              <span className="text-lg font-extrabold tracking-tight">RemitBridge</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-muted">
              A student research lab working on cheaper, faster ways to send money across
              borders.
            </p>
          </div>

          {navGroups.map((group) => (
            <nav key={group.label}>
              <p className="text-sm font-bold">{group.label}</p>
              <ul className="mt-4 space-y-3">
                {group.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className="text-sm text-ink-muted transition-colors hover:text-ink-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Deliberately footer-only: a reference page, not a destination. */}
        <div className="mt-14 border-t border-white/10 pt-6">
          <Link
            to="/sources"
            className="text-sm text-ink-muted underline-offset-4 transition-colors hover:text-ink-foreground hover:underline"
          >
            Sources for the statistics on this site
          </Link>
        </div>
      </Container>
    </footer>
  )
}
