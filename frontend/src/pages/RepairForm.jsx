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
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/repairs')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit Repair' : 'New Repair'}</h1>
          <p className="text-muted-foreground text-sm">{isEdit ? 'Update repair details' : 'Create a new repair record'}</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Repair Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <Input id="printerNumber" value={form.printerNumber} readOnly className="bg-muted text-muted-foreground cursor-not-allowed border-dashed" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="repairDate">Repair Date</Label>
                <Input type="date" id="repairDate" value={form.repairDate} onChange={(e) => setForm({...form, repairDate: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="technicianName">Technician Name</Label>
                <Input id="technicianName" value={form.technicianName} onChange={(e) => setForm({...form, technicianName: e.target.value})} required />
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
                className="flex min-h-[100px] w-full rounded-lg border-2 border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200"
                value={form.problemDescription}
                onChange={(e) => setForm({...form, problemDescription: e.target.value})}
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
