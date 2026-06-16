import { useState } from 'react'
import { FileText, Download, Printer, Wrench, Package, Cpu, Users, FileDown, FileSpreadsheet } from 'lucide-react'
import { exportAPI } from '../api'
import { Button } from '../components/ui/button'
import { motion } from 'framer-motion'

const reportResources = [
  { resource: 'printers', label: 'Printers Report', desc: 'Complete printer fleet inventory and status', icon: Printer, color: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/20', iconColor: 'text-cyan-400' },
  { resource: 'repairs', label: 'Repairs Report', desc: 'All repair records with time tracking', icon: Wrench, color: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/20', iconColor: 'text-amber-400' },
  { resource: 'inventory', label: 'Inventory Report', desc: 'Spare parts and supply levels', icon: Package, color: 'from-violet-500/20 to-violet-600/10', border: 'border-violet-500/20', iconColor: 'text-violet-400' },
  { resource: 'spare-parts', label: 'Spare Parts Report', desc: 'Detailed spare parts catalog', icon: Cpu, color: 'from-pink-500/20 to-pink-600/10', border: 'border-pink-500/20', iconColor: 'text-pink-400' },
  { resource: 'technicians', label: 'Technicians Report', desc: 'Staff performance and workload', icon: Users, color: 'from-indigo-500/20 to-indigo-600/10', border: 'border-indigo-500/20', iconColor: 'text-indigo-400' },
]

export default function Reports() {
  const [exporting, setExporting] = useState(null)

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
    <div className="space-y-6 pb-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Reports</h1>
            <p className="text-sm text-gray-600 dark:text-white/40">Generate and export professional reports</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportResources.map(({ resource, label, desc, icon: Icon, color, border, iconColor }, i) => (
          <motion.div
            key={resource}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card-hover rounded-2xl p-5"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className={cn('p-3 rounded-xl', color, border, 'border')}>
                <Icon className={cn('h-5 w-5', iconColor)} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{label}</h3>
                <p className="text-xs text-gray-600 dark:text-white/40 mt-0.5">{desc}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport(resource, 'pdf')}
                disabled={exporting === `${resource}-pdf`}
                className="flex-1 bg-black/[0.03] dark:bg-white/[0.03] border-gray-300 dark:border-white/[0.08] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:border-gray-400 dark:hover:border-white/20 text-gray-700 dark:text-white/50 hover:text-gray-900 dark:hover:text-white text-xs h-8"
              >
                <FileDown className="h-3.5 w-3.5 mr-1.5" />
                {exporting === `${resource}-pdf` ? 'Exporting...' : 'PDF'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport(resource, 'xlsx')}
                disabled={exporting === `${resource}-xlsx`}
                className="flex-1 bg-black/[0.03] dark:bg-white/[0.03] border-gray-300 dark:border-white/[0.08] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] hover:border-gray-400 dark:hover:border-white/20 text-gray-700 dark:text-white/50 hover:text-gray-900 dark:hover:text-white text-xs h-8"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" />
                {exporting === `${resource}-xlsx` ? 'Exporting...' : 'Excel'}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function cn(...classes) { return classes.filter(Boolean).join(' ') }
