import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { X } from 'lucide-react'
import { CATEGORY_EMOJI, EXPENSE_CATEGORIES } from '@/lib/categories'
import { spendByCategory } from '@/lib/insights'
import { currentMonthKey, fmt, toCents } from '@/lib/money'
import { useStore } from '@/lib/store'

export default function Budgets() {
  const { state, dispatch } = useStore()
  const [category, setCategory] = useState('')
  const [limit, setLimit] = useState('')
  const currency = state.settings.currency
  const spent = spendByCategory(state.transactions, currentMonthKey())
  const usedCategories = new Set(state.budgets.map((b) => b.category))
  const available = EXPENSE_CATEGORIES.filter((c) => !usedCategories.has(c))

  const add = () => {
    const cents = toCents(limit)
    if (!category || cents <= 0) return
    dispatch({ kind: 'setBudget', budget: { category, limit: cents } })
    setCategory('')
    setLimit('')
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-base">New monthly budget</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              {available.map((c) => <SelectItem key={c} value={c}>{CATEGORY_EMOJI[c]} {c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input className="w-40" inputMode="decimal" placeholder={`Limit (${currency})`} value={limit} onChange={(e) => setLimit(e.target.value)} />
          <Button onClick={add} disabled={!category || toCents(limit) <= 0}>Set budget</Button>
        </CardContent>
      </Card>

      {state.budgets.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">
          No budgets yet. Set one per category to get warnings before you overspend.
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {state.budgets.map((b) => {
            const used = spent[b.category] ?? 0
            const pct = Math.min(100, Math.round((used / b.limit) * 100))
            const over = used > b.limit
            return (
              <Card key={b.category}>
                <CardContent className="pt-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{CATEGORY_EMOJI[b.category]} {b.category}</span>
                    <Button variant="ghost" size="icon" onClick={() => dispatch({ kind: 'removeBudget', category: b.category })}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={over ? 'text-red-600 font-semibold' : ''}>{fmt(used, currency)} spent</span>
                    <span className="text-muted-foreground">of {fmt(b.limit, currency)}</span>
                  </div>
                  <Progress value={pct} className={over || pct >= 80 ? '[&>div]:bg-red-500' : ''} />
                  <div className="text-xs text-muted-foreground">
                    {over ? `${fmt(used - b.limit, currency)} over budget` : `${fmt(b.limit - used, currency)} left`}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
