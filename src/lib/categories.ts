// Keyword rules give instant auto-categorization; user overrides teach nothing (local-only, deterministic).
export const EXPENSE_CATEGORIES = [
  'Groceries', 'Dining', 'Housing', 'Utilities', 'Transport', 'Health',
  'Entertainment', 'Shopping', 'Kids', 'Travel', 'Subscriptions', 'Other',
] as const

export const INCOME_CATEGORIES = ['Salary', 'Side Income', 'Refund', 'Gift', 'Other Income'] as const

const KEYWORDS: Record<string, string[]> = {
  Groceries: ['grocery', 'supermarket', 'market', 'walmart', 'costco', 'tesco', 'aldi', 'lidl', 'kroger', 'trader', 'whole foods', 'spar', 'carrefour'],
  Dining: ['restaurant', 'cafe', 'coffee', 'starbucks', 'pizza', 'burger', 'sushi', 'bar', 'takeout', 'delivery', 'mcdonald', 'kfc', 'bakery', 'lunch', 'dinner'],
  Housing: ['rent', 'mortgage', 'landlord', 'hoa', 'property'],
  Utilities: ['electric', 'water', 'gas bill', 'internet', 'wifi', 'phone bill', 'utility', 'heating', 'broadband'],
  Transport: ['uber', 'lyft', 'taxi', 'fuel', 'petrol', 'gas station', 'parking', 'metro', 'bus', 'train', 'transit', 'toll'],
  Health: ['pharmacy', 'doctor', 'dentist', 'hospital', 'clinic', 'medicine', 'gym', 'fitness', 'therapy'],
  Entertainment: ['movie', 'cinema', 'concert', 'game', 'spotify', 'netflix', 'ticket', 'hobby', 'bowling'],
  Shopping: ['amazon', 'clothes', 'shoes', 'mall', 'ikea', 'electronics', 'zara', 'h&m', 'shein', 'ebay'],
  Kids: ['daycare', 'school', 'toy', 'kids', 'baby', 'diaper', 'tuition', 'nanny'],
  Travel: ['flight', 'hotel', 'airbnb', 'booking', 'airline', 'trip', 'vacation', 'resort'],
  Subscriptions: ['subscription', 'membership', 'icloud', 'youtube premium', 'patreon', 'chatgpt', 'software', 'saas'],
  Salary: ['salary', 'paycheck', 'wage', 'payroll', 'income'],
  'Side Income': ['freelance', 'side', 'commission', 'bonus', 'dividend'],
  Refund: ['refund', 'reimbursement', 'cashback'],
  Gift: ['gift', 'birthday money'],
}

const INCOME_SET = new Set<string>(INCOME_CATEGORIES)

export function autoCategorize(note: string, type: 'expense' | 'income'): string {
  const text = note.toLowerCase()
  let best = ''
  let bestHits = 0
  for (const [category, words] of Object.entries(KEYWORDS)) {
    // A note like "salary refund" (an expense reimbursement) must not match income
    // keywords, and vice versa — matched categories must belong to the tx type.
    const isIncome = INCOME_SET.has(category)
    if (type === 'income' ? !isIncome : isIncome) continue
    const hits = words.filter((w) => text.includes(w)).length
    if (hits > bestHits) {
      bestHits = hits
      best = category
    }
  }
  if (best) return best
  return type === 'expense' ? 'Other' : 'Other Income'
}

export const CATEGORY_EMOJI: Record<string, string> = {
  Groceries: '🛒', Dining: '🍽️', Housing: '🏠', Utilities: '💡', Transport: '🚗',
  Health: '💊', Entertainment: '🎬', Shopping: '🛍️', Kids: '🧸', Travel: '✈️',
  Subscriptions: '🔁', Other: '📦', Salary: '💼', 'Side Income': '💸',
  Refund: '↩️', Gift: '🎁', 'Other Income': '💰',
}
