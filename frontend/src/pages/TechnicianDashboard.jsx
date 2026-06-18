import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Clock, CheckCircle, AlertTriangle, Wrench, Play, ArrowRight } from 'lucide-react'
import { repairAPI, technicianAPI } from '../api'
import { getUser } from '../lib/auth'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'

const statusVariant = (s) =>
  s === 'completed' ? 'success' :
  s === 'in-progress' ? 'info' :
  s === 'pending' ? 'warning' : 'destructive'

const priorityColor = (p) =>
  p === 'critical' ? 'text-red-400' :
  p === 'high' ? 'text-orange-400' :
  p === 'medium' ? 'text-yellow-400' : 'text-gray-400'

export default function TechnicianDashboard() {
  const user = getUser()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.email) { setLoading(false); return }
    Promise.all([
      technicianAPI.getDashboard(),
      repairAPI.getTechnicianRepairs(user.email),
    ]).then(([statsRes, repairsRes]) => {
      setStats(statsRes.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const statCards = [
    { label: "Today's Tasks", value: stats?.todayTasks || 0, icon: ClipboardList, color: 'from-cyan-500 to-blue-600' },
    { label: 'Pending', value: stats?.pending || 0, icon: Clock, color: 'from-amber-500 to-orange-600' },
    { label: 'In Progress', value: stats?.inProgress || 0, icon: Play, color: 'from-blue-500 to-indigo-600' },
    { label: 'Completed', value: stats?.completed || 0, icon: CheckCircle, color: 'from-emerald-500 to-green-600' },
    { label: 'Overdue', value: stats?.overdue || 0, icon: AlertTriangle, color: 'from-red-500 to-rose-600' },
  ]

  return (
    <div className="page-container">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">My Dashboard</h1>
            <p className="page-subtitle">{user?.name || 'Technician'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>My Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket</TableHead>
                <TableHead>Printer</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.recentRepairs?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No tasks assigned yet
                  </TableCell>
                </TableRow>
              )}
              {stats?.recentRepairs?.map((r) => (
                <TableRow key={r._id}>
                  <TableCell className="font-mono text-xs font-medium">{r.ticketNumber || '—'}</TableCell>
                  <TableCell className="font-medium">{r.printerName}</TableCell>
                  <TableCell>
                    <span className={`font-semibold text-xs ${priorityColor(r.priority)}`}>
                      {r.priority?.toUpperCase() || '—'}
                    </span>
                  </TableCell>
                  <TableCell><Badge variant={statusVariant(r.status)}>{r.status}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to={`/repairs/${r._id}/edit`}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium"
                    >
                      View <ArrowRight className="h-3 w-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
