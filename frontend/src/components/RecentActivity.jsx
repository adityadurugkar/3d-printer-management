import { useState, useEffect, useRef } from 'react'
import { Wrench, Printer, Clock, CheckCircle, AlertTriangle, Loader, Package, RefreshCw } from 'lucide-react'
import { cn } from '../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  'in-progress': { icon: Loader, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  completed: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  cancelled: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
  active: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  inactive: { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-500/10' },
  maintenance: { icon: Loader, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  retired: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10' },
  'in-stock': { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  'low-stock': { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  'out-of-stock': { icon: Package, color: 'text-red-400', bg: 'bg-red-500/10' },
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
  const [liveActivities, setLiveActivities] = useState(activities)
  const [refreshing, setRefreshing] = useState(false)
  const prevCountRef = useRef(activities.length)

  useEffect(() => {
    setLiveActivities(activities)
  }, [activities])

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true)
      setTimeout(() => setRefreshing(false), 1000)
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    const newActivity = {
      type: ['printer', 'repair', 'sparepart'][Math.floor(Math.random() * 3)],
      id: Date.now().toString(),
      title: 'System refreshed',
      description: 'Activity feed updated',
      status: 'completed',
      date: new Date().toISOString(),
    }
    setLiveActivities(prev => [newActivity, ...prev].slice(0, 20))
    setTimeout(() => setRefreshing(false), 600)
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[11px] font-semibold text-gray-600 dark:text-white/40 uppercase tracking-wider mb-1">Live Feed</h3>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-gray-500 dark:text-white/30 bg-gray-100 dark:bg-white/[0.04] px-2.5 py-1 rounded-full font-medium">
            {liveActivities.length} events
          </span>
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg text-gray-500 dark:text-white/30 hover:text-gray-800 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all"
          >
            <RefreshCw className={cn('h-3.5 w-3.5 transition-transform', refreshing && 'animate-spin')} />
          </button>
        </div>
      </div>

      {liveActivities.length === 0 ? (
        <div className="flex items-center justify-center h-[200px] text-gray-400 dark:text-white/20 text-sm">No recent activity</div>
      ) : (
        <div className="space-y-0 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar">
          <AnimatePresence initial={false}>
            {liveActivities.map((activity, i) => {
              const cfg = statusConfig[activity.status] || { icon: Clock, color: 'text-gray-400', bg: 'bg-gray-500/10' }
              const Ic = activity.type === 'printer' ? Printer : activity.type === 'sparepart' ? Package : Wrench

              return (
                <motion.div
                  key={`${activity.type}-${activity.id}`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'flex items-start gap-3 py-2.5',
                    i < liveActivities.length - 1 && 'border-b border-gray-200 dark:border-white/[0.04]'
                  )}
                >
                  <div className={cn('p-1.5 rounded-lg flex-shrink-0', cfg.bg)}>
                    <Ic className={cn('h-3.5 w-3.5', cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white/80 truncate">{activity.title}</p>
                    <p className="text-xs text-gray-600 dark:text-white/40 mt-0.5">{activity.description}</p>
                  </div>
                  <span className="text-[11px] text-gray-500 dark:text-white/30 flex-shrink-0 pt-0.5">{timeAgo(activity.date)}</span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
