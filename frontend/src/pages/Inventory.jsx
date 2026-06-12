import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Package, Search } from 'lucide-react'
import { inventoryAPI } from '../api'
import { useSort } from '../hooks/useSort'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, SortableHead } from '../components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { cn } from '../lib/utils'

export default function Inventory() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')

  const fetchData = () => {
    setLoading(true)
    inventoryAPI.getAll().then(({ data }) => setItems(data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const { sortColumn, sortDirection, toggleSort, getSortedData } = useSort()

  const handleDelete = async () => {
    if (!deleteId) return
    await inventoryAPI.delete(deleteId)
    setDeleteId(null)
    fetchData()
  }

  const filtered = useMemo(() =>
    items.filter(item =>
      item.partName?.toLowerCase().includes(search.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(search.toLowerCase())
    ),
    [items, search]
  )

  const sorted = useMemo(() => getSortedData(filtered), [filtered, getSortedData])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <Package className="h-5 w-5 animate-pulse mr-2" /> Loading...
    </div>
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Package className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Inventory</h1>
            <p className="page-subtitle">Manage spare parts and supplies</p>
          </div>
        </div>
        <Button asChild className="h-9 gap-1.5">
          <Link to="/inventory/new">
            <Plus className="h-4 w-4" /> Add Part
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden glass-card">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle>
            All Parts
            <span className="text-muted-foreground font-normal ml-1.5 text-sm">({filtered.length})</span>
          </CardTitle>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="Search inventory..."
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
                <SortableHead column="partName" sortColumn={sortColumn} sortDirection={sortDirection} onSort={toggleSort}>Part Name</SortableHead>
                <SortableHead column="quantity" sortColumn={sortColumn} sortDirection={sortDirection} onSort={toggleSort}>Quantity</SortableHead>
                <TableHead>Compatible Printers</TableHead>
                <TableHead>Price</TableHead>
                <SortableHead column="supplier" sortColumn={sortColumn} sortDirection={sortDirection} onSort={toggleSort}>Supplier</SortableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((item) => (
                <TableRow key={item._id}>
                  <TableCell className="font-semibold text-foreground">{item.partName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={cn(item.quantity <= 5 ? 'text-destructive font-bold' : 'font-medium text-foreground')}>
                        {item.quantity}
                      </span>
                      {item.quantity <= 5 && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Low</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground text-xs">
                    {item.compatiblePrinters?.join(', ') || '—'}
                  </TableCell>
                  <TableCell className="font-mono text-foreground/80">${item.price?.toFixed(2)}</TableCell>
                  <TableCell className="text-foreground/80">{item.supplier}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link to={`/inventory/${item._id}/edit`}>
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Dialog open={deleteId === item._id} onOpenChange={(o) => !o && setDeleteId(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(item._id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Part</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete <span className="font-semibold text-foreground">"{item.partName}"</span>? This action cannot be undone.
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
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium text-foreground/60">{search ? 'No items match your search' : 'No inventory items'}</p>
                    {!search && (
                      <Button variant="link" asChild className="mt-1 text-sm">
                        <Link to="/inventory/new">Add your first part</Link>
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
