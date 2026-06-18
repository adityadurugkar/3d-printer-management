import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Wrench, Search, Play, CheckCircle, UserCheck, ShieldCheck, Send } from 'lucide-react'
import { repairAPI, technicianAPI } from '../api'
import { useSort } from '../hooks/useSort'
import { isAdmin } from '../lib/auth'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, SortableHead } from '../components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'

const statusVariant = (s) =>
  s === 'completed' ? 'success' :
  s === 'in-progress' ? 'info' :
  s === 'pending' ? 'warning' : 'destructive'

const priorityColor = (p) =>
  p === 'critical' ? 'text-red-400' :
  p === 'high' ? 'text-orange-400' :
  p === 'medium' ? 'text-yellow-400' : 'text-gray-400'

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
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')
  const [timingLoading, setTimingLoading] = useState(null)
  const [assignRepair, setAssignRepair] = useState(null)
  const [assignForm, setAssignForm] = useState({ technicianName: '', technicianEmail: '', priority: 'medium', dueDate: '', estimatedRepairTime: '' })
  const [verifyRepair, setVerifyRepair] = useState(null)

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      repairAPI.getAll(),
      technicianAPI.getAll(),
    ]).then(([rep, tech]) => {
      setRepairs(rep.data)
      setTechnicians(tech.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const { sortColumn, sortDirection, toggleSort, getSortedData } = useSort()

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

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!assignRepair) return
    await repairAPI.assignRepair(assignRepair._id, assignForm)
    setAssignRepair(null)
    setAssignForm({ technicianName: '', technicianEmail: '', priority: 'medium', dueDate: '', estimatedRepairTime: '' })
    fetchData()
  }

  const handleVerify = async () => {
    if (!verifyRepair) return
    await repairAPI.verifyRepair(verifyRepair._id, { verificationStatus: 'verified' })
    setVerifyRepair(null)
    fetchData()
  }

  const openAssign = (repair) => {
    const match = technicians.find(t => t.name === repair.technicianName)
    setAssignForm({
      technicianName: repair.technicianName || '',
      technicianEmail: repair.technicianEmail || match?.email || '',
      priority: repair.priority || 'medium',
      dueDate: repair.dueDate ? repair.dueDate.split('T')[0] : '',
      estimatedRepairTime: repair.estimatedRepairTime || '',
    })
    setAssignRepair(repair)
  }

  const selectTechnician = (id) => {
    const t = technicians.find(tech => tech._id === id)
    if (t) setAssignForm({ ...assignForm, technicianName: t.name, technicianEmail: t.email })
  }

  const filtered = useMemo(() =>
    repairs.filter(r =>
      r.printerName?.toLowerCase().includes(search.toLowerCase()) ||
      r.technicianName?.toLowerCase().includes(search.toLowerCase()) ||
      r.printerNumber?.toLowerCase().includes(search.toLowerCase()) ||
      r.ticketNumber?.toLowerCase().includes(search.toLowerCase())
    ),
    [repairs, search]
  )

  const sorted = useMemo(() => getSortedData(filtered), [filtered, getSortedData])

  const needAssign = (r) => !r.ticketNumber || r.status === 'pending'
  const isCompleted = (r) => r.status === 'completed'
  const isVerified = (r) => r.verificationStatus === 'verified'
  const hasReport = (r) => r.completionReport?.actionsPerformed

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <Wrench className="h-5 w-5 animate-pulse mr-2" /> Loading...
    </div>
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Wrench className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Repairs</h1>
            <p className="page-subtitle">Track and manage printer repairs</p>
          </div>
        </div>
        <Button asChild className="h-9 gap-1.5">
          <Link to="/repairs/new">
            <Plus className="h-4 w-4" /> New Repair
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden glass-card">
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
                <TableHead>Ticket</TableHead>
                <TableHead>Printer</TableHead>
                <SortableHead column="technicianName" sortColumn={sortColumn} sortDirection={sortDirection} onSort={toggleSort}>Technician</SortableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due</TableHead>
                <SortableHead column="repairDate" sortColumn={sortColumn} sortDirection={sortDirection} onSort={toggleSort}>Date</SortableHead>
                <SortableHead column="totalHours" sortColumn={sortColumn} sortDirection={sortDirection} onSort={toggleSort}>Hours</SortableHead>
                <SortableHead column="status" sortColumn={sortColumn} sortDirection={sortDirection} onSort={toggleSort}>Status</SortableHead>
                <TableHead>Verified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((r) => (
                <TableRow key={r._id}>
                  <TableCell className="font-mono text-xs font-medium text-foreground/90">
                    {r.ticketNumber || <span className="text-muted-foreground italic">—</span>}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">{r.printerName}</TableCell>
                  <TableCell className="text-foreground/80">{r.technicianName || <span className="text-muted-foreground italic">Unassigned</span>}</TableCell>
                  <TableCell>
                    <span className={`font-semibold text-xs ${priorityColor(r.priority)}`}>
                      {r.priority?.toUpperCase() || '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-foreground/70 whitespace-nowrap">
                    {r.dueDate ? <span className={new Date(r.dueDate) < new Date() && r.status !== 'completed' ? 'text-red-400 font-medium' : ''}>{new Date(r.dueDate).toLocaleDateString()}</span> : '—'}
                  </TableCell>
                  <TableCell className="text-xs text-foreground/70 whitespace-nowrap">{formatDT(r.repairDate)}</TableCell>
                  <TableCell className="text-foreground/80 font-medium">{formatHours(r.totalHours)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {isVerified(r) ? (
                      <Badge variant="success" className="text-[10px] px-1.5 py-0.5">Verified</Badge>
                    ) : isCompleted(r) ? (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0.5">Pending</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {isAdmin() && needAssign(r) && (
                        <Dialog open={assignRepair?._id === r._id} onOpenChange={(o) => { if (!o) setAssignRepair(null) }}>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => openAssign(r)}
                              className="text-violet-500/70 hover:text-violet-500 hover:bg-violet-500/10"
                              title="Assign Technician"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg">
                            <form onSubmit={handleAssign}>
                              <DialogHeader>
                                <DialogTitle>Assign Repair Task</DialogTitle>
                                <DialogDescription>
                                  Assign {r.printerName} to a technician
                                  {r.ticketNumber && <span className="block font-mono text-xs mt-1">{r.ticketNumber}</span>}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Technician</Label>
                                  <div className="flex gap-2">
                                    <select
                                      onChange={(e) => selectTechnician(e.target.value)}
                                      className="w-1/3 h-10 rounded-xl border border-border/60 bg-card px-3 text-sm focus:outline-none"
                                      defaultValue=""
                                    >
                                      <option value="" disabled>Select</option>
                                      {technicians.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                    <Input
                                      className="flex-1"
                                      placeholder="Technician name"
                                      value={assignForm.technicianName}
                                      onChange={(e) => setAssignForm({ ...assignForm, technicianName: e.target.value })}
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Technician Email</Label>
                                  <Input
                                    type="email"
                                    value={assignForm.technicianEmail}
                                    onChange={(e) => setAssignForm({ ...assignForm, technicianEmail: e.target.value })}
                                    placeholder="tech@example.com"
                                    required
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label>Priority</Label>
                                    <select
                                      value={assignForm.priority}
                                      onChange={(e) => setAssignForm({ ...assignForm, priority: e.target.value })}
                                      className="w-full h-10 rounded-xl border border-border/60 bg-card px-3 text-sm focus:outline-none"
                                    >
                                      <option value="low">Low</option>
                                      <option value="medium">Medium</option>
                                      <option value="high">High</option>
                                      <option value="critical">Critical</option>
                                    </select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Due Date</Label>
                                    <Input type="date" value={assignForm.dueDate} onChange={(e) => setAssignForm({ ...assignForm, dueDate: e.target.value })} />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label>Estimated Repair Time (hours)</Label>
                                  <Input type="number" step="0.5" min="0" value={assignForm.estimatedRepairTime} onChange={(e) => setAssignForm({ ...assignForm, estimatedRepairTime: e.target.value })} placeholder="e.g. 3" />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="button" variant="ghost" onClick={() => setAssignRepair(null)}>Cancel</Button>
                                <Button type="submit" className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white">
                                  <Send className="h-4 w-4 mr-2" /> Assign & Send Email
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      )}
                      {r.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-blue-500/70 hover:text-blue-500 hover:bg-blue-500/10"
                          onClick={() => handleStart(r._id)}
                          disabled={timingLoading === r._id}
                          title="Start Repair"
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
                          title="Complete Repair"
                        >
                          {timingLoading === r._id ? (
                            <span className="w-3.5 h-3.5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                          ) : (
                            <CheckCircle className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                      {isAdmin() && isCompleted(r) && !isVerified(r) && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-emerald-500/70 hover:text-emerald-500 hover:bg-emerald-500/10"
                          onClick={() => setVerifyRepair(r)}
                          title="Verify Repair"
                        >
                          <ShieldCheck className="h-3.5 w-3.5" />
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
                  <TableCell colSpan={10} className="text-center py-16 text-muted-foreground">
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

      <Dialog open={!!verifyRepair} onOpenChange={(o) => { if (!o) setVerifyRepair(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Repair</DialogTitle>
            <DialogDescription>
              Confirm that the repair for <span className="font-semibold text-foreground">{verifyRepair?.printerName}</span> has been reviewed and approved.
            </DialogDescription>
          </DialogHeader>
          {verifyRepair?.completionReport && (
            <div className="space-y-3 py-2 text-sm">
              <div className="bg-muted/30 rounded-xl p-3 space-y-2">
                <p><span className="text-muted-foreground">Actions:</span> <span className="text-foreground">{verifyRepair.completionReport.actionsPerformed}</span></p>
                <p><span className="text-muted-foreground">Root Cause:</span> <span className="text-foreground">{verifyRepair.completionReport.rootCause}</span></p>
                <p><span className="text-muted-foreground">Time Taken:</span> <span className="text-foreground">{verifyRepair.completionReport.timeTaken}h</span></p>
                {verifyRepair.completionReport.sparePartsUsed?.length > 0 && (
                  <p><span className="text-muted-foreground">Parts:</span> <span className="text-foreground">{verifyRepair.completionReport.sparePartsUsed.map(p => `${p.partName} x${p.quantity}`).join(', ')}</span></p>
                )}
                {verifyRepair.completionReport.additionalNotes && (
                  <p><span className="text-muted-foreground">Notes:</span> <span className="text-foreground">{verifyRepair.completionReport.additionalNotes}</span></p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyRepair(null)}>Cancel</Button>
            <Button
              onClick={handleVerify}
              className="bg-gradient-to-r from-emerald-500 to-green-600 text-white"
            >
              <ShieldCheck className="h-4 w-4 mr-2" /> Confirm & Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
