import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, Clock, AlertTriangle, ArrowLeft, Save, Wrench } from 'lucide-react'
import { repairAPI } from '../api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function RepairComplete() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [repair, setRepair] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    actionsPerformed: '',
    rootCause: '',
    sparePartsUsed: [{ partName: '', quantity: 1, partNumber: '' }],
    timeTaken: '',
    images: [],
    additionalNotes: '',
  })

  useEffect(() => {
    repairAPI.getById(id).then(({ data }) => {
      setRepair(data)
      setForm(prev => ({
        ...prev,
        timeTaken: data.estimatedRepairTime || '',
      }))
    }).catch(() => navigate('/login')).finally(() => setLoading(false))
  }, [id])

  const addSparePart = () => {
    setForm({ ...form, sparePartsUsed: [...form.sparePartsUsed, { partName: '', quantity: 1, partNumber: '' }] })
  }

  const removeSparePart = (idx) => {
    setForm({ ...form, sparePartsUsed: form.sparePartsUsed.filter((_, i) => i !== idx) })
  }

  const updateSparePart = (idx, field, value) => {
    const updated = [...form.sparePartsUsed]
    updated[idx] = { ...updated[idx], [field]: value }
    setForm({ ...form, sparePartsUsed: updated })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await repairAPI.submitCompletion(id, {
        ...form,
        timeTaken: parseFloat(form.timeTaken) || 0,
        sparePartsUsed: form.sparePartsUsed.filter(p => p.partName.trim()),
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit completion report')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0b1a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0b0b1a] flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center glass-card">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-emerald-400" />
            </div>
            <CardTitle className="text-xl mb-2">Repair Complete Report Submitted</CardTitle>
            <p className="text-muted-foreground mb-6">
              Your completion report for <span className="font-semibold text-foreground">{repair?.printerName}</span> has been submitted successfully.
              An administrator will review and verify it shortly.
            </p>
            {repair?.ticketNumber && (
              <p className="text-sm text-muted-foreground mb-6">Ticket: {repair.ticketNumber}</p>
            )}
            <p className="text-xs text-muted-foreground">You can close this window.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0b1a] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-white/50 hover:text-white/80 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Repair Completion Report</h1>
              {repair?.ticketNumber && (
                <p className="text-sm text-amber-400/80 font-mono">{repair.ticketNumber}</p>
              )}
            </div>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 mt-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-white/40">Printer:</span> <span className="text-white font-medium">{repair?.printerName}</span></div>
              <div><span className="text-white/40">Serial:</span> <span className="text-white/80">{repair?.printerNumber}</span></div>
              <div><span className="text-white/40">Technician:</span> <span className="text-white/80">{repair?.technicianName}</span></div>
              <div>
                <span className="text-white/40">Priority:</span>{' '}
                <span className={`font-medium ${
                  repair?.priority === 'critical' ? 'text-red-400' :
                  repair?.priority === 'high' ? 'text-orange-400' :
                  repair?.priority === 'medium' ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {repair?.priority?.toUpperCase() || 'MEDIUM'}
                </span>
              </div>
            </div>
            <p className="text-sm text-white/60 mt-3"><span className="text-white/40">Issue:</span> {repair?.problemDescription}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Repair Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Actions Performed</Label>
                <textarea
                  className="textarea-field"
                  value={form.actionsPerformed}
                  onChange={(e) => setForm({ ...form, actionsPerformed: e.target.value })}
                  placeholder="Describe what was done to fix the printer..."
                  rows={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Root Cause</Label>
                <textarea
                  className="textarea-field"
                  value={form.rootCause}
                  onChange={(e) => setForm({ ...form, rootCause: e.target.value })}
                  placeholder="What caused the issue?"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Time Taken (hours)</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  value={form.timeTaken}
                  onChange={(e) => setForm({ ...form, timeTaken: e.target.value })}
                  placeholder="e.g. 2.5"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Spare Parts Used</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addSparePart}>+ Add Part</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {form.sparePartsUsed.map((part, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-1">
                    <Input
                      placeholder="Part name"
                      value={part.partName}
                      onChange={(e) => updateSparePart(idx, 'partName', e.target.value)}
                    />
                  </div>
                  <div className="w-20 space-y-1">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={part.quantity}
                      onChange={(e) => updateSparePart(idx, 'quantity', parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Input
                      placeholder="Part #"
                      value={part.partNumber}
                      onChange={(e) => updateSparePart(idx, 'partNumber', e.target.value)}
                    />
                  </div>
                  {form.sparePartsUsed.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSparePart(idx)}
                      className="mt-1 text-red-400/60 hover:text-red-400 text-sm"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Optional — list any spare parts used in this repair.</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <textarea
                  className="textarea-field"
                  value={form.additionalNotes}
                  onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })}
                  placeholder="Any other notes or recommendations..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-500/20"
            >
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" /> Submitting...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" /> Submit Completion Report</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
