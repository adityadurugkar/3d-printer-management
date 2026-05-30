import { useState, useEffect } from 'react'
import { Printer, Wrench, Package, Users, Clock, AlertTriangle, Activity, CheckCircle } from 'lucide-react'
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
  { key: 'totalPrinters', label: 'Total Printers', icon: Printer, color: 'text-violet-600 dark:text-violet-300', bg: 'bg-violet-100 dark:bg-violet-950/60' },
  { key: 'activePrinters', label: 'Active Printers', icon: Activity, color: 'text-emerald-600 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-950/60' },
  { key: 'totalRepairs', label: 'Total Repairs', icon: Wrench, color: 'text-amber-600 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-950/60' },
  { key: 'pendingRepairs', label: 'Pending Repairs', icon: Clock, color: 'text-rose-600 dark:text-rose-300', bg: 'bg-rose-100 dark:bg-rose-950/60' },
  { key: 'completedRepairs', label: 'Completed Repairs', icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-950/60' },
  { key: 'totalInventory', label: 'Inventory Items', icon: Package, color: 'text-blue-600 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-950/60' },
  { key: 'lowStockItems', label: 'Low Stock Items', icon: AlertTriangle, color: 'text-orange-600 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-950/60' },
  { key: 'totalTechnicians', label: 'Technicians', icon: Users, color: 'text-indigo-600 dark:text-indigo-300', bg: 'bg-indigo-100 dark:bg-indigo-950/60' },
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Overview of your 3D printer management system</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {exportResources.map(({ resource, label }) => (
            <div key={resource} className="flex gap-1">
              <Button variant="outline" size="sm" onClick={() => handleExport(resource, 'pdf')} disabled={exporting === `${resource}-pdf`} className="h-8 text-xs">PDF {label}</Button>
              <Button variant="outline" size="sm" onClick={() => handleExport(resource, 'xlsx')} disabled={exporting === `${resource}-xlsx`} className="h-8 text-xs">Excel {label}</Button>
            </div>
          ))}
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {statCards.map(({ key, label, icon: Icon, color, bg }) => (
            <Card key={key} className="animate-slide-up">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <p className="text-xs sm:text-sm text-muted-foreground font-medium">{label}</p>
                    <p className="text-xl sm:text-2xl font-bold tracking-tight">
                      {key === 'completedRepairs' ? (
                        <AnimatedCounter value={stats[key] || 0} />
                      ) : (
                        <AnimatedCounter value={stats[key]} />
                      )}
                    </p>
                  </div>
                  <div className={cn('p-2.5 sm:p-3 rounded-xl', bg)}>
                    <Icon className={cn('h-4 w-4 sm:h-5 sm:w-5', color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PrinterChart data={stats.printersByBrand} />
          <PrintersByTypeChart data={stats.printersByModel} />
          <RepairChart data={stats.repairsByStatus} />
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyRepairsChart data={stats.monthlyRepairs} />
          <InventoryStockChart data={stats.inventoryItems} />
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TechnicianWorkloadChart data={stats.technicianWorkload} />
          <RecentActivity activities={stats.recentActivity} />
        </div>
      )}

      {!stats && (
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                <Activity className="h-5 w-5 text-muted-foreground animate-pulse" />
              </div>
              <p className="text-muted-foreground">Loading dashboard data...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
