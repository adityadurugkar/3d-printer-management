import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { inventoryAPI } from '../api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function InventoryForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)
  const [form, setForm] = useState({
    partName: '', quantity: '', compatiblePrinters: '', price: '', supplier: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit) {
      inventoryAPI.getById(id).then(({ data }) => {
        setForm({
          ...data,
          compatiblePrinters: data.compatiblePrinters?.join(', ') || '',
          quantity: data.quantity || '',
          price: data.price || '',
        })
      }).catch(() => navigate('/inventory'))
    }
  }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const payload = {
      ...form,
      quantity: Number(form.quantity),
      price: Number(form.price),
      compatiblePrinters: form.compatiblePrinters.split(',').map(s => s.trim()).filter(Boolean),
    }
    try {
      if (isEdit) {
        await inventoryAPI.update(id, payload)
      } else {
        await inventoryAPI.create(payload)
      }
      navigate('/inventory')
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving item')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto page-container">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/inventory')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="page-title">{isEdit ? 'Edit Part' : 'Add Part'}</h1>
          <p className="page-subtitle">{isEdit ? 'Update spare part details' : 'Add a new spare part to inventory'}</p>
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
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <CardTitle>Part Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partName">Part Name</Label>
                <Input id="partName" value={form.partName} onChange={(e) => setForm({...form, partName: e.target.value})} required placeholder="e.g. Nozzle 0.4mm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input type="number" min="0" id="quantity" value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})} required placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input type="number" step="0.01" min="0" id="price" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} required placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input id="supplier" value={form.supplier} onChange={(e) => setForm({...form, supplier: e.target.value})} required placeholder="e.g. 3D Parts Co." />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="compatiblePrinters">Compatible Printers</Label>
              <Input id="compatiblePrinters" value={form.compatiblePrinters} onChange={(e) => setForm({...form, compatiblePrinters: e.target.value})} placeholder="e.g. Bambu Lab P1S, Bambu Lab A1, Anycubic" />
              <p className="text-xs text-muted-foreground">Enter printer names separated by commas</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : isEdit ? 'Update Part' : 'Create Part'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/inventory')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
