import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Users, Search } from 'lucide-react'
import { technicianAPI, repairAPI } from '../api'
import { useSort } from '../hooks/useSort'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, SortableHead } from '../components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'

const statusVariant = (s) =>
  s === 'available' ? 'success' :
  s === 'busy' ? 'warning' : 'secondary'

export default function Technicians() {
  const [technicians, setTechnicians] = useState([])
  const [repairs, setRepairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      technicianAPI.getAll(),
      repairAPI.getAll(),
    ]).then(([{ data: techs }, { data: reps }]) => {
      setTechnicians(techs)
      setRepairs(reps)
    }).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const { sortColumn, sortDirection, toggleSort, getSortedData } = useSort()

  const handleDelete = async () => {
    if (!deleteId) return
    await technicianAPI.delete(deleteId)
    setDeleteId(null)
    fetchData()
  }

  const enriched = useMemo(() =>
    technicians.map((t) => ({
      ...t,
      repairsCompleted: repairs.filter(
        (r) => r.technicianName === t.name && r.status === 'completed'
      ).length,
      activeRepairs: repairs.filter(
        (r) => r.technicianName === t.name && r.status === 'in-progress'
      ).length,
    })),
    [technicians, repairs]
  )

  const filtered = useMemo(() =>
    enriched.filter(t =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase()) ||
      t.specialization?.toLowerCase().includes(search.toLowerCase())
    ),
    [enriched, search]
  )

  const sorted = useMemo(() => getSortedData(filtered), [filtered, getSortedData])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-muted-foreground">
      <Users className="h-5 w-5 animate-pulse mr-2" /> Loading...
    </div>
  )

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Technicians</h1>
            <p className="page-subtitle">Manage your technical staff</p>
          </div>
        </div>
        <Button asChild className="h-9 gap-1.5">
          <Link to="/technicians/new">
            <Plus className="h-4 w-4" /> Add Technician
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden glass-card">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle>
            All Technicians
            <span className="text-muted-foreground font-normal ml-1.5 text-sm">({filtered.length})</span>
          </CardTitle>
          <div className="relative w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="Search technicians..."
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
                <SortableHead column="name" sortColumn={sortColumn} sortDirection={sortDirection} onSort={toggleSort}>Name</SortableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Specialization</TableHead>
                <SortableHead column="repairsCompleted" sortColumn={sortColumn} sortDirection={sortDirection} onSort={toggleSort}>Completed</SortableHead>
                <SortableHead column="activeRepairs" sortColumn={sortColumn} sortDirection={sortDirection} onSort={toggleSort}>Active</SortableHead>
                <SortableHead column="status" sortColumn={sortColumn} sortDirection={sortDirection} onSort={toggleSort}>Status</SortableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((t) => (
                <TableRow key={t._id}>
                  <TableCell className="font-semibold text-foreground">{t.name}</TableCell>
                  <TableCell className="text-foreground/80">{t.email}</TableCell>
                  <TableCell className="text-muted-foreground">{t.phone || '—'}</TableCell>
                  <TableCell className="text-foreground/80">{t.specialization || '—'}</TableCell>
                  <TableCell className="text-center font-medium text-foreground/80">{t.repairsCompleted}</TableCell>
                  <TableCell className="text-center">
                    {t.activeRepairs > 0 ? (
                      <span className="font-medium text-amber-500">{t.activeRepairs}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(t.status)}>{t.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" asChild>
                        <Link to={`/technicians/${t._id}/edit`}>
                          <Edit className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Dialog open={deleteId === t._id} onOpenChange={(o) => !o && setDeleteId(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon-sm" className="text-destructive/70 hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteId(t._id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Technician</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete <span className="font-semibold text-foreground">"{t.name}"</span>? This action cannot be undone.
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
                  <TableCell colSpan={8} className="text-center py-16 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium text-foreground/60">{search ? 'No technicians match your search' : 'No technicians found'}</p>
                    {!search && (
                      <Button variant="link" asChild className="mt-1 text-sm">
                        <Link to="/technicians/new">Add a technician</Link>
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
