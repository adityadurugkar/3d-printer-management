import { useNavigate } from 'react-router-dom'
import { Menu, LogOut } from 'lucide-react'
import { Button } from './ui/button'
import ThemeToggle from './theme-toggle'

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/90 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden -ml-2">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">Welcome back,</span>
            <span className="text-sm font-bold text-foreground">{user?.name || 'User'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
