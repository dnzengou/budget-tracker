import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TrendingDown, TrendingUp, Wallet, PiggyBank } from 'lucide-react'
import { CATEGORY_EMOJI } from '@/lib/categories'
import { spendByCategory } from '@/lib/insights'
import { currentMonthKey, fmt, monthKey } from '@/lib/money'
import { useStore } from '@/lib/store'

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16', '#06b6d4', '#a855f7']

export default function Dashboard() {
  const { state } = useStore()
  const currency = state.settings.currency
  const month = currentMonthKey()

  const { income, spent, byMember, trend, pie } = useMemo(() => {
    const txs = state.transactions
    const income = txs.filter((t) => t.type === 'income' && monthKey(t.date) === month).reduce((a, t) => a + t.amount, 0)
    const spent = txs.filter((t) => t.type === 'expense' && monthKey(t.date) === month).reduce((a, t) => a + t.amount, 0)

    const byMember = state.members.map((m) => ({
      ...m,
      total: txs.filter((t) => t.type === 'expense' && t.memberId === m.id && monthKey(t.date) === month).reduce((a, t) => a + t.amount, 0),
    }))

    // Last 6 months income vs expense bars — local time so month boundaries
    // align with what the user actually sees on their calendar.
    const trend = Array.from({ length: 6 }, (_, i) => {
      const d = new Date()
      d.setMonth(d.getMonth() - (5 - i))
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      return {
        name: d.toLocaleString(undefined, { month: 'short' }),
        income: txs.filter((t) => t.type === 'income' && monthKey(t.date) === key).reduce((a, t) => a + t.amount, 0) / 100,
        expense: txs.filter((t) => t.type === 'expense' && monthKey(t.date) === key).reduce((a, t) => a + t.amount, 0) / 100,
      }
    })

    const cats = spendByCategory(txs, month)
    const pie = Object.entries(cats).map(([name, value]) => ({ name, value: value / 100 })).sort((a, b) => b.value - a.value)
    return { income, spent, byMember, trend, pie }
  }, [state.transactions, state.members, month])

  const net = income - spent
  const stat = (title: string, value: string, icon: React.ReactNode, tone?: string) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent><div className={`text-2xl font-bold ${tone ?? ''}`}>{value}</div></CardContent>
    </Card>
  )

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stat('Income', fmt(income, currency), <TrendingUp className="h-4 w-4 text-emerald-500" />, 'text-emerald-600')}
        {stat('Spending', fmt(spent, currency), <TrendingDown className="h-4 w-4 text-red-500" />, 'text-red-600')}
        {stat('Net', fmt(net, currency), <Wallet className="h-4 w-4 text-muted-foreground" />, net >= 0 ? 'text-emerald-600' : 'text-red-600')}
        {stat('Savings rate', income > 0 ? `${Math.round((net / income) * 100)}%` : '—', <PiggyBank className="h-4 w-4 text-muted-foreground" />)}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">6-month flow</CardTitle></CardHeader>
          <CardContent className="h-64">
            {state.transactions.length === 0 ? <Empty /> : (
              <ResponsiveContainer>
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip formatter={(v) => fmt(Number(v) * 100, currency)} />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Spending by category</CardTitle></CardHeader>
          <CardContent className="h-64">
            {pie.length === 0 ? <Empty /> : (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pie} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={2}
                    label={({ name }) => `${CATEGORY_EMOJI[name] ?? ''} ${name}`}>
                    {pie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(Number(v) * 100, currency)} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {state.members.length > 1 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Per person this month</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {byMember.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ background: m.color }} />
                <span className="flex-1 font-medium">{m.name}</span>
                <span className="tabular-nums">{fmt(m.total, currency)}</span>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {spent > 0 ? `${Math.round((m.total / spent) * 100)}%` : '—'}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Empty() {
  return <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data yet — add a transaction.</div>
}
