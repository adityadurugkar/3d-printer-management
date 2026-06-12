import { useState, useEffect, useRef } from 'react'
import {
  Save, Upload, Trash2, Download, Upload as UploadIcon,
  Building2, Lock, Palette, Database, Camera, User as UserIcon,
  Eye, EyeOff,
} from 'lucide-react'
import { settingsAPI } from '../api'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

const tabs = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'backup', label: 'Backup & Restore', icon: Database },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('company')
  const [settings, setSettings] = useState(null)
  const [form, setForm] = useState({
    companyName: '', address: '', phone: '', email: '', website: '', taxId: '',
    accentColor: '#6366f1', dateFormat: 'MM/DD/YYYY', timezone: 'UTC',
  })
  const [profileForm, setProfileForm] = useState({ name: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [logo, setLogo] = useState(null)
  const [avatar, setAvatar] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false })
  const logoRef = useRef(null)
  const avatarRef = useRef(null)
  const restoreRef = useRef(null)

  useEffect(() => {
    settingsAPI.get().then(({ data }) => {
      setSettings(data)
      setForm({
        companyName: data.companyName || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        taxId: data.taxId || '',
        accentColor: data.accentColor || '#6366f1',
        dateFormat: data.dateFormat || 'MM/DD/YYYY',
        timezone: data.timezone || 'UTC',
      })
      if (data.logo) setLogoPreview(data.logo)
    })
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setProfileForm({ name: user.name || '', email: user.email || '' })
    if (user.avatar) setAvatarPreview(user.avatar)
  }, [])

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleCompanySave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (logo) fd.append('logo', logo)
      const { data } = await settingsAPI.update(fd)
      setSettings(data)
      showMessage('success', 'Settings saved successfully')
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to save settings')
    } finally { setSaving(false) }
  }

  const handleProfileSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', profileForm.name)
      fd.append('email', profileForm.email)
      if (avatar) fd.append('avatar', avatar)
      const { data } = await settingsAPI.updateProfile(fd)
      const stored = JSON.parse(localStorage.getItem('user') || '{}')
      localStorage.setItem('user', JSON.stringify({ ...stored, ...data }))
      showMessage('success', 'Profile updated successfully')
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to update profile')
    } finally { setSaving(false) }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'Passwords do not match'); return
    }
    setSaving(true)
    try {
      await settingsAPI.changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      showMessage('success', 'Password changed successfully')
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to change password')
    } finally { setSaving(false) }
  }

  const handleBackup = async () => {
    try {
      const { data } = await settingsAPI.backup()
      const url = window.URL.createObjectURL(new Blob([data]))
      const a = document.createElement('a'); a.href = url; a.download = `backup-${Date.now()}.json`
      a.click(); window.URL.revokeObjectURL(url)
      showMessage('success', 'Backup downloaded successfully')
    } catch (err) {
      showMessage('error', 'Failed to create backup')
    }
  }

  const handleRestore = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await settingsAPI.restore(data)
      showMessage('success', 'Data restored successfully')
    } catch (err) {
      showMessage('error', 'Failed to restore data. Check file format.')
    }
  }

  const handleDeleteLogo = async () => {
    try {
      await settingsAPI.deleteLogo()
      setLogoPreview(null); setLogo(null)
      showMessage('success', 'Logo removed')
    } catch (err) {
      showMessage('error', 'Failed to remove logo')
    }
  }

  return (
    <div className="page-container">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-500 to-slate-600 flex items-center justify-center shadow-lg shadow-gray-500/20">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Manage system configuration and preferences</p>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`mb-4 px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${
          message.type === 'error'
            ? 'bg-destructive/10 border border-destructive/30 text-destructive'
            : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            message.type === 'error' ? 'bg-destructive' : 'bg-emerald-500'
          }`} />
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6 border-b border-border/40 pb-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'company' && (
        <form onSubmit={handleCompanySave}>
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                </div>
                <CardTitle>Company Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" value={form.companyName} onChange={(e) => setForm({...form, companyName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / VAT</Label>
                  <Input id="taxId" value={form.taxId} onChange={(e) => setForm({...form, taxId: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Company Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" value={form.website} onChange={(e) => setForm({...form, website: e.target.value})} placeholder="https://" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="relative">
                      <img src={logoPreview} alt="Logo" className="h-16 w-16 rounded-xl object-cover border border-border" />
                      <button type="button" onClick={handleDeleteLogo} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div>
                    <input ref={logoRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setLogo(f); setLogoPreview(URL.createObjectURL(f)) } }} className="hidden" />
                    <Button type="button" variant="outline" onClick={() => logoRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" /> Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG. Max 2MB.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2 items-center">
                    <Input id="accentColor" type="color" value={form.accentColor} onChange={(e) => setForm({...form, accentColor: e.target.value})} className="w-12 h-10 p-1 cursor-pointer" />
                    <span className="text-sm text-muted-foreground">{form.accentColor}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <select id="dateFormat" value={form.dateFormat} onChange={(e) => setForm({...form, dateFormat: e.target.value})} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <select id="timezone" value={form.timezone} onChange={(e) => setForm({...form, timezone: e.target.value})} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                    <option value="America/Chicago">America/Chicago (CST)</option>
                    <option value="America/Denver">America/Denver (MST)</option>
                    <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="Europe/Berlin">Europe/Berlin (CET)</option>
                    <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
                    <option value="Australia/Sydney">Australia/Sydney (AEST)</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSave}>
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-indigo-500" />
                </div>
                <CardTitle>Profile Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border border-border" />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                      {profileForm.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                    </div>
                  )}
                  <button type="button" onClick={() => avatarRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input ref={avatarRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setAvatar(f); setAvatarPreview(URL.createObjectURL(f)) } }} className="hidden" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{profileForm.name || 'User'}</p>
                  <p className="text-sm text-muted-foreground">{profileForm.email || ''}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profileName">Full Name</Label>
                  <Input id="profileName" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profileEmail">Email</Label>
                  <Input id="profileEmail" type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} required />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Update Profile'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {activeTab === 'password' && (
        <form onSubmit={handlePasswordChange}>
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-indigo-500" />
                </div>
                <CardTitle>Change Password</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 max-w-md">
              {['current', 'new', 'confirm'].map((field) => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={`pw-${field}`}>
                    {field === 'current' ? 'Current Password' : field === 'new' ? 'New Password' : 'Confirm New Password'}
                  </Label>
                  <div className="relative">
                    <Input
                      id={`pw-${field}`}
                      type={showPassword[field] ? 'text' : 'password'}
                      value={passwordForm[field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']}
                      onChange={(e) => setPasswordForm({ ...passwordForm, [field === 'current' ? 'currentPassword' : field === 'new' ? 'newPassword' : 'confirmPassword']: e.target.value })}
                      required
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPassword({ ...showPassword, [field]: !showPassword[field] })} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword[field] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={saving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}>
                  <Lock className="h-4 w-4 mr-2" /> {saving ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}

      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Download className="w-4 h-4 text-emerald-500" />
                </div>
                <CardTitle>Export Backup</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Download a complete JSON backup of all data including printers, repairs, inventory, spare parts, and technicians.</p>
              <Button onClick={handleBackup} variant="outline">
                <Download className="h-4 w-4 mr-2" /> Download Backup
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <UploadIcon className="w-4 h-4 text-amber-500" />
                </div>
                <CardTitle>Restore Backup</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Restore from a previously downloaded JSON backup file. This will overwrite all existing data.</p>
              <input ref={restoreRef} type="file" accept=".json" onChange={handleRestore} className="hidden" />
              <Button onClick={() => restoreRef.current?.click()} variant="outline">
                <UploadIcon className="h-4 w-4 mr-2" /> Restore from File
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
