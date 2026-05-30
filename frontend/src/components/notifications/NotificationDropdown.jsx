import { Printer, Wrench, Package, Users, AlertTriangle, CheckCircle, Clock, Bell } from 'lucide-react'
import { useSocket } from '../../context/SocketContext'
import { cn } from '../../lib/utils'

const typeConfig = {
  printer_added: { icon: Printer, color: 'text-violet-500', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  printer_updated: { icon: Printer, color: 'text-indigo-500', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  repair_created: { icon: Wrench, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  repair_completed: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  low_inventory: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
  technician_assigned: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
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

export default function NotificationDropdown({ onClose }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useSocket()

  return (
    <div className="bg-card border border-border/50 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-muted/20">
        <div>
          <p className="text-sm font-bold text-foreground">Notifications</p>
          <p className="text-[11px] text-muted-foreground">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[360px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Bell className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm font-medium text-foreground/50">No notifications yet</p>
            <p className="text-xs text-muted-foreground/50 mt-1">New notifications will appear here</p>
          </div>
        ) : (
          notifications.slice(0, 20).map((n) => {
            const cfg = typeConfig[n.type] || { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' }
            const Icon = cfg.icon

            return (
              <div
                key={n._id}
                className={cn(
                  'flex items-start gap-3 px-4 py-3 border-b border-border/20 transition-colors cursor-pointer',
                  n.read ? 'hover:bg-muted/30' : 'bg-primary/[0.03] hover:bg-primary/[0.06]'
                )}
                onClick={() => { if (!n.read) markAsRead(n._id); onClose?.() }}
              >
                <div className={cn('p-2 rounded-xl flex-shrink-0', cfg.bg)}>
                  <Icon className={cn('h-3.5 w-3.5', cfg.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm', n.read ? 'text-foreground/80' : 'font-semibold text-foreground')}>
                    {n.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2 shadow-sm shadow-primary/30" />
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
