import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Wrench, Search, Play, CheckCircle } from 'lucide-react'
import { repairAPI } from '../api'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'

const statusVariant = (s) =>
  s === 'completed' ? 'success' :
  s === 'in-progress' ? 'info' :
  s === 'pending' ? 'warning' : 'destructive'

function formatDT(d) {
  if (!d) return '—'
  const dt = new Date(d)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const day = String(dt.getDate()).padStart(2, '0')
  const month = months[dt.getMonth()]
  const year = dt.getFullYear()
  let hours = dt.getHours()
  const minutes = String(dt.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`
}

function formatHours(h) {
  if (!h || h === 0) return '—'
  return h.toFixed(1) + 'h'
}

export default function Repairs() {
  const [repairs, setRepairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')
  const [timingLoading, setTimingLoading] = useState(null)

  const fetchData = () => {
    setLoading(true)
    repairAPI.getAll().then(({ data }) => setRepairs(data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    await repairAPI.delete(deleteId)
    setDeleteId(null)
    fetchData()
  }

  const handleStart = async (id) => {
    setTimingLoading(id)
    try {
      await repairAPI.startRepair(id)
      fetchData()
    } catch { /* ignore */ } finally {
      setTimingLoading(null)
    }
  }

  const handleComplete = async (id) => {
    setTimingLoading(id)
    try {
      await repairAPI.completeRepair(id)
      fetchData()
    } catch { /* ignore */ } finally {
      setTimingLoading(null)
    }
  }

  const filtered = repairs.filter(r =>
    r.printerName?.toLowerCase().includes(search.toLowerCase()) ||
    r.technicianName?.toLowerCase().includes(search.toLowerCase()) ||
    r.printerNumber?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <Wrench className="h-5 w-5 animate-pulse mr-2" /> Loading...
    </div>
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Repairs</h1>
          <p className="page-subtitle">Track and manage printer repairs</p>
        </div>
        <Button asChild className="h-9 gap-1.5">
          <Link to="/repairs/new">
            <Plus className="h-4 w-4" /> New Repair
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border-border/40">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle>
            All Repairs
            <span className="text-muted-foreground font-normal ml-1.5 text-sm">({filtered.length})</span>
          </CardTitle>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="Search repairs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-9 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Printer</TableHead>
                <TableHead>Printer #</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r._id}>
                  <TableCell className="font-semibold text-foreground">{r.printerName}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{r.printerNumber}</TableCell>
                  <TableCell className="text-foreground/80">{r.technicianName}</TableCell>
                  <TableCell className="text-xs text-foreground/70 whitespace-nowrap">{formatDT(r.startTime)}</TableCell>
                  <TableCell className="text-xs text-foreground/70 whitespace-nowrap">{formatDT(r.endTime)}</TableCell>
                  <TableCell className="text-foreground/80 font-medium">{formatHours(r.totalHours)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {r.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-blue-500/70 hover:text-blue-500 hover:bg-blue-500/10"
                          onClick={() => handleStart(r._id)}
                          disabled={timingLoading === r._id}
                        >
                          {timingLoading === r._id ? (
                            <span className="w-3.5 h-3.5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                      {r.status === 'in-progress' && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-emerald-500/70 hover:text-emerald-500 hover:bg-emerald-500/10"
                          onClick={() => handleComplete(r._id)}
                          disabled={timingLoading === r._id}
                        >
                          {timingLoading === r._id ? (
                            <span className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link to={`/repairs/${r._id}/edit`}>
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Dialog open={deleteId === r._id} onOpenChange={(o) => !o && setDeleteId(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(r._id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Repair</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete this repair record for <span className="font-semibold text-foreground">"{r.printerName}"</span>? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                    <Wrench className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium text-foreground/60">{search ? 'No repairs match your search' : 'No repairs found'}</p>
                    {!search && (
                      <Button variant="link" asChild className="mt-1 text-sm">
                        <Link to="/repairs/new">Create a repair record</Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
