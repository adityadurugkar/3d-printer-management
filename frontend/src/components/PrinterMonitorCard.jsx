import { motion } from 'framer-motion'
import { Printer, MapPin, Clock, Activity } from 'lucide-react'
import { cn } from '../lib/utils'

const statusConfig = {
  active: { label: 'Printing', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'status-dot-active', progress: 'bg-gradient-to-r from-emerald-400 to-emerald-500' },
  idle: { label: 'Idle', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', dot: 'status-dot-idle', progress: 'bg-gradient-to-r from-blue-400 to-blue-500' },
  offline: { label: 'Offline', color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/30', dot: 'status-dot-offline', progress: 'bg-gradient-to-r from-gray-400 to-gray-500' },
  maintenance: { label: 'Maintenance', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', dot: 'status-dot-maintenance', progress: 'bg-gradient-to-r from-purple-400 to-purple-500' },
  repair: { label: 'Repair', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'status-dot-repair', progress: 'bg-gradient-to-r from-red-400 to-red-500' },
}

export default function PrinterMonitorCard({ printer, index = 0 }) {
  const status = statusConfig[printer.status] || statusConfig.offline
  const progress = printer.status === 'active' ? Math.floor(Math.random() * 60) + 20 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="printer-card group"
    >
      {/* Header */}
      <div className="relative p-4 pb-3">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', status.bg, status.border, 'border')}>
              <Printer className={cn('h-5 w-5', status.color)} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors">{printer.name}</h3>
              <p className="text-xs text-gray-600 dark:text-white/40 font-mono">#{printer.serialNumber || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('status-dot', status.dot)} />
            <span className={cn('text-[11px] font-semibold uppercase tracking-wider', status.color)}>{status.label}</span>
          </div>
        </div>

        {/* Location */}
        {printer.location && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-white/40 mb-2">
            <MapPin className="h-3 w-3" />
            <span>{printer.location}</span>
          </div>
        )}

        {/* Progress Bar */}
        {printer.status === 'active' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 dark:text-white/50 flex items-center gap-1">
                <Activity className="h-3 w-3" />
                In Progress
              </span>
              <span className="text-gray-700 dark:text-white/70 font-medium">{progress}%</span>
            </div>
            <div className="progress-bar">
              <div
                className={cn('progress-bar-fill', status.progress)}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer info */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-white/[0.06]">
            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-white/30">
            <Clock className="h-3 w-3" />
            <span>ID: {printer._id?.slice(-6) || 'N/A'}</span>
          </div>
          {printer.status === 'active' && (
            <span className="text-[11px] text-emerald-400/70 font-medium">~{Math.floor(Math.random() * 4) + 1}h remaining</span>
          )}
        </div>
      </div>

      {/* Hover gradient effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </motion.div>
  )
}
