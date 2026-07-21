export const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL']

export function fmt(cents: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

export function toCents(value: string): number {
  const parsed = parseFloat(value.replace(',', '.'))
  if (isNaN(parsed)) return 0
  return Math.round(parsed * 100)
}

export function monthKey(date: string): string {
  return date.slice(0, 7) // YYYY-MM
}

// Local-time keys everywhere: `toISOString()` shifts to UTC, so users west of
// UTC saw next month's totals late in the evening and lost data on rollovers.
export function currentMonthKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
