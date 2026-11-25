import { HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import GuideContent from '@/components/GuideContent'

export default function HelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open help guide">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>How NestEgg works</DialogTitle>
          <DialogDescription>
            A six-point tour of what the app does and how your data is handled.
          </DialogDescription>
        </DialogHeader>
        <GuideContent />
        <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground leading-relaxed">
          <strong>Quick tips.</strong> Click <em>+ Add</em> to log a transaction. Switch tabs
          along the top to jump between Dashboard, Transactions, Budgets, and Insights. The
          <em> 🔑 </em> icon shows the login passwords so admins can share guest access. The
          <em> ↺ </em> icon wipes all data for this browser. Export your data as CSV at any
          time from the Transactions tab.
        </div>
      </DialogContent>
    </Dialog>
  )
}
