import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Search, Cpu, ExternalLink, Package } from 'lucide-react'
import { sparePartAPI } from '../api'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '../components/ui/dialog'
import { cn } from '../lib/utils'

const categories = ['Nozzle', 'Hotend', 'Extruder', 'Belt', 'Build Plate', 'Fan', 'PTFE Tube', 'Sensor', 'Motor', 'Other']

const stockBadgeVariant = (part) => {
  if (part.currentStock <= 0) return 'destructive'
  if (part.currentStock <= part.minimumStock) return 'warning'
  return 'success'
}

const stockBadgeLabel = (part) => {
  if (part.currentStock <= 0) return 'Out of Stock'
  if (part.currentStock <= part.minimumStock) return 'Low Stock'
  return 'In Stock'
}

export default function SpareParts() {
  const [parts, setParts] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterPrinter, setFilterPrinter] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStock, setFilterStock] = useState('all')

  const fetchData = () => {
    setLoading(true)
    const params = {}
    if (filterPrinter !== 'all') params.printerType = filterPrinter
    if (filterCategory !== 'all') params.category = filterCategory
    if (filterStock !== 'all') params.stockStatus = filterStock
    sparePartAPI.getAll(params).then(({ data }) => setParts(data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [filterPrinter, filterCategory, filterStock])

  const handleDelete = async () => {
    if (!deleteId) return
    await sparePartAPI.delete(deleteId)
    setDeleteId(null)
    fetchData()
  }

  const filtered = parts.filter(p =>
    p.partName?.toLowerCase().includes(search.toLowerCase()) ||
    p.partNumber?.toLowerCase().includes(search.toLowerCase()) ||
    p.supplierName?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <Cpu className="h-5 w-5 animate-pulse mr-2" /> Loading...
    </div>
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Spare Parts</h1>
            <p className="page-subtitle">Manage spare parts inventory for 3D printers</p>
          </div>
        </div>
        <Button asChild className="h-9 gap-1.5">
          <Link to="/spare-parts/new">
            <Plus className="h-4 w-4" /> Add Spare Part
          </Link>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="relative w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Search spare parts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-9 text-sm"
          />
        </div>
        <Select value={filterPrinter} onChange={(e) => setFilterPrinter(e.target.value)} className="h-9 text-sm w-36">
          <option value="all">All Printers</option>
          <option value="A1">Bambu Lab A1</option>
          <option value="P1S">Bambu Lab P1S</option>
          <option value="Anycubic">Anycubic</option>
        </Select>
        <Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="h-9 text-sm w-36">
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Select value={filterStock} onChange={(e) => setFilterStock(e.target.value)} className="h-9 text-sm w-36">
          <option value="all">All Stock</option>
          <option value="in">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </Select>
      </div>

      <Card className="overflow-hidden glass-card">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle>
            Spare Parts
            <span className="text-muted-foreground font-normal ml-1.5 text-sm">({filtered.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Part Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Printer Type</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p._id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{p.partName}</span>
                      {p.partNumber && (
                        <span className="text-xs text-muted-foreground font-mono">{p.partNumber}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[11px]">{p.category}</Badge>
                  </TableCell>
                  <TableCell className="text-foreground/80 text-xs font-medium">
                    {p.compatiblePrinterType === 'All' ? 'All' : p.compatiblePrinterType}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'font-semibold',
                        p.currentStock <= 0 ? 'text-destructive' : p.currentStock <= p.minimumStock ? 'text-warning' : 'text-foreground'
                      )}>
                        {p.currentStock}
                      </span>
                      <span className="text-xs text-muted-foreground">{p.unit || 'pcs'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={stockBadgeVariant(p)}>{stockBadgeLabel(p)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm text-foreground/80">{p.supplierName || '—'}</span>
                      {p.supplierLink && (
                        <a
                          href={p.supplierLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-0.5"
                        >
                          <ExternalLink className="h-3 w-3" /> Open Link
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link to={`/spare-parts/${p._id}/edit`}>
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Dialog open={deleteId === p._id} onOpenChange={(o) => !o && setDeleteId(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(p._id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Spare Part</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete <span className="font-semibold text-foreground">"{p.partName}"</span>? This action cannot be undone.
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
                  <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
                    <Cpu className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium text-foreground/60">{search ? 'No spare parts match your search' : 'No spare parts found'}</p>
                    {!search && (
                      <Button variant="link" asChild className="mt-1 text-sm">
                        <Link to="/spare-parts/new">Add your first spare part</Link>
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
