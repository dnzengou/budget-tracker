import { Lock, PiggyBank, FileSpreadsheet, LineChart, KeyRound, DownloadCloud } from 'lucide-react'

type Item = { icon: React.ElementType; title: string; body: string }

const ITEMS: Item[] = [
  {
    icon: Lock,
    title: 'Private by default',
    body: 'All data lives in this browser only (localStorage). No sign-up, no cloud, no telemetry. Clearing site data wipes everything.',
  },
  {
    icon: PiggyBank,
    title: 'Household-aware',
    body: 'Pick Individual, Couple, or Family. Each member is tagged on every transaction so you can see who spent what.',
  },
  {
    icon: LineChart,
    title: 'Smart dashboard',
    body: 'Income, spending, net, and savings-rate tiles; 6-month trend bars; category breakdown pie. Auto-categorized from note keywords.',
  },
  {
    icon: FileSpreadsheet,
    title: 'CSV in and out',
    body: 'Round-trip export and import — move your data between devices or back it up to a spreadsheet at any time.',
  },
  {
    icon: KeyRound,
    title: 'Admin vs Guest',
    body: 'Admin adds, edits, deletes. Guest is read-only — hand out the Guest password to let someone peek without touching your data.',
  },
  {
    icon: DownloadCloud,
    title: 'Install as a PWA',
    body: 'Use your browser’s Install button to add NestEgg to your home screen. It opens as its own window and keeps working offline.',
  },
]

export default function GuideContent() {
  return (
    <div className="space-y-3">
      {ITEMS.map(({ icon: Icon, title, body }) => (
        <div key={title} className="flex gap-3 items-start">
          <div className="rounded-md border p-2 bg-muted/40">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium leading-tight">{title}</div>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
