import { useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react'
import { buildInsights, type Insight } from '@/lib/insights'
import { useStore } from '@/lib/store'

const ICONS: Record<Insight['tone'], React.ReactNode> = {
  good: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  warn: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  bad: <XCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
}

export default function Insights() {
  const { state } = useStore()
  const insights = useMemo(() => buildInsights(state), [state])
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Rule-based analysis of this month vs last — budgets, trends, savings rate, recurring load. Runs fully on-device.
      </p>
      {insights.map((insight, i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-3 py-4">
            {ICONS[insight.tone]}
            <span>{insight.text}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
