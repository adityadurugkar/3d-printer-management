import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Clock } from 'lucide-react'
import { repairAPI, printerAPI, technicianAPI } from '../api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

function toDatetimeLocal(date) {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function RepairForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [printers, setPrinters] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [form, setForm] = useState({
    printerId: '', printerName: '', printerNumber: '', repairDate: '',
    technicianName: '', technicianEmail: '', problemDescription: '',
    priority: 'medium', dueDate: '', estimatedRepairTime: '',
    status: 'pending', startTime: '', endTime: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    printerAPI.getAll().then(({ data }) => setPrinters(data)).catch(() => {})
    technicianAPI.getAll().then(({ data }) => setTechnicians(data)).catch(() => {})
    if (isEdit) {
      repairAPI.getById(id).then(({ data }) => {
        setForm({
          ...data,
          repairDate: data.repairDate?.split('T')[0] || '',
          dueDate: data.dueDate?.split('T')[0] || '',
          startTime: toDatetimeLocal(data.startTime),
          endTime: toDatetimeLocal(data.endTime),
        })
      }).catch(() => navigate('/repairs'))
    }
  }, [id])

  const totalHours = useMemo(() => {
    if (form.startTime && form.endTime) {
      const start = new Date(form.startTime).getTime()
      const end = new Date(form.endTime).getTime()
      if (end > start) return ((end - start) / 3600000).toFixed(1)
    }
    return '0.0'
  }, [form.startTime, form.endTime])

  const handlePrinterSelect = (printerId) => {
    const p = printers.find(p => p._id === printerId)
    if (p) {
      setForm({ ...form, printerId: p._id, printerName: p.name, printerNumber: p.serialNumber })
    }
  }

  const selectTechnician = (techId) => {
    const t = technicians.find(tech => tech._id === techId)
    if (t) setForm({ ...form, technicianName: t.name, technicianEmail: t.email })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = { ...form, totalHours: parseFloat(totalHours) || 0 }
      if (isEdit) {
        await repairAPI.update(id, payload)
      } else {
        await repairAPI.create(payload)
      }
      navigate('/repairs')
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving repair')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto page-container">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/repairs')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Repair' : 'New Repair'}</h1>
          <p className="page-subtitle">{isEdit ? 'Update repair details' : 'Create a new repair record'}</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
          {error}
        </div>
      )}

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.49 5.49a2.25 2.25 0 01-3.18-3.18l5.49-5.49m-1.04-1.04L5.25 7.5m3.96 3.96L15.75 3.75l4.5 4.5-6.54 6.54m-1.04-1.04l1.04 1.04m-6.54-6.54l1.04-1.04" />
              </svg>
            </div>
            <CardTitle>Repair Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="printerId">Printer</Label>
                <Select id="printerId" value={form.printerId} onChange={(e) => handlePrinterSelect(e.target.value)} required>
                  <option value="">Select printer</option>
                  {printers.map(p => <option key={p._id} value={p._id}>{p.name} - {p.serialNumber}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="printerNumber">Printer Number</Label>
                <Input id="printerNumber" value={form.printerNumber} readOnly className="bg-muted/50 text-muted-foreground cursor-not-allowed border-dashed" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repairDate">Repair Date</Label>
                <Input type="date" id="repairDate" value={form.repairDate} onChange={(e) => setForm({...form, repairDate: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="technicianName">Technician</Label>
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
                    id="technicianName"
                    value={form.technicianName}
                    onChange={(e) => setForm({...form, technicianName: e.target.value})}
                    required
                    placeholder="Technician name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select id="priority" value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input type="date" id="dueDate" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedRepairTime">Est. Repair Time (hours)</Label>
                <Input type="number" step="0.5" min="0" id="estimatedRepairTime" value={form.estimatedRepairTime} onChange={(e) => setForm({...form, estimatedRepairTime: e.target.value})} placeholder="e.g. 3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input type="datetime-local" id="startTime" value={form.startTime} onChange={(e) => setForm({...form, startTime: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input type="datetime-local" id="endTime" value={form.endTime} onChange={(e) => setForm({...form, endTime: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalHours">Total Repair Hours</Label>
                <div className="relative">
                  <Input id="totalHours" value={totalHours} readOnly className="bg-muted/50 text-foreground font-semibold cursor-not-allowed border-dashed pr-8" />
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select id="status" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="problemDescription">Problem Description</Label>
              <textarea
                id="problemDescription"
                className="textarea-field"
                value={form.problemDescription}
                onChange={(e) => setForm({...form, problemDescription: e.target.value})}
                placeholder="Describe the issue in detail..."
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : isEdit ? 'Update Repair' : 'Create Repair'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/repairs')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
