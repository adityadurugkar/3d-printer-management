import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import {
  Menu, LogOut, Search, User, Settings, ChevronDown,
  Sun, Moon, Maximize2, HelpCircle,
} from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '../lib/utils'
import { useTheme } from './theme-provider'
import NotificationBell from './notifications/NotificationBell'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar({ onMenuClick, sidebarCollapsed }) {
  const navigate = useNavigate()
  const location = useLocation()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const { theme, toggleTheme } = useTheme()
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const profileRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const pageNames = {
    '/dashboard': 'Dashboard',
    '/tech-dashboard': 'My Dashboard',
    '/printers': 'Printers',
    '/repairs': 'Repairs',
    '/inventory': 'Inventory',
    '/spare-parts': 'Spare Parts',
    '/technicians': 'Technicians',
    '/users': 'Users',
    '/analytics': 'Analytics',
    '/reports': 'Reports',
    '/notifications': 'Notifications',
    '/settings': 'Settings',
  }

  const currentPage = Object.entries(pageNames).find(([path]) =>
    location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path))
  )?.[1] || 'Dashboard'

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    const q = searchQuery.toLowerCase()
    if (q.includes('printer')) navigate('/printers')
    else if (q.includes('repair')) navigate('/repairs')
    else if (q.includes('inventory') || q.includes('part')) navigate('/inventory')
    else if (q.includes('technician')) navigate('/technicians')
    else if (q.includes('spare')) navigate('/spare-parts')
    else if (q.includes('setting')) navigate('/settings')
    else if (q.includes('analytic') || q.includes('chart') || q.includes('report')) navigate('/dashboard')
    setSearchQuery('')
    setSearchOpen(false)
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 gap-4">
        {/* Left: Menu + Page Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden -ml-2 text-foreground/60 hover:text-foreground">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden sm:flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50 animate-pulse-soft" />
              <h1 className="text-base font-bold text-foreground truncate">{currentPage}</h1>
            </div>
            <p className="text-[11px] text-muted-foreground/60 tracking-wide uppercase ml-4">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Global Search */}
          <div ref={searchRef} className="relative hidden sm:block">
            <AnimatePresence>
              {searchOpen ? (
                <motion.form
                  initial={{ width: 40, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 40, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSearch}
                  className="relative"
                >
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <input
                    type="text"
                    placeholder="Search printers, repairs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                    autoFocus
                    className="w-full h-9 pl-9 pr-4 rounded-xl border border-border/60 bg-card text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                </motion.form>
              ) : (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSearchOpen(true)}
                  className="rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 h-9 w-9"
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Search */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSearchOpen(!searchOpen)}
            className="rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 h-9 w-9 sm:hidden"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            className="rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 h-9 w-9"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {/* Full Screen */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => document.documentElement.requestFullscreen?.()}
            className="rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 h-9 w-9 hidden sm:flex"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>

          {/* Notifications */}
          <NotificationBell />

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-muted/60 transition-colors border border-transparent hover:border-border/40"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-cyan-500/20">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-foreground leading-tight">{user?.name || 'User'}</p>
                <p className="text-[10px] text-muted-foreground/60 leading-tight">{user?.role || 'Admin'}</p>
              </div>
              <ChevronDown className={cn(
                'h-3 w-3 text-muted-foreground hidden sm:block transition-transform duration-200',
                profileOpen && 'rotate-180'
              )} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 origin-top-right"
                >
                  <div className="bg-card border border-border/60 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden backdrop-blur-xl">
                    <div className="px-4 py-3 border-b border-border/40">
                      <p className="text-sm font-semibold text-foreground">{user?.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                    </div>
                    <div className="p-1.5 space-y-0.5">
                      <button
                        onClick={() => { setProfileOpen(false); navigate('/settings') }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground/80 hover:bg-muted transition-colors"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        Profile
                      </button>
                      <button
                        onClick={() => { setProfileOpen(false); navigate('/settings') }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground/80 hover:bg-muted transition-colors"
                      >
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        Settings
                      </button>
                      <button
                        onClick={() => { setProfileOpen(false) }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-foreground/80 hover:bg-muted transition-colors"
                      >
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        Help & Support
                      </button>
                      <div className="border-t border-border/40 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}


