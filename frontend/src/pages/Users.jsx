import { useState, useEffect, useMemo } from 'react'
import { Plus, Edit, Trash2, Users as UsersIcon, Search, Shield, UserCheck, UserX } from 'lucide-react'
import { userAPI } from '../api'
import { useSort } from '../hooks/useSort'
import { getUser } from '../lib/auth'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, SortableHead } from '../components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '../components/ui/dialog'
import { Label } from '../components/ui/label'

const roleVariant = (r) =>
  r === 'admin' ? 'warning' : 'default'

const statusVariant = (s) =>
  s === 'active' ? 'success' : 'secondary'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [search, setSearch] = useState('')
  const [editUser, setEditUser] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'technician' })
  const currentUser = getUser()

  const fetchData = () => {
    setLoading(true)
    userAPI.getAll().then(({ data }) => setUsers(data)).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const { sortColumn, sortDirection, toggleSort, getSortedData } = useSort()

  const handleDelete = async () => {
    if (!deleteId) return
    await userAPI.delete(deleteId)
    setDeleteId(null)
    fetchData()
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    await userAPI.create(form)
    setCreateOpen(false)
    setForm({ name: '', email: '', password: '', role: 'technician' })
    fetchData()
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!editUser) return
    await userAPI.update(editUser._id, { name: editUser.name, email: editUser.email, role: editUser.role, status: editUser.status })
    setEditUser(null)
    fetchData()
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return getSortedData(users)
    const q = search.toLowerCase()
    return getSortedData(users.filter((u) =>
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    ))
  }, [search, users, sortColumn, sortDirection])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <UsersIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle>Users</CardTitle>
                <p className="text-sm text-muted-foreground">{users.length} registered users</p>
              </div>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-500/20">
                  <Plus className="h-4 w-4 mr-2" /> Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleCreate}>
                  <DialogHeader>
                    <DialogTitle>Create User</DialogTitle>
                    <DialogDescription>Add a new user to the system</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input
                        required
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Min 6 characters"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <select
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        className="w-full h-10 rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                      >
                        <option value="technician">Technician</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
                    <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">Create User</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              placeholder="Search users by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHead column="name" current={sortColumn} direction={sortDirection} onClick={toggleSort}>Name</SortableHead>
                <SortableHead column="email" current={sortColumn} direction={sortDirection} onClick={toggleSort}>Email</SortableHead>
                <SortableHead column="role" current={sortColumn} direction={sortDirection} onClick={toggleSort}>Role</SortableHead>
                <SortableHead column="status" current={sortColumn} direction={sortDirection} onClick={toggleSort}>Status</SortableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    {search ? 'No users match your search' : 'No users found'}
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleVariant(user.role)}>
                      <Shield className="h-3 w-3 mr-1" />
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(user.status)}>
                      {user.status === 'active' ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Dialog open={editUser?._id === user._id} onOpenChange={(open) => { if (!open) setEditUser(null) }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setEditUser({ ...user })}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <form onSubmit={handleUpdate}>
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                              <DialogDescription>Update user details</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                  required
                                  value={editUser?.name || ''}
                                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                  required
                                  type="email"
                                  value={editUser?.email || ''}
                                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Role</Label>
                                <select
                                  value={editUser?.role || 'technician'}
                                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                                  className="w-full h-10 rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                                >
                                  <option value="technician">Technician</option>
                                  <option value="admin">Admin</option>
                                </select>
                              </div>
                              <div className="space-y-2">
                                <Label>Status</Label>
                                <select
                                  value={editUser?.status || 'active'}
                                  onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
                                  className="w-full h-10 rounded-xl border border-border/60 bg-card px-3 text-sm text-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                                >
                                  <option value="active">Active</option>
                                  <option value="inactive">Inactive</option>
                                </select>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button type="button" variant="ghost" onClick={() => setEditUser(null)}>Cancel</Button>
                              <Button type="submit">Save Changes</Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                      {user._id !== currentUser?._id && (
                        <>
                          <Dialog open={deleteId === user._id} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setDeleteId(user._id)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete User</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete {user.name}? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
                                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
