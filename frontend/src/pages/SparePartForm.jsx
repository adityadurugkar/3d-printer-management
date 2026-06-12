import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { sparePartAPI } from '../api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select } from '../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

const categories = ['Nozzle', 'Hotend', 'Extruder', 'Belt', 'Build Plate', 'Fan', 'PTFE Tube', 'Sensor', 'Motor', 'Other']

export default function SparePartForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [form, setForm] = useState({
    partName: '',
    category: 'Other',
    compatiblePrinterType: 'All',
    partNumber: '',
    supplierName: '',
    supplierLink: '',
    currentStock: '',
    minimumStock: '5',
    unit: 'pcs',
    description: '',
    dateAdded: new Date().toISOString().split('T')[0],
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit) {
      sparePartAPI.getById(id).then(({ data }) => {
        setForm({
          ...data,
          currentStock: data.currentStock ?? '',
          minimumStock: data.minimumStock ?? '5',
          dateAdded: data.dateAdded?.split('T')[0] || new Date().toISOString().split('T')[0],
        })
      }).catch(() => navigate('/spare-parts'))
    }
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const payload = {
      ...form,
      currentStock: Number(form.currentStock),
      minimumStock: Number(form.minimumStock),
    }
    try {
      if (isEdit) {
        await sparePartAPI.update(id, payload)
      } else {
        await sparePartAPI.create(payload)
      }
      navigate('/spare-parts')
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving spare part')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto page-container">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/spare-parts')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Spare Part' : 'Add Spare Part'}</h1>
          <p className="page-subtitle">{isEdit ? 'Update spare part details' : 'Register a new spare part'}</p>
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
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
              </svg>
            </div>
            <CardTitle>Spare Part Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partName">Part Name</Label>
                <Input id="partName" value={form.partName} onChange={(e) => setForm({...form, partName: e.target.value})} required placeholder="e.g. Stainless Steel Nozzle 0.4mm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select id="category" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} required>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="compatiblePrinterType">Compatible Printer Type</Label>
                <Select id="compatiblePrinterType" value={form.compatiblePrinterType} onChange={(e) => setForm({...form, compatiblePrinterType: e.target.value})}>
                  <option value="All">All Printers</option>
                  <option value="A1">Bambu Lab A1</option>
                  <option value="P1S">Bambu Lab P1S</option>
                  <option value="Anycubic">Anycubic</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="partNumber">Part Number</Label>
                <Input id="partNumber" value={form.partNumber} onChange={(e) => setForm({...form, partNumber: e.target.value})} placeholder="e.g. NP-004-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierName">Supplier Name</Label>
                <Input id="supplierName" value={form.supplierName} onChange={(e) => setForm({...form, supplierName: e.target.value})} placeholder="e.g. 3D Print Parts Co." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplierLink">Supplier / Purchase Link</Label>
                <Input id="supplierLink" value={form.supplierLink} onChange={(e) => setForm({...form, supplierLink: e.target.value})} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentStock">Current Stock Quantity</Label>
                <Input type="number" min="0" id="currentStock" value={form.currentStock} onChange={(e) => setForm({...form, currentStock: e.target.value})} required placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimumStock">Minimum Stock Level</Label>
                <Input type="number" min="0" id="minimumStock" value={form.minimumStock} onChange={(e) => setForm({...form, minimumStock: e.target.value})} required placeholder="5" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input id="unit" value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})} placeholder="pcs, meters, grams, etc." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateAdded">Date Added</Label>
                <Input type="date" id="dateAdded" value={form.dateAdded} onChange={(e) => setForm({...form, dateAdded: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="textarea-field"
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="Part specifications, notes, usage instructions..."
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : isEdit ? 'Update Spare Part' : 'Create Spare Part'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/spare-parts')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
