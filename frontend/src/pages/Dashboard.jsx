import { useState, useEffect } from 'react'
import { Printer, Wrench, Package, Users, Clock, AlertTriangle, Activity, CheckCircle, Download, ChevronDown } from 'lucide-react'
import { exportAPI } from '../api'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import AnimatedCounter from '../components/AnimatedCounter'
import RepairChart from '../components/charts/RepairChart'
import PrinterChart from '../components/charts/PrinterChart'
import PrintersByTypeChart from '../components/charts/PrintersByTypeChart'
import MonthlyRepairsChart from '../components/charts/MonthlyRepairsChart'
import InventoryStockChart from '../components/charts/InventoryStockChart'
import TechnicianWorkloadChart from '../components/charts/TechnicianWorkloadChart'
import RecentActivity from '../components/RecentActivity'
import { cn } from '../lib/utils'

const statCards = [
  { key: 'totalPrinters', label: 'Total Printers', icon: Printer, color: 'text-violet-400', bg: 'bg-gradient-to-br from-violet-500/20 to-violet-600/10', border: 'border-violet-500/20' },
  { key: 'activePrinters', label: 'Active Printers', icon: Activity, color: 'text-emerald-400', bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/20' },
  { key: 'totalRepairs', label: 'Total Repairs', icon: Wrench, color: 'text-amber-400', bg: 'bg-gradient-to-br from-amber-500/20 to-amber-600/10', border: 'border-amber-500/20' },
  { key: 'pendingRepairs', label: 'Pending Repairs', icon: Clock, color: 'text-rose-400', bg: 'bg-gradient-to-br from-rose-500/20 to-rose-600/10', border: 'border-rose-500/20' },
  { key: 'completedRepairs', label: 'Completed Repairs', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/20' },
  { key: 'totalInventory', label: 'Inventory Items', icon: Package, color: 'text-blue-400', bg: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10', border: 'border-blue-500/20' },
  { key: 'lowStockItems', label: 'Low Stock Items', icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-gradient-to-br from-orange-500/20 to-orange-600/10', border: 'border-orange-500/20' },
  { key: 'totalTechnicians', label: 'Technicians', icon: Users, color: 'text-indigo-400', bg: 'bg-gradient-to-br from-indigo-500/20 to-indigo-600/10', border: 'border-indigo-500/20' },
]

const exportResources = [
  { resource: 'printers', label: 'Printers' },
  { resource: 'repairs', label: 'Repairs' },
  { resource: 'inventory', label: 'Inventory' },
  { resource: 'technicians', label: 'Technicians' },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [exporting, setExporting] = useState(null)

  useEffect(() => {
    exportAPI.getDashboard().then(({ data }) => setStats(data)).catch(() => {})
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

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time overview of your 3D printer management system</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative inline-block">
            <Button variant="outline" size="sm" className="h-9 gap-2 pr-3">
              <Download className="h-3.5 w-3.5" />
              Export
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
            {/* Simplified - just show export buttons directly */}
          </div>
        </div>
      </div>

      {/* Quick Export Row */}
      <div className="flex flex-wrap gap-2">
        {exportResources.map(({ resource, label }) => (
          <div key={resource} className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => handleExport(resource, 'pdf')} disabled={exporting === `${resource}-pdf`} className="h-7 text-[11px] px-2.5 rounded-lg text-muted-foreground hover:text-foreground">
              PDF {label}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleExport(resource, 'xlsx')} disabled={exporting === `${resource}-xlsx`} className="h-7 text-[11px] px-2.5 rounded-lg text-muted-foreground hover:text-foreground">
              Excel {label}
            </Button>
          </div>
        ))}
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map(({ key, label, icon: Icon, color, bg, border }, i) => (
            <div
              key={key}
              className="stat-card animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <CardContent className="p-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</p>
                    <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      <AnimatedCounter value={stats[key] || 0} />
                    </p>
                  </div>
                  <div className={cn('kpi-icon', bg)}>
                    <Icon className={cn('h-5 w-5', color)} />
                  </div>
                </div>
              </CardContent>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row 1 */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <PrinterChart data={stats.printersByBrand} />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <PrintersByTypeChart data={stats.printersByModel} />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <RepairChart data={stats.repairsByStatus} />
          </div>
        </div>
      )}

      {/* Charts Row 2 */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <MonthlyRepairsChart data={stats.monthlyRepairs} />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <InventoryStockChart data={stats.inventoryItems} />
          </div>
        </div>
      )}

      {/* Charts Row 3 */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <TechnicianWorkloadChart data={stats.technicianWorkload} />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <RecentActivity activities={stats.recentActivity} />
          </div>
        </div>
      )}

      {/* Loading State */}
      {!stats && (
        <div className="content-card">
          <CardContent className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Activity className="h-6 w-6 text-muted-foreground animate-pulse-soft" />
              </div>
              <p className="text-muted-foreground font-medium">Loading dashboard data...</p>
              <p className="text-muted-foreground/50 text-sm mt-1">Fetching real-time metrics</p>
            </div>
          </CardContent>
        </div>
      )}
    </div>
  )
}
