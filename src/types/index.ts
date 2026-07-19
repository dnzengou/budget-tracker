export type Mode = 'individual' | 'couple' | 'family'
export type TxType = 'expense' | 'income'

export interface Member {
  id: string
  name: string
  color: string
}

export interface Transaction {
  id: string
  type: TxType
  amount: number // cents
  category: string
  note: string
  date: string // YYYY-MM-DD
  memberId: string
  recurring: boolean
}

export interface Budget {
  category: string
  limit: number // cents per month
}

export interface Settings {
  mode: Mode
  currency: string
  monthStartDay: number
  onboarded: boolean
}

export interface State {
  settings: Settings
  members: Member[]
  transactions: Transaction[]
  budgets: Budget[]
  auth: {
    isLoggedIn: boolean
    isAdmin: boolean
    username?: string
  }
}
