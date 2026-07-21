import { useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, Trash2, Upload } from 'lucide-react'
import { CATEGORY_EMOJI } from '@/lib/categories'
import { download, fromCSV, toCSV } from '@/lib/csv'
import { fmt } from '@/lib/money'
import { useStore } from '@/lib/store'

export default function Transactions() {
  const { state, dispatch } = useStore()
  const [query, setQuery] = useState('')
  const [memberFilter, setMemberFilter] = useState('all')
  const fileRef = useRef<HTMLInputElement>(null)
  const currency = state.settings.currency

  const memberName = (id: string) => state.members.find((m) => m.id === id)?.name ?? '—'
  const memberColor = (id: string) => state.members.find((m) => m.id === id)?.color ?? '#888'

  const rows = useMemo(() => {
    const q = query.toLowerCase()
    return state.transactions
      .filter((t) => memberFilter === 'all' || t.memberId === memberFilter)
      .filter((t) => !q || t.note.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [state.transactions, query, memberFilter])

  const [importError, setImportError] = useState<string | null>(null)

  const importFile = async (file: File) => {
    setImportError(null)
    try {
      const text = await file.text()
      const txs = fromCSV(text, state.members[0]?.id ?? '')
      if (!txs.length) {
        setImportError('No valid rows found. Expected header: date,type,amount,category,note')
        return
      }
      dispatch({ kind: 'importTx', txs })
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed. Please check the CSV format.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Input className="max-w-xs" placeholder="Search notes or categories…" value={query} onChange={(e) => setQuery(e.target.value)} />
        {state.members.length > 1 && (
          <Select value={memberFilter} onValueChange={setMemberFilter}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Everyone</SelectItem>
              {state.members.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => download('nestegg-transactions.csv', toCSV(rows, memberName))}>
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" /> Import
          </Button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) void importFile(f); e.target.value = '' }} />
        </div>
      </div>

      {importError && (
        <div className="text-sm text-destructive px-1" role="alert">{importError}</div>
      )}

      <Card>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No transactions. Hit <b>Add</b> above, or import a CSV (date,type,amount,category,note).
            </div>
          ) : (
            <ul className="divide-y">
              {rows.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-xl w-8 text-center">{CATEGORY_EMOJI[t.category] ?? '📦'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{t.note || t.category}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{t.date}</span>
                      <span>{t.category}</span>
                      {t.recurring && <span>🔁</span>}
                      {state.members.length > 1 && (
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full" style={{ background: memberColor(t.memberId) }} />
                          {memberName(t.memberId)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`tabular-nums font-semibold ${t.type === 'income' ? 'text-emerald-600' : ''}`}>
                    {t.type === 'income' ? '+' : '−'}{fmt(t.amount, currency)}
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => dispatch({ kind: 'deleteTx', id: t.id })}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
