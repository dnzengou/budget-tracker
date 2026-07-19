import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import type { Budget, Member, Settings, State, Transaction } from '@/types'

const STORAGE_KEY = 'nestegg-v1'

const DEFAULT_SETTINGS: Settings = {
  mode: 'individual',
  currency: 'USD',
  monthStartDay: 1,
  onboarded: false,
}

const EMPTY: State = { 
  settings: DEFAULT_SETTINGS, 
  members: [], 
  transactions: [], 
  budgets: [],
  auth: { isLoggedIn: false, isAdmin: false }
}

type Action =
  | { kind: 'onboard'; settings: Settings; members: Member[] }
  | { kind: 'addTx'; tx: Transaction }
  | { kind: 'deleteTx'; id: string }
  | { kind: 'setBudget'; budget: Budget }
  | { kind: 'removeBudget'; category: string }
  | { kind: 'addMember'; member: Member }
  | { kind: 'importTx'; txs: Transaction[] }
  | { kind: 'reset' }
  | { kind: 'login'; isAdmin: boolean; username?: string }
  | { kind: 'logout' }

function reducer(state: State, action: Action): State {
  switch (action.kind) {
    case 'onboard':
      return { 
        ...state, 
        settings: action.settings, 
        members: action.members,
        auth: state.auth || { isLoggedIn: false, isAdmin: false }
      }
    case 'addTx':
      return { ...state, transactions: [action.tx, ...state.transactions], auth: state.auth }
    case 'deleteTx':
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.id), auth: state.auth }
    case 'setBudget': {
      const rest = state.budgets.filter((b) => b.category !== action.budget.category)
      return { ...state, budgets: [...rest, action.budget], auth: state.auth }
    }
    case 'removeBudget':
      return { ...state, budgets: state.budgets.filter((b) => b.category !== action.category), auth: state.auth }
    case 'addMember':
      return { ...state, members: [...state.members, action.member], auth: state.auth }
    case 'importTx':
      return { ...state, transactions: [...action.txs, ...state.transactions], auth: state.auth }
    case 'reset':
      return EMPTY
    case 'login':
      return { ...state, auth: { isLoggedIn: true, isAdmin: action.isAdmin, username: action.username } }
    case 'logout':
      return { ...state, auth: { isLoggedIn: false, isAdmin: false } }
  }
}

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = JSON.parse(raw)
    // Ensure auth
    if (!parsed.auth) {
      parsed.auth = { isLoggedIn: false, isAdmin: false }
    }
    return { ...EMPTY, ...parsed }
  } catch {
    return EMPTY // corrupted storage → start clean rather than crash
  }
}

const StoreContext = createContext<{ state: State; dispatch: React.Dispatch<Action> } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])
  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore outside provider')
  return ctx
}

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const MEMBER_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
