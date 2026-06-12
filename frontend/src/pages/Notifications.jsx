import { useState, useEffect, useContext } from 'react'
import { Bell, CheckCheck, Wrench, Printer, Package, Users } from 'lucide-react'
import { SocketContext } from '../context/SocketContext'
import { Button } from '../components/ui/button'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'

const typeConfig = {
  printer_created: { icon: Printer, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'New Printer' },
  printer_updated: { icon: Printer, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Printer Updated' },
  repair_started: { icon: Wrench, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Repair Started' },
  repair_completed: { icon: Wrench, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Repair Completed' },
  inventory_low: { icon: Package, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Low Stock' },
  inventory_out: { icon: Package, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Out of Stock' },
  technician_assigned: { icon: Users, color: 'text-indigo-400', bg: 'bg-indigo-500/10', label: 'Technician' },
}

export default function Notifications() {
  const { notifications, markAllAsRead } = useContext(SocketContext)
  const [localNotifs, setLocalNotifs] = useState([])

  useEffect(() => {
    setLocalNotifs(notifications || [])
  }, [notifications])

  const markAllRead = () => {
    markAllAsRead()
    setLocalNotifs([])
  }

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Notifications</h1>
              <p className="text-sm text-white/40">System alerts and updates</p>
            </div>
          </div>
          {localNotifs.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllRead}
              className="text-xs text-white/40 hover:text-white h-8"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1.5" />
              Mark All Read
            </Button>
          )}
        </div>
      </motion.div>

      <div className="glass-card rounded-2xl overflow-hidden">
        {localNotifs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/30">
            <Bell className="h-12 w-12 mb-3 opacity-30" />
            <p className="font-medium text-sm">No notifications</p>
            <p className="text-xs mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {localNotifs.map((notif, i) => {
              const cfg = typeConfig[notif.type] || { icon: Bell, color: 'text-white/50', bg: 'bg-white/[0.04]', label: 'Notification' }
              const Ic = cfg.icon
              return (
                <motion.div
                  key={notif._id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className={cn('p-2 rounded-xl flex-shrink-0', cfg.bg)}>
                    <Ic className={cn('h-4 w-4', cfg.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">{cfg.label}</span>
                      {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                    </div>
                    <p className="text-sm font-medium text-white/80 mt-0.5">{notif.title || notif.message}</p>
                    <p className="text-xs text-white/40 mt-0.5">{notif.description || ''}</p>
                  </div>
                  <span className="text-[11px] text-white/30 flex-shrink-0">
                    {notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : ''}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
