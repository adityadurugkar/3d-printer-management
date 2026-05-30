import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { repairAPI, printerAPI } from '../api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function RepairForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [printers, setPrinters] = useState([])
  const [form, setForm] = useState({
    printerId: '', printerName: '', printerNumber: '', repairDate: '',
    technicianName: '', problemDescription: '', status: 'pending',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    printerAPI.getAll().then(({ data }) => setPrinters(data)).catch(() => {})
    if (isEdit) {
      repairAPI.getById(id).then(({ data }) => {
        setForm({
          ...data,
          repairDate: data.repairDate?.split('T')[0] || '',
        })
      }).catch(() => navigate('/repairs'))
    }
  }, [id])

  const handlePrinterSelect = (printerId) => {
    const p = printers.find(p => p._id === printerId)
    if (p) {
      setForm({ ...form, printerId: p._id, printerName: p.name, printerNumber: p.serialNumber })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (isEdit) {
        await repairAPI.update(id, form)
      } else {
        await repairAPI.create(form)
      }
      navigate('/repairs')
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving repair')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto page-container">
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

      <Card>
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
                <Label htmlFor="technicianName">Technician Name</Label>
                <Input id="technicianName" value={form.technicianName} onChange={(e) => setForm({...form, technicianName: e.target.value})} required placeholder="e.g. John Smith" />
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
