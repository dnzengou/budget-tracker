import type { State, Transaction } from '@/types'
import { currentMonthKey, monthKey } from './money'

export interface Insight {
  tone: 'good' | 'warn' | 'bad' | 'info'
  text: string
}

function sumBy(txs: Transaction[], month: string, type: 'expense' | 'income'): number {
  return txs
    .filter((t) => t.type === type && monthKey(t.date) === month)
    .reduce((acc, t) => acc + t.amount, 0)
}

function prevMonthKey(month: string): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return d.toISOString().slice(0, 7)
}

export function spendByCategory(txs: Transaction[], month: string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const t of txs) {
    if (t.type === 'expense' && monthKey(t.date) === month) {
      out[t.category] = (out[t.category] ?? 0) + t.amount
    }
  }
  return out
}

// Deterministic rule engine: budget pressure, MoM swings, concentration, savings rate, recurring load.
export function buildInsights(state: State): Insight[] {
  const month = currentMonthKey()
  const prev = prevMonthKey(month)
  const insights: Insight[] = []
  const spent = spendByCategory(state.transactions, month)
  const prevSpent = spendByCategory(state.transactions, prev)
  const totalSpent = Object.values(spent).reduce((a, b) => a + b, 0)
  const income = sumBy(state.transactions, month, 'income')

  for (const b of state.budgets) {
    const used = spent[b.category] ?? 0
    if (b.limit <= 0) continue
    const pct = used / b.limit
    if (pct >= 1) insights.push({ tone: 'bad', text: `${b.category} budget blown — ${Math.round(pct * 100)}% used.` })
    else if (pct >= 0.8) insights.push({ tone: 'warn', text: `${b.category} at ${Math.round(pct * 100)}% of budget. Ease off.` })
  }

  for (const [cat, amount] of Object.entries(spent)) {
    const before = prevSpent[cat] ?? 0
    if (before > 0 && amount > before * 1.5 && amount - before > 2000) {
      insights.push({ tone: 'warn', text: `${cat} up ${Math.round((amount / before - 1) * 100)}% vs last month.` })
    }
  }

  if (totalSpent > 0) {
    const [topCat, topAmt] = Object.entries(spent).sort((a, b) => b[1] - a[1])[0]
    if (topAmt / totalSpent > 0.4) {
      insights.push({ tone: 'info', text: `${topCat} = ${Math.round((topAmt / totalSpent) * 100)}% of spending. Top lever to cut.` })
    }
  }

  if (income > 0) {
    const rate = (income - totalSpent) / income
    if (rate >= 0.2) insights.push({ tone: 'good', text: `Saving ${Math.round(rate * 100)}% of income this month. Strong.` })
    else if (rate < 0) insights.push({ tone: 'bad', text: `Spending exceeds income by ${Math.round(-rate * 100)}%.` })
    else insights.push({ tone: 'info', text: `Saving ${Math.round(rate * 100)}% of income. Target: 20%.` })
  }

  const recurring = state.transactions.filter((t) => t.recurring && t.type === 'expense' && monthKey(t.date) === month)
  const recurringTotal = recurring.reduce((a, t) => a + t.amount, 0)
  if (recurringTotal > 0 && totalSpent > 0 && recurringTotal / totalSpent > 0.5) {
    insights.push({ tone: 'warn', text: `Recurring charges = ${Math.round((recurringTotal / totalSpent) * 100)}% of spend. Audit subscriptions.` })
  }

  if (insights.length === 0) insights.push({ tone: 'info', text: 'Add transactions to unlock insights.' })
  return insights
}
