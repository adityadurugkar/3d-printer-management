import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Printer } from 'lucide-react'
import { printerAPI } from '../api'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '../components/ui/dialog'

const statusVariant = (s) =>
  s === 'active' ? 'success' :
  s === 'maintenance' ? 'warning' :
  s === 'inactive' ? 'secondary' : 'destructive'

export default function Printers() {
  const [printers, setPrinters] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)

  const fetchData = () => {
    setLoading(true)
    printerAPI.getAll().then(({ data }) => setPrinters(data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleDelete = async () => {
    if (!deleteId) return
    await printerAPI.delete(deleteId)
    setDeleteId(null)
    fetchData()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <Printer className="h-5 w-5 animate-pulse mr-2" /> Loading...
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Printers</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your 3D printer fleet</p>
        </div>
        <Button asChild>
          <Link to="/printers/new">
            <Plus className="h-4 w-4 mr-2" /> Add Printer
          </Link>
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-0">
          <CardTitle className="text-base font-semibold">
            All Printers <span className="text-muted-foreground font-normal">({printers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Serial</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {printers.map((p) => (
                <TableRow key={p._id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.brand}</TableCell>
                  <TableCell>{p.model}</TableCell>
                  <TableCell className="text-muted-foreground font-mono text-xs">{p.serialNumber}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/printers/${p._id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Dialog open={deleteId === p._id} onOpenChange={(o) => !o && setDeleteId(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(p._id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Printer</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete "{p.name}"? This action cannot be undone.
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
              {printers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <Printer className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No printers found</p>
                    <Button variant="link" asChild className="mt-2">
                      <Link to="/printers/new">Add your first printer</Link>
                    </Button>
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
