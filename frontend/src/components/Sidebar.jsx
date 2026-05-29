import { NavLink } from 'react-router-dom'
import { Printer, Wrench, Package, Users, LayoutDashboard, X } from 'lucide-react'
import { cn } from '../lib/utils'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/printers', label: 'Printers', icon: Printer },
  { to: '/repairs', label: 'Repairs', icon: Wrench },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/technicians', label: 'Technicians', icon: Users },
]

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full w-64 glass-sidebar flex flex-col',
        'transition-transform duration-300 ease-in-out',
        'lg:translate-x-0 lg:static lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between p-6 border-b border-border/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Printer className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-white">PrintFlow</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/50 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 relative',
                isActive
                  ? 'bg-sidebar-active text-white shadow-lg shadow-sidebar-active/20'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-white' : 'text-white/50 group-hover:text-white')} />
                  <span>{label}</span>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <p className="text-xs text-white/30 text-center">PrintFlow v1.0.0</p>
        </div>
      </aside>
    </>
  )
}
