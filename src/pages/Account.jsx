import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Container } from '@/components/Section'
import { Input } from '@/components/ui/input'
import { buttonVariants } from '@/components/ui/button'
import { supabase, backendEnabled } from '@/lib/supabase'
import { cn } from '@/lib/utils'

function Shell({ title, children }) {
  return (
    <div className="bg-muted py-20">
      <Container className="flex justify-center">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
          <h1 className="text-2xl">{title}</h1>
          {children}
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
    <Shell title={isSignUp ? 'Create an account' : 'Sign in'}>
      {isSignUp && (
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          An account lets you apply for a fellowship and track where the application
          got to.
        </p>
      )}

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
