import type { Transaction } from '@/types'
import { uid } from './store'

export function toCSV(txs: Transaction[], memberName: (id: string) => string): string {
  const header = 'date,type,amount,category,member,note,recurring'
  const rows = txs.map((t) =>
    [
      t.date, t.type, (t.amount / 100).toFixed(2), t.category,
      memberName(t.memberId),
      `"${t.note.replaceAll('"', '""')}"`,
      t.recurring ? 'yes' : 'no',
    ].join(','),
  )
  return [header, ...rows].join('\n')
}

export function download(filename: string, text: string) {
  const blob = new Blob([text], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// Expects header: date,type,amount,category,note. Unknown/missing fields get safe defaults.
export function fromCSV(text: string, memberId: string): Transaction[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []
  const txs: Transaction[] = []
  for (const line of lines.slice(1)) {
    const cols = line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''))
    const [date, type, amount, category, , note, recurring] = cols
    const cents = Math.round(parseFloat(amount) * 100)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(cents)) continue
    txs.push({
      id: uid(),
      date,
      type: type === 'income' ? 'income' : 'expense',
      amount: Math.abs(cents),
      category: category || 'Other',
      note: note ?? '',
      memberId,
      recurring: recurring === 'yes',
    })
  }
  return txs
}
