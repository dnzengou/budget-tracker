import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { User, Users, Baby, Plus, X } from 'lucide-react'
import { MEMBER_COLORS, uid, useStore } from '@/lib/store'
import { CURRENCIES } from '@/lib/money'
import type { Member, Mode } from '@/types'

const MODES: { id: Mode; label: string; icon: typeof User; hint: string }[] = [
  { id: 'individual', label: 'Just me', icon: User, hint: 'Track your own money' },
  { id: 'couple', label: 'Couple', icon: Users, hint: 'Two people, shared view' },
  { id: 'family', label: 'Family', icon: Baby, hint: 'Everyone in the household' },
]

export default function Onboarding() {
  const { dispatch } = useStore()
  const [mode, setMode] = useState<Mode>('individual')
  const [currency, setCurrency] = useState('USD')
  const [names, setNames] = useState<string[]>([''])

  const setName = (i: number, value: string) => {
    const next = [...names]
    next[i] = value
    setNames(next)
  }

  const start = () => {
    const clean = names.map((n) => n.trim()).filter(Boolean)
    const finalNames = clean.length ? clean : ['Me']
    const members: Member[] = finalNames.map((name, i) => ({
      id: uid(),
      name,
      color: MEMBER_COLORS[i % MEMBER_COLORS.length],
    }))
    dispatch({
      kind: 'onboard',
      settings: { mode, currency, monthStartDay: 1, onboarded: true },
      members,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">🪺</div>
          <CardTitle className="text-2xl">NestEgg</CardTitle>
          <CardDescription>Budget & expense tracking. Private — data stays in your browser.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-2">
            {MODES.map(({ id, label, icon: Icon, hint }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`rounded-lg border p-3 text-center transition-colors ${
                  mode === id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                }`}
              >
                <Icon className="mx-auto mb-1 h-5 w-5" />
                <div className="text-sm font-medium">{label}</div>
                <div className="text-xs text-muted-foreground">{hint}</div>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label>{mode === 'individual' ? 'Your name' : 'Who is tracking?'}</Label>
            {names.map((name, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder={i === 0 ? 'Name' : `Person ${i + 1}`}
                  value={name}
                  onChange={(e) => setName(i, e.target.value)}
                />
                {names.length > 1 && (
                  <Button variant="ghost" size="icon" onClick={() => setNames(names.filter((_, j) => j !== i))}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {mode !== 'individual' && names.length < 8 && (
              <Button variant="outline" size="sm" onClick={() => setNames([...names, ''])}>
                <Plus className="h-4 w-4 mr-1" /> Add person
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Button className="w-full" size="lg" onClick={start}>Start tracking</Button>
        </CardContent>
      </Card>
    </div>
  )
}
