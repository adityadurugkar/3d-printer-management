import { useState, useEffect } from 'react'
import { Printer, Wrench, Package, Users, Clock, AlertTriangle, Activity, TrendingUp } from 'lucide-react'
import { exportAPI } from '../api'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { cn } from '../lib/utils'

const statCards = [
  { key: 'totalPrinters', label: 'Total Printers', icon: Printer },
  { key: 'activePrinters', label: 'Active Printers', icon: Activity },
  { key: 'totalRepairs', label: 'Total Repairs', icon: Wrench },
  { key: 'pendingRepairs', label: 'Pending Repairs', icon: Clock },
  { key: 'totalInventory', label: 'Inventory Items', icon: Package },
  { key: 'lowStockItems', label: 'Low Stock Items', icon: AlertTriangle },
  { key: 'totalTechnicians', label: 'Technicians', icon: Users },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [exporting, setExporting] = useState(null)

  useEffect(() => {
    exportAPI.getDashboard()
      .then(({ data }) => setStats(data))
      .catch(() => {})
  }, [])

  const handleExport = async (resource, format) => {
    setExporting(`${resource}-${format}`)
    try {
      const fn = format === 'pdf'
        ? exportAPI.downloadPDF
        : exportAPI.downloadExcel

      const { data } = await fn(resource)

      const url = window.URL.createObjectURL(new Blob([data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `${resource}-report.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      // ignore
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Real-time overview of your 3D printer system
          </p>
        </div>

        <div className="flex flex-wrap gap-2 bg-white/5 backdrop-blur-md p-2 rounded-xl border border-white/10">
          {[
            { resource: 'printers', label: 'Printers' },
            { resource: 'repairs', label: 'Repairs' },
            { resource: 'inventory', label: 'Inventory' },
            { resource: 'technicians', label: 'Technicians' },
          ].map(({ resource, label }) => (
            <div key={resource} className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport(resource, 'pdf')}
                disabled={exporting === `${resource}-pdf`}
                className="h-8 text-xs"
              >
                PDF {label}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport(resource, 'xlsx')}
                disabled={exporting === `${resource}-xlsx`}
                className="h-8 text-xs"
              >
                Excel {label}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* KPI CARDS */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(({ key, label, icon: Icon }) => (
            <Card
              key={key}
              className="bg-white/5 border border-white/10 backdrop-blur-md hover:scale-[1.02] transition-all duration-300"
            >
              <CardContent className="p-5 flex items-center justify-between">
                
                <div>
                  <p className="text-sm text-gray-400">{label}</p>
                  <p className="text-2xl font-bold mt-1">
                    {stats?.[key] ?? 0}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-white/10 shadow-lg">
                  <Icon className="h-5 w-5 text-white" />
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CHARTS */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4">
            <h2 className="text-lg font-semibold mb-4">Repair Overview</h2>
            <div className="text-gray-400">
              <TrendingUp className="animate-pulse" />
              Charts loaded below
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-4">
            <h2 className="text-lg font-semibold mb-4">Printer Overview</h2>
            <div className="text-gray-400">
              <Activity className="animate-pulse" />
              Charts loaded below
            </div>
          </div>

        </div>
      )}

      {/* LOADING STATE */}
      {!stats && (
        <Card className="bg-white/5 border border-white/10">
          <CardContent className="flex items-center justify-center py-12 text-gray-400">
            <TrendingUp className="animate-pulse mr-2" />
            Loading dashboard data...
          </CardContent>
        </Card>
      )}

    </div>
  )
}