import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RotateCcw, LogIn, LogOut } from 'lucide-react'
import CredentialsDialog from '@/components/CredentialsDialog'
import AddTransaction from '@/sections/AddTransaction'
import Budgets from '@/sections/Budgets'
import Dashboard from '@/sections/Dashboard'
import Insights from '@/sections/Insights'
import Onboarding from '@/sections/Onboarding'
import Transactions from '@/sections/Transactions'
import { useStore } from '@/lib/store'
import { useEffect, useState } from 'react'

// In-memory rate limit: 5 failed attempts trigger a 30 s cooldown. Module-scoped
// so it survives component remounts within the same tab, but resets on reload —
// good enough for a browser-only app where the JS itself is untrusted anyway.
const MAX_ATTEMPTS = 5
const COOLDOWN_MS = 30_000
let failedAttempts = 0
let cooldownUntil = 0

export default function Home() {
  const { state, dispatch } = useStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [lockedUntil, setLockedUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (lockedUntil <= now) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [lockedUntil, now])

  // Demo-only credentials: the app runs entirely in the browser with localStorage,
  // so there's no server to authenticate against. Values must live at build-time
  // (VITE_ADMIN_PASSWORD / VITE_GUEST_PASSWORD) so ops can rotate without a code
  // change; a missing env falls back to the historical dev values.
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'admin123'
  const GUEST_PASSWORD = import.meta.env.VITE_GUEST_PASSWORD ?? 'guest'

  const handleLogin = () => {
    const t = Date.now()
    if (t < cooldownUntil) {
      setLockedUntil(cooldownUntil)
      setNow(t)
      setError(`Too many attempts. Try again in ${Math.ceil((cooldownUntil - t) / 1000)}s.`)
      return
    }
    if (password === ADMIN_PASSWORD) {
      failedAttempts = 0
      cooldownUntil = 0
      dispatch({ kind: 'login', isAdmin: true, username: username || 'Admin' })
      setPassword(''); setError(''); setLockedUntil(0)
      return
    }
    if (password === GUEST_PASSWORD) {
      failedAttempts = 0
      cooldownUntil = 0
      dispatch({ kind: 'login', isAdmin: false, username: username || 'Guest' })
      setPassword(''); setError(''); setLockedUntil(0)
      return
    }
    failedAttempts += 1
    if (failedAttempts >= MAX_ATTEMPTS) {
      cooldownUntil = t + COOLDOWN_MS
      failedAttempts = 0
      setLockedUntil(cooldownUntil)
      setNow(t)
      setError(`Too many attempts. Try again in ${Math.ceil(COOLDOWN_MS / 1000)}s.`)
    } else {
      setError(`Invalid credentials. ${MAX_ATTEMPTS - failedAttempts} attempt(s) left.`)
    }
  }

  const handleLogout = () => {
    dispatch({ kind: 'logout' })
  }

  if (!state.settings.onboarded) return <Onboarding />

  // If not logged in, show login prompt
  if (!state.auth.isLoggedIn) {
    const locked = lockedUntil > now
    const secondsLeft = locked ? Math.ceil((lockedUntil - now) / 1000) : 0
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🪺</div>
            <h1 className="text-4xl font-bold">NestEgg</h1>
            <p className="text-muted-foreground mt-2">AI-Powered Private Budget Tracker</p>
          </div>
          <div className="bg-card border rounded-xl p-8 space-y-6">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                disabled={locked}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                onKeyDown={(e) => e.key === 'Enter' && !locked && handleLogin()}
                disabled={locked}
              />
            </div>
            {error && <p className="text-destructive text-sm" role="alert">{error}</p>}
            <Button onClick={handleLogin} className="w-full" size="lg" disabled={locked}>
              <LogIn className="mr-2 h-4 w-4" />
              {locked ? `Locked (${secondsLeft}s)` : 'Login'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Guest mode: View only • Admin: Full access<br />
              Data stays in your browser. No cloud.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 py-3">
          <span className="text-2xl">🪺</span>
          <div className="flex-1">
            <h1 className="font-bold leading-tight">NestEgg</h1>
            <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
              {state.settings.mode} · {state.members.map((m) => m.name).join(' & ')} 
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-muted">
                {state.auth.isAdmin ? 'Admin' : 'Guest'} {state.auth.username && `(${state.auth.username})`}
              </span>
            </p>
          </div>
          {state.auth.isAdmin && <AddTransaction />}
          {state.auth.isAdmin && (
            <CredentialsDialog adminPassword={ADMIN_PASSWORD} guestPassword={GUEST_PASSWORD} />
          )}
          {state.auth.isAdmin && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon"><RotateCcw className="h-4 w-4" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset everything?</AlertDialogTitle>
                  <AlertDialogDescription>Deletes all transactions, budgets, and members from this browser. No undo.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => dispatch({ kind: 'reset' })}>Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">
        <Tabs defaultValue="dashboard">
          <TabsList className="mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="budgets">Budgets</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard"><Dashboard /></TabsContent>
          <TabsContent value="transactions"><Transactions /></TabsContent>
          <TabsContent value="budgets"><Budgets /></TabsContent>
          <TabsContent value="insights"><Insights /></TabsContent>
        </Tabs>
      </main>

      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        Made by <a href="https://desiredsolutions.me" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">desiredsolutions.me</a> with 💚 &amp; ☕️
      </footer>
    </div>
  )
}
