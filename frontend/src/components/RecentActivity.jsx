import { Wrench, Printer, Clock, CheckCircle, AlertTriangle, Loader } from 'lucide-react'
import { cn } from '../lib/utils'

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  'in-progress': { icon: Loader, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  completed: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  cancelled: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  active: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  inactive: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' },
  maintenance: { icon: Loader, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  retired: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
}

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

export default function RecentActivity({ activities = [] }) {
  return (
    <div className="bg-card border rounded-xl p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Live Feed</h3>
          <h2 className="text-lg font-bold">Recent Activity</h2>
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{activities.length} events</span>
      </div>

      {activities.length === 0 ? (
        <div className="flex items-center justify-center h-[200px] text-muted-foreground/60">No recent activity</div>
      ) : (
        <div className="space-y-0">
          {activities.map((activity, i) => {
            const cfg = statusConfig[activity.status] || { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' }
            const Icon = activity.type === 'printer' ? Printer : Wrench

            return (
              <div
                key={`${activity.type}-${activity.id}`}
                className={cn(
                  'flex items-start gap-4 py-3',
                  i < activities.length - 1 && 'border-b border-border/50'
                )}
              >
                <div className={cn('p-2 rounded-lg flex-shrink-0', cfg.bg)}>
                  <Icon className={cn('h-4 w-4', cfg.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activity.description}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0 pt-0.5">{timeAgo(activity.date)}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
