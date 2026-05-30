import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { Menu, LogOut, Search, User, Settings, ChevronDown } from 'lucide-react'
import { Button } from './ui/button'
import ThemeToggle from './theme-toggle'
import NotificationBell from './notifications/NotificationBell'

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
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

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden -ml-2">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Welcome back,</span>
            <span className="text-sm font-bold text-foreground">{user?.name || 'User'}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <NotificationBell />
          <ThemeToggle />

          {/* Profile Dropdown */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-muted/60 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {initials}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right animate-scale-in">
                <div className="bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
