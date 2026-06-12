import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { printerAPI } from '../api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function PrinterForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [form, setForm] = useState({
    name: '', model: '', brand: '', serialNumber: '', location: '',
    status: 'active', lastMaintenance: '', notes: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit) {
      printerAPI.getById(id).then(({ data }) => {
        setForm({
          ...data,
          lastMaintenance: data.lastMaintenance?.split('T')[0] || '',
        })
      }).catch(() => navigate('/printers'))
    }
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (isEdit) {
        await printerAPI.update(id, form)
      } else {
        await printerAPI.create(form)
      }
      navigate('/printers')
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving printer')
    } finally {
      setSaving(false)
    }
  }

  const brands = ['Bambu Lab A1', 'Bambu Lab P1S', 'Anycubic']

  return (
    <div className="max-w-2xl mx-auto page-container">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/printers')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Printer' : 'Add Printer'}</h1>
          <p className="page-subtitle">{isEdit ? 'Update printer details' : 'Register a new 3D printer'}</p>
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
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
              </svg>
            </div>
            <CardTitle>Printer Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Printer Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required placeholder="e.g. Workshop Delta" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Select id="brand" value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value})} required>
                  <option value="">Select brand</option>
                  {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input id="model" value={form.model} onChange={(e) => setForm({...form, model: e.target.value})} required placeholder="e.g. X1-Carbon" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serialNumber">Serial Number</Label>
                <Input id="serialNumber" value={form.serialNumber} onChange={(e) => setForm({...form, serialNumber: e.target.value})} required placeholder="SN-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} placeholder="e.g. Lab A, Shelf 3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select id="status" value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastMaintenance">Last Maintenance</Label>
                <Input type="date" id="lastMaintenance" value={form.lastMaintenance} onChange={(e) => setForm({...form, lastMaintenance: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                className="textarea-field"
                value={form.notes}
                onChange={(e) => setForm({...form, notes: e.target.value})}
                placeholder="Any additional notes about this printer..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : isEdit ? 'Update Printer' : 'Create Printer'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/printers')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
