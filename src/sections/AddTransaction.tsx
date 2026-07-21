import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Plus } from 'lucide-react'
import { autoCategorize, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categories'
import { toCents, todayISO } from '@/lib/money'
import { uid, useStore } from '@/lib/store'
import type { TxType } from '@/types'

export default function AddTransaction() {
  const { state, dispatch } = useStore()
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<TxType>('expense')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [category, setCategory] = useState('')
  const [touchedCategory, setTouchedCategory] = useState(false)
  const [date, setDate] = useState(todayISO())
  const [memberId, setMemberId] = useState(state.members[0]?.id ?? '')
  const [recurring, setRecurring] = useState(false)

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
  // Auto-categorize until user picks one manually.
  const effectiveCategory = useMemo(() => {
    if (touchedCategory && category) return category
    return autoCategorize(note, type)
  }, [note, type, category, touchedCategory])

  const valid = toCents(amount) > 0 && memberId

  const save = () => {
    if (!valid) return
    dispatch({
      kind: 'addTx',
      tx: { id: uid(), type, amount: toCents(amount), category: effectiveCategory, note: note.trim(), date, memberId, recurring },
    })
    setOpen(false)
    setAmount('')
    setNote('')
    setCategory('')
    setTouchedCategory(false)
    setRecurring(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4 mr-1" /> Add</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add transaction</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(['expense', 'income'] as const).map((t) => (
              <Button key={t} variant={type === t ? 'default' : 'outline'} onClick={() => setType(t)}>
                {t === 'expense' ? '💸 Expense' : '💰 Income'}
              </Button>
            ))}
          </div>
          <div className="space-y-1">
            <Label>Amount ({state.settings.currency})</Label>
            <Input inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
          </div>
          <div className="space-y-1">
            <Label>Note</Label>
            <Input placeholder="e.g. Trader Joe's run" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Category {!touchedCategory && note && <span className="text-xs text-muted-foreground">(auto)</span>}</Label>
              <Select value={effectiveCategory} onValueChange={(v) => { setCategory(v); setTouchedCategory(true) }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          {state.members.length > 1 && (
            <div className="space-y-1">
              <Label>Who</Label>
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {state.members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Label>Recurring monthly</Label>
            <Switch checked={recurring} onCheckedChange={setRecurring} />
          </div>
          <Button className="w-full" disabled={!valid} onClick={save}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
