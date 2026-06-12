import { useState, useEffect } from 'react'
import { BarChart3, Activity } from 'lucide-react'
import { exportAPI } from '../api'
import PrinterChart from '../components/charts/PrinterChart'
import PrintersByTypeChart from '../components/charts/PrintersByTypeChart'
import RepairChart from '../components/charts/RepairChart'
import MonthlyRepairsChart from '../components/charts/MonthlyRepairsChart'
import InventoryStockChart from '../components/charts/InventoryStockChart'
import TechnicianWorkloadChart from '../components/charts/TechnicianWorkloadChart'
import RepairAvgTimeChart from '../components/charts/RepairAvgTimeChart'
import { motion } from 'framer-motion'

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    exportAPI.getDashboard().then(({ data }) => setStats(data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/10 flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="h-7 w-7 text-cyan-400 animate-pulse-soft" />
        </div>
        <p className="text-white/60 font-medium">Loading analytics...</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Analytics</h1>
            <p className="text-sm text-white/40">Deep insights into your manufacturing operations</p>
          </div>
        </div>
      </motion.div>

      {stats && (
        <div className="space-y-4">
          {/* Printer Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card rounded-2xl">
              <PrinterChart data={stats.printersByBrand} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card rounded-2xl">
              <PrintersByTypeChart data={stats.printersByModel} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl">
              <RepairChart data={stats.repairsByStatus} />
            </motion.div>
          </div>

          {/* Repair Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-2xl">
              <MonthlyRepairsChart data={stats.monthlyRepairs} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card rounded-2xl">
              <InventoryStockChart data={stats.inventoryItems} />
            </motion.div>
          </div>

          {/* Performance Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-2xl">
              <TechnicianWorkloadChart data={stats.technicianWorkload} />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card rounded-2xl">
              <RepairAvgTimeChart data={stats.avgTechnicianRepairTime} />
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}
