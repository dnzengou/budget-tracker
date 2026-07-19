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

export function currentMonthKey(): string {
  return new Date().toISOString().slice(0, 7)
}
