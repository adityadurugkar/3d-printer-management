import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Printer, Wrench, Package, Users, Clock, AlertTriangle, Activity,
  CheckCircle, Cpu, Download, ChevronDown, Zap, BarChart3, TrendingUp,
  Layers, Server, HardDrive, Thermometer,
} from 'lucide-react'
import { exportAPI, printerAPI, repairAPI, inventoryAPI, technicianAPI } from '../api'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import AnimatedCounter from '../components/AnimatedCounter'
import RepairChart from '../components/charts/RepairChart'
import PrinterChart from '../components/charts/PrinterChart'
import PrintersByTypeChart from '../components/charts/PrintersByTypeChart'
import MonthlyRepairsChart from '../components/charts/MonthlyRepairsChart'
import InventoryStockChart from '../components/charts/InventoryStockChart'
import TechnicianWorkloadChart from '../components/charts/TechnicianWorkloadChart'
import RecentActivity from '../components/RecentActivity'
import RepairAvgTimeChart from '../components/charts/RepairAvgTimeChart'
import PrinterMonitorCard from '../components/PrinterMonitorCard'
import { cn } from '../lib/utils'
import { motion } from 'framer-motion'

const statCards = [
  { key: 'totalPrinters', label: 'Total Printers', icon: Server, color: 'text-cyan-400', bg: 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/20' },
  { key: 'activePrinters', label: 'Active Printers', icon: Activity, color: 'text-emerald-400', bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/20' },
  { key: 'activeRepairs', label: 'Under Repair', icon: Wrench, color: 'text-rose-400', bg: 'bg-gradient-to-br from-rose-500/20 to-rose-600/10', border: 'border-rose-500/20' },
  { key: 'pendingRepairs', label: 'Pending Repairs', icon: Clock, color: 'text-amber-400', bg: 'bg-gradient-to-br from-amber-500/20 to-amber-600/10', border: 'border-amber-500/20' },
  { key: 'lowStockItems', label: 'Inventory Alerts', icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-gradient-to-br from-orange-500/20 to-orange-600/10', border: 'border-orange-500/20' },
  { key: 'totalTechnicians', label: 'Active Technicians', icon: Users, color: 'text-indigo-400', bg: 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/10', border: 'border-indigo-500/20' },
]

const statusColors = {
  active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  idle: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  inactive: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  offline: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
  maintenance: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  retired: 'text-red-400 bg-red-500/10 border-red-500/20',
}

const exportResources = [
  { resource: 'printers', label: 'Printers' },
  { resource: 'repairs', label: 'Repairs' },
  { resource: 'inventory', label: 'Inventory' },
  { resource: 'spare-parts', label: 'Spare Parts' },
  { resource: 'technicians', label: 'Technicians' },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [printers, setPrinters] = useState([])
  const [repairs, setRepairs] = useState([])
  const [inventory, setInventory] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    Promise.all([
      exportAPI.getDashboard(),
      printerAPI.getAll(),
      repairAPI.getAll(),
      inventoryAPI.getAll(),
      technicianAPI.getAll(),
    ]).then(([dashData, printersRes, repairsRes, invRes, techRes]) => {
      setStats(dashData.data)
      setPrinters(printersRes.data || [])
      setRepairs(repairsRes.data || [])
      setInventory(invRes.data || [])
      setTechnicians(techRes.data || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleExport = async (resource, format) => {
    setExporting(`${resource}-${format}`)
    try {
      const fn = format === 'pdf' ? exportAPI.downloadPDF : exportAPI.downloadExcel
      const { data } = await fn(resource)
      const url = window.URL.createObjectURL(new Blob([data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `${resource}-report.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch { /* ignore */ } finally {
      setExporting(null)
    }
  }

  const printerStatusCounts = useMemo(() => {
    const counts = { active: 0, idle: 0, maintenance: 0, repair: 0, offline: 0, inactive: 0 }
    printers.forEach(p => {
      if (p.status === 'active') counts.active++
      else if (p.status === 'inactive' || p.status === 'idle') counts.idle++
      else if (p.status === 'maintenance') counts.maintenance++
      else if (p.status === 'repair') counts.repair++
      else counts.offline++
    })
    return counts
  }, [printers])

  const recentRepairs = useMemo(() =>
    [...repairs].sort((a, b) => new Date(b.repairDate || b.createdAt) - new Date(a.repairDate || a.createdAt)).slice(0, 8),
    [repairs]
  )

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center mx-auto mb-4 neon-glow">
          <Activity className="h-7 w-7 text-cyan-400 animate-pulse-soft" />
        </div>
        <p className="text-gray-700 dark:text-white/60 font-medium">Loading enterprise dashboard...</p>
        <p className="text-gray-500 dark:text-white/30 text-sm mt-1">Fetching real-time metrics</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 neon-glow">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-white/40">Real-time overview of your 3D printer fleet</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative inline-block">
            <Button variant="outline" size="sm" className="h-9 gap-2 pr-3 bg-card/50 border-border/60 text-gray-700 dark:text-white/70 hover:text-gray-900 dark:hover:text-white hover:bg-card/80">
              <Download className="h-3.5 w-3.5" />
              Export
              <ChevronDown className="h-3 w-3 text-gray-500 dark:text-white/40" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Quick Export */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap gap-2"
      >
        {exportResources.map(({ resource, label }) => (
          <div key={resource} className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => handleExport(resource, 'pdf')} disabled={exporting === `${resource}-pdf`} className="h-7 text-[11px] px-2.5 rounded-lg text-gray-600 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
              PDF {label}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleExport(resource, 'xlsx')} disabled={exporting === `${resource}-xlsx`} className="h-7 text-[11px] px-2.5 rounded-lg text-gray-600 dark:text-white/40 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
              Excel {label}
            </Button>
          </div>
        ))}
      </motion.div>

      {/* KPI Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
        >
          {statCards.map(({ key, label, icon: Icon, color, bg, border }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
              className="glass-card-hover rounded-2xl p-4"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1.5">
                  <p className="text-xs text-gray-600 dark:text-white/50 font-medium">{label}</p>
                  <p className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                    <AnimatedCounter value={stats[key] || 0} />
                  </p>
                </div>
                <div className={cn('p-2.5 rounded-xl', bg, border, 'border')}>
                  <Icon className={cn('h-4 w-4', color)} />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left: Printer Monitoring Cards */}
        <div className="xl:col-span-3 space-y-6">
          {/* Section Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Printer Fleet Monitor</h2>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs text-gray-600 dark:text-white/40 hover:text-gray-900 dark:hover:text-white h-7">
              <Link to="/printers">View All Printers</Link>
            </Button>
          </div>

          {/* Printer Cards Grid */}
          {printers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {printers.slice(0, 6).map((p, i) => (
                <PrinterMonitorCard key={p._id} printer={p} index={i} />
              ))}
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center">
              <Printer className="h-10 w-10 mx-auto mb-3 text-gray-400 dark:text-white/20" />
              <p className="text-gray-600 dark:text-white/40 text-sm">No printers registered yet</p>
            </div>
          )}

          {/* Analytics Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Live Analytics</h2>
            </div>

            {/* Charts Row 1 */}
            {stats && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[
                  { comp: PrinterChart, data: stats.printersByBrand, delay: 0.1 },
                  { comp: PrintersByTypeChart, data: stats.printersByModel, delay: 0.15 },
                  { comp: RepairChart, data: stats.repairsByStatus, delay: 0.2 },
                ].map(({ comp: Comp, data, delay }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay }}
                    className="glass-card rounded-2xl"
                  >
                    <Comp data={data} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Charts Row 2 */}
            {stats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[
                  { comp: MonthlyRepairsChart, data: stats.monthlyRepairs, delay: 0.2 },
                  { comp: InventoryStockChart, data: stats.inventoryItems, delay: 0.25 },
                ].map(({ comp: Comp, data, delay }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay }}
                    className="glass-card rounded-2xl"
                  >
                    <Comp data={data} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Charts Row 3 */}
            {stats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[
                  { comp: TechnicianWorkloadChart, data: stats.technicianWorkload, delay: 0.3 },
                  { comp: RepairAvgTimeChart, data: stats.avgTechnicianRepairTime, delay: 0.35 },
                ].map(({ comp: Comp, data, delay }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay }}
                    className="glass-card rounded-2xl"
                  >
                    <Comp data={data} />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Repair Timeline Section */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="h-4 w-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Repairs</h3>
              </div>
              <div className="space-y-0">
                {recentRepairs.length > 0 ? recentRepairs.map((r, i) => (
                  <div
                    key={r._id}
                    className={cn(
                      'flex items-center gap-4 py-3',
                      i < recentRepairs.length - 1 && 'border-b border-gray-200 dark:border-white/[0.04]'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      r.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                      r.status === 'in-progress' ? 'bg-blue-500/10 text-blue-400' :
                      r.status === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-gray-500/10 text-gray-400'
                    )}>
                      {r.status === 'completed' ? <CheckCircle className="h-4 w-4" /> :
                       r.status === 'in-progress' ? <Activity className="h-4 w-4" /> :
                       <Clock className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-white/80 truncate">{r.printerName || 'Unknown Printer'}</p>
                      <p className="text-xs text-gray-600 dark:text-white/40">{r.technicianName || 'Unassigned'} • {r.totalHours ? `${r.totalHours.toFixed(1)}h` : '—'}</p>
                    </div>
                    <Badge variant={
                      r.status === 'completed' ? 'success' :
                      r.status === 'in-progress' ? 'info' :
                      r.status === 'pending' ? 'warning' : 'secondary'
                    } className="text-[10px] px-2 py-0.5">
                      {r.status}
                    </Badge>
                  </div>
                )) : (
                  <p className="text-sm text-gray-500 dark:text-white/30 text-center py-6">No recent repairs</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: System Overview */}
        <div className="space-y-4">
          {/* System Overview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-4 w-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">System Overview</h3>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Total Printers', value: printerStatusCounts.active + printerStatusCounts.idle + printerStatusCounts.maintenance + printerStatusCounts.offline, color: 'text-gray-900 dark:text-white', bar: 'bg-gradient-to-r from-cyan-400 to-cyan-500' },
                { label: 'Printing', value: printerStatusCounts.active, color: 'text-emerald-400', bar: 'bg-gradient-to-r from-emerald-400 to-emerald-500' },
                { label: 'Idle', value: printerStatusCounts.idle, color: 'text-blue-400', bar: 'bg-gradient-to-r from-blue-400 to-blue-500' },
                { label: 'Under Repair', value: printerStatusCounts.repair, color: 'text-rose-400', bar: 'bg-gradient-to-r from-rose-400 to-rose-500' },
                { label: 'Maintenance', value: printerStatusCounts.maintenance, color: 'text-purple-400', bar: 'bg-gradient-to-r from-purple-400 to-purple-500' },
                { label: 'Inventory Alerts', value: stats?.lowStockItems || 0, color: 'text-orange-400', bar: 'bg-gradient-to-r from-orange-400 to-orange-500' },
              ].map(({ label, value, color, bar }) => {
                const total = printerStatusCounts.active + printerStatusCounts.idle + printerStatusCounts.maintenance + printerStatusCounts.offline
                const pct = total > 0 ? Math.round((value / total) * 100) : 0
                return (
                  <div key={label}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gray-600 dark:text-white/50">{label}</span>
                      <span className={cn('font-semibold', color)}>{value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-200 dark:bg-white/[0.06] overflow-hidden">
                      <div className={cn('h-full rounded-full transition-all duration-700', bar)} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" asChild className="bg-black/[0.03] dark:bg-white/[0.03] border-gray-300 dark:border-white/[0.08] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:border-gray-400 dark:hover:border-white/20 text-gray-700 dark:text-white/60 hover:text-gray-900 dark:hover:text-white text-xs h-9">
                <Link to="/printers/new"><Printer className="h-3.5 w-3.5 mr-1.5" />Add Printer</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="bg-black/[0.03] dark:bg-white/[0.03] border-gray-300 dark:border-white/[0.08] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:border-gray-400 dark:hover:border-white/20 text-gray-700 dark:text-white/60 hover:text-gray-900 dark:hover:text-white text-xs h-9">
                <Link to="/repairs/new"><Wrench className="h-3.5 w-3.5 mr-1.5" />New Repair</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="bg-black/[0.03] dark:bg-white/[0.03] border-gray-300 dark:border-white/[0.08] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:border-gray-400 dark:hover:border-white/20 text-gray-700 dark:text-white/60 hover:text-gray-900 dark:hover:text-white text-xs h-9">
                <Link to="/inventory/new"><Package className="h-3.5 w-3.5 mr-1.5" />Add Part</Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="bg-black/[0.03] dark:bg-white/[0.03] border-gray-300 dark:border-white/[0.08] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:border-gray-400 dark:hover:border-white/20 text-gray-700 dark:text-white/60 hover:text-gray-900 dark:hover:text-white text-xs h-9">
                <Link to="/technicians/new"><Users className="h-3.5 w-3.5 mr-1.5" />Add Tech</Link>
              </Button>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {stats && <RecentActivity activities={stats.recentActivity} />}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
