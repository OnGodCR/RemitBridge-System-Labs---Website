import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import { Container } from './Section'
import { LogoMark } from './Logo'
import { navGroups } from '@/routes'
import { authEnabled, useAuth, canWrite } from '@/lib/auth'
import { cn } from '@/lib/utils'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const { user, profile, loading, signOut } = useAuth()

  // Braced for the same reason as the scroll reset in Layout: a concise arrow
  // hands its return value to React as the effect's cleanup, and React calls
  // it on the next navigation without checking it is a function.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur">
      <Container className="flex h-20 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <LogoMark className="size-9 shrink-0 text-primary" />
          <span className="whitespace-nowrap text-lg font-extrabold tracking-tight">
            RemitBridge
          </span>
        </Link>

        {/*
          Radix opens these on hover, but also on focus and Enter, so the menu
          is reachable by keyboard rather than being hover-only.
        */}
        <NavigationMenu className="hidden lg:flex" viewport={false}>
          <NavigationMenuList>
            {navGroups.map((group) => {
              const active = group.items.some((item) => item.path === pathname)
              return (
                <NavigationMenuItem key={group.label}>
                  <NavigationMenuTrigger
                    className={cn(
                      'bg-transparent text-sm font-medium',
                      active ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {group.label}
                  </NavigationMenuTrigger>

                  {/*
                    Every panel hangs from the left edge of its own trigger, so
                    the group being pointed at is what the panel lines up with.
                    Right-aligning the last one was worse: a 78px trigger and a
                    368px panel meant it reached back past the whole menu.
                  */}
                  <NavigationMenuContent className="left-0">
                    <div className="w-[23rem]">
                      <p className="px-2.5 pb-1.5 pt-1 text-xs text-muted-foreground">
                        {group.blurb}
                      </p>
                      <ul>
                        {group.items.map((item) => (
                          <li key={item.path}>
                            <NavigationMenuLink asChild>
                              {/*
                                flex-col and items-start are set here because the
                                preset's link is `flex items-center`. Without
                                them the title and the description sit side by
                                side, and the descriptions start at a different
                                place on every row.
                              */}
                              <Link
                                to={item.path}
                                className="flex flex-col items-start gap-0.5 rounded-xl px-2.5 py-2.5"
                              >
                                <span className="font-bold leading-snug">{item.label}</span>
                                <span className="text-sm leading-snug text-muted-foreground">
                                  {item.blurb}
                                </span>
                              </Link>
                            </NavigationMenuLink>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              )
            })}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          {authEnabled && !loading && (
            user ? (
              <>
                {canWrite(profile) && (
                  <Link
                    to="/write"
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'lg' }),
                      'hidden px-4 sm:inline-flex',
                    )}
                  >
                    Write
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'lg' }),
                    'hidden px-4 sm:inline-flex',
                  )}
                >
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'lg' }),
                    'hidden px-4 sm:inline-flex',
                  )}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/sign-in"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'lg' }),
                  'hidden px-4 sm:inline-flex',
                )}
              >
                Sign in
              </Link>
            )
          )}

          <Link
            to="/fellowships"
            className={cn(buttonVariants({ size: 'lg' }), 'hidden px-6 sm:inline-flex')}
          >
            Join the lab
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            {/* Styled directly rather than via `asChild` + Button: this preset's
                Button is not a forwardRef component, so Radix could not attach
                the ref it needs for focus return. */}
            <SheetTrigger
              aria-label="Open menu"
              className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'lg:hidden')}
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-left text-lg">Menu</SheetTitle>
              </SheetHeader>
              {/* Same grouping, expanded — hover menus do not work on touch. */}
              <nav className="flex flex-col gap-6 px-4 pb-8">
                {navGroups.map((group) => (
                  <div key={group.label}>
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-primary">
                      {group.label}
                    </p>
                    <ul>
                      {group.items.map((item) => (
                        <li key={item.path}>
                          <NavLink
                            to={item.path}
                            className={({ isActive }) =>
                              cn(
                                'block border-b border-border py-3 text-sm font-medium',
                                isActive ? 'text-primary' : 'text-muted-foreground',
                              )
                            }
                          >
                            {item.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  )
}
