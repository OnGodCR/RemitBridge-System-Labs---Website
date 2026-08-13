import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container } from '@/components/Section'
import Backdrop from '@/components/Backdrop'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { supabase, backendEnabled } from '@/lib/supabase'
import { cn } from '@/lib/utils'

/*
 * What an account actually gets you, in order.
 *
 * Every step is what really happens, not a funnel. Signing up grants `member`,
 * which can apply for a fellowship and nothing else, and the database enforces
 * that. Promising writing access on this page would be a lie the schema would
 * then refuse to tell.
 */
const steps = [
  {
    title: 'Make an account',
    body: 'Email and a password. Nothing else is asked for, and nothing is shared with anyone.',
  },
  {
    title: 'Apply to a team',
    body: 'Four teams. Pick one and say why in a paragraph. There is no form letter we are looking for.',
  },
  {
    title: 'A student lead reads it',
    body: 'Every application is read by a person. You can see where yours has got to from your dashboard.',
  },
  {
    title: 'A decision, either way',
    body: 'By email, whichever way it goes. Being accepted is what grants writing access, not signing up.',
  },
]

function Onboarding({ isSignUp }) {
  return (
    <div className="max-w-md">
      <p className="text-xs font-bold uppercase tracking-widest text-primary">
        Joining the lab
      </p>
      <h2 className="mt-3 text-2xl sm:text-3xl">
        {isSignUp ? 'What happens after this' : 'How joining works'}
      </h2>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        An account on its own does not grant writing access. Here is the whole route,
        so nothing about it is a surprise.
      </p>

      <ol className="mt-8">
        {steps.map((step, i) => (
          <li key={step.title} className="flex gap-4 pb-7 last:pb-0">
            {/* Number and rule in one column, so the list reads as a sequence
                rather than four unrelated notes. */}
            <div className="flex flex-col items-center">
              <span className="grid size-8 shrink-0 place-items-center rounded-full border border-primary/30 bg-card text-sm font-bold text-primary">
                {i + 1}
              </span>
              {i < steps.length - 1 && (
                <span className="mt-1 w-px flex-1 bg-border" aria-hidden />
              )}
            </div>

            <div className="pt-1">
              <p className="font-bold">{step.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Shell({ title, children, aside }) {
  return (
    // Fills what is left under the header, since the footer is gone here. The
    // card would otherwise float in a short band with white below it.
    <div className="relative flex min-h-[calc(100vh-5rem)] items-center bg-muted py-16">
      <Backdrop fadeClass="from-muted" />

      <Container className="relative">
        <div
          className={cn(
            'grid items-center gap-12',
            // Only two columns when there is something to put in the second.
            aside && 'lg:grid-cols-2 lg:gap-16',
          )}
        >
          {aside}

          <div
            className={cn(
              'w-full max-w-md rounded-2xl border border-border bg-card/95 p-8 shadow-sm backdrop-blur-sm',
              aside ? 'lg:justify-self-end' : 'mx-auto',
            )}
          >
            <h1 className="text-2xl">{title}</h1>
            {children}
          </div>
        </div>
      </Container>
    </div>
  )
}

function SetupNotice() {
  return (
    <Shell title="Sign-in isn't switched on yet">
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Add your Supabase URL and publishable key to{' '}
        <code className="font-mono">.env.local</code> and restart the dev server.
      </p>
    </Shell>
  )
}

function AuthForm({ mode }) {
  const isSignUp = mode === 'signup'
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setStatus({ state: 'working', message: '' })

    const { error, data } = isSignUp
      ? await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { data: { full_name: form.name } },
        })
      : await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        })

    if (error) {
      setStatus({ state: 'error', message: error.message })
      return
    }

    // With email confirmation on, sign-up returns a user but no session.
    if (isSignUp && !data.session) {
      setStatus({
        state: 'check-email',
        message: 'Check your email for a confirmation link, then sign in.',
      })
      return
    }

    navigate('/dashboard')
  }

  return (
    <Shell
      title={isSignUp ? 'Create an account' : 'Sign in'}
      aside={<Onboarding isSignUp={isSignUp} />}
    >

      {status.state === 'check-email' ? (
        <div className="mt-6 rounded-xl border border-border bg-muted p-4">
          <p className="text-sm leading-relaxed">{status.message}</p>
          <Link to="/sign-in" className="mt-3 inline-block text-sm font-bold text-primary hover:underline">
            Go to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          {isSignUp && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Name</span>
              <Input value={form.name} onChange={set('name')} autoComplete="name" required />
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Email</span>
            <Input
              type="email"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Password</span>
            <Input
              type="password"
              value={form.password}
              onChange={set('password')}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              minLength={8}
              required
            />
          </label>

          {status.state === 'error' && (
            <p role="alert" className="text-sm text-destructive">
              {status.message}
            </p>
          )}

          <button
            type="submit"
            disabled={status.state === 'working'}
            className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
          >
            {status.state === 'working'
              ? 'Working…'
              : isSignUp
                ? 'Create account'
                : 'Sign in'}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        {isSignUp ? 'Already have an account? ' : 'Need an account? '}
        <Link
          to={isSignUp ? '/sign-in' : '/sign-up'}
          className="font-bold text-primary hover:underline"
        >
          {isSignUp ? 'Sign in' : 'Sign up'}
        </Link>
      </p>
    </Shell>
  )
}

export function SignInPage() {
  return backendEnabled ? <AuthForm mode="signin" /> : <SetupNotice />
}

export function SignUpPage() {
  return backendEnabled ? <AuthForm mode="signup" /> : <SetupNotice />
}
