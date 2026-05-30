import { NavLink } from 'react-router-dom'
import {
  Printer,
  Wrench,
  Package,
  Users,
  LayoutDashboard,
  X
} from 'lucide-react'
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
      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 flex flex-col',
          'bg-black/40 backdrop-blur-xl border-r border-white/10',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >

        {/* HEADER */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            
            {/* LOGO */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg">
              <Printer className="h-4 w-4 text-white" />
            </div>

            <div className="leading-tight">
              <p className="font-bold text-white">PrintFlow</p>
              <p className="text-[10px] text-white/40">Admin Panel</p>
            </div>

          </div>

          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="lg:hidden text-white/50 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">

          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                  
                  isActive
                    ? 'bg-white/10 text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* ACTIVE INDICATOR BAR */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-r-full" />
                  )}

                  <Icon
                    className={cn(
                      'h-4 w-4 flex-shrink-0 transition',
                      isActive ? 'text-white' : 'text-white/40 group-hover:text-white'
                    )}
                  />

                  <span className="tracking-wide">{label}</span>
                </>
              )}
            </NavLink>
          ))}

        </nav>

        {/* FOOTER */}
        <div className="p-4 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-3 text-center backdrop-blur-md">
            <p className="text-xs text-white/40">PrintFlow System</p>
            <p className="text-[10px] text-white/20">v1.0.0 • Admin Dashboard</p>
          </div>
        </div>

      </aside>
    </>
  )
}