import { useState } from 'react'
import { Copy, KeyRound, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

type CredentialsDialogProps = {
  adminPassword: string
  guestPassword: string
}

function CredentialRow({ label, username, password }: { label: string; username: string; password: string }) {
  const [copied, setCopied] = useState<'user' | 'pass' | null>(null)

  const copy = async (value: string, which: 'user' | 'pass') => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(which)
      toast.success(`${which === 'user' ? 'Username' : 'Password'} copied`)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      toast.error('Clipboard unavailable — copy manually')
    }
  }

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground w-16">username</div>
        <code className="flex-1 text-sm font-mono bg-muted rounded px-2 py-1 select-all">{username}</code>
        <Button variant="ghost" size="icon" onClick={() => copy(username, 'user')} aria-label={`Copy ${label} username`}>
          {copied === 'user' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground w-16">password</div>
        <code className="flex-1 text-sm font-mono bg-muted rounded px-2 py-1 select-all">{password}</code>
        <Button variant="ghost" size="icon" onClick={() => copy(password, 'pass')} aria-label={`Copy ${label} password`}>
          {copied === 'pass' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

export default function CredentialsDialog({ adminPassword, guestPassword }: CredentialsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Show login credentials">
          <KeyRound className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Login credentials</DialogTitle>
          <DialogDescription>
            Share the guest password with people who should have view-only access.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <CredentialRow label="Admin" username="admin" password={adminPassword} />
          <CredentialRow label="Guest" username="guest" password={guestPassword} />
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          These values are baked into the client bundle at build time — anyone who inspects the
          JavaScript can read them, so they are not real secrets. Rotate them by setting{' '}
          <code className="font-mono">VITE_ADMIN_PASSWORD</code> and{' '}
          <code className="font-mono">VITE_GUEST_PASSWORD</code> as Vercel environment variables and
          redeploying.
        </p>
      </DialogContent>
    </Dialog>
  )
}
