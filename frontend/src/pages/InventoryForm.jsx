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
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/inventory')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEdit ? 'Edit Part' : 'Add Part'}</h1>
          <p className="text-muted-foreground text-sm">{isEdit ? 'Update part details' : 'Add a new spare part'}</p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Part Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="partName">Part Name</Label>
                <Input id="partName" value={form.partName} onChange={(e) => setForm({...form, partName: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input type="number" min="0" id="quantity" value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input type="number" step="0.01" min="0" id="price" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input id="supplier" value={form.supplier} onChange={(e) => setForm({...form, supplier: e.target.value})} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="compatiblePrinters">Compatible Printers (comma-separated)</Label>
              <Input id="compatiblePrinters" value={form.compatiblePrinters} onChange={(e) => setForm({...form, compatiblePrinters: e.target.value})} placeholder="e.g. Bambu Lab P1S, Bambu Lab A1, Anycubic" />
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
