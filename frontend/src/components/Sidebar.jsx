import { NavLink } from 'react-router-dom'
import {
  Printer,
  Wrench,
  Package,
  Users,
  LayoutDashboard,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '../lib/utils'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/printers', label: 'Printers', icon: Printer },
  { to: '/repairs', label: 'Repairs', icon: Wrench },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/technicians', label: 'Technicians', icon: Users },
]

export default function Sidebar({ open, collapsed, onClose, onToggleCollapse }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full flex flex-col',
          'bg-[#0b0b1a] border-r border-white/[0.06]',
          'transition-all duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          collapsed ? 'w-20' : 'w-64',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* HEADER */}
        <div className={cn(
          'flex items-center border-b border-white/[0.06] h-16',
          collapsed ? 'justify-center px-0' : 'justify-between px-5'
        )}>
          {collapsed ? (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Printer className="h-5 w-5 text-white" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Printer className="h-5 w-5 text-white" />
              </div>
              <div className="leading-tight">
                <p className="font-bold text-base text-white">PrintFlow</p>
                <p className="text-[10px] text-white/35 tracking-wide uppercase">Admin Panel</p>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="lg:hidden text-white/40 hover:text-white transition-colors"
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
                  'group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200',
                  collapsed ? 'justify-center h-11 w-full' : 'gap-3 px-4 py-2.5',
                  isActive
                    ? 'bg-gradient-to-r from-violet-500/15 to-indigo-500/10 text-white shadow-sm'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && !collapsed && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-violet-400 to-indigo-500 rounded-r-full" />
                  )}
                  {isActive && collapsed && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-violet-400 to-indigo-500 rounded-r-full" />
                  )}
                  <div className={cn(
                    'flex items-center justify-center',
                    collapsed ? 'w-10 h-10 rounded-xl' : '',
                    isActive && collapsed
                      ? 'bg-violet-500/20 text-violet-300'
                      : collapsed
                        ? 'text-white/40 group-hover:text-white/70 group-hover:bg-white/[0.04]'
                        : ''
                  )}>
                    <Icon className={cn(
                      'h-4.5 w-4.5 flex-shrink-0 transition',
                      collapsed ? 'h-5 w-5' : '',
                      isActive && !collapsed ? 'text-violet-300' : ''
                    )} />
                  </div>
                  {!collapsed && (
                    <span className="tracking-wide">{label}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* COLLAPSE TOGGLE */}
        <div className="p-3 border-t border-white/[0.06]">
          <button
            onClick={onToggleCollapse}
            className={cn(
              'w-full flex items-center rounded-xl text-sm font-medium transition-all duration-200 text-white/30 hover:text-white/60 hover:bg-white/[0.04]',
              collapsed ? 'justify-center h-10' : 'gap-3 px-4 py-2.5'
            )}
          >
            <ChevronLeft className={cn(
              'h-4 w-4 transition-transform duration-300',
              collapsed && 'rotate-180'
            )} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* FOOTER */}
        {!collapsed && (
          <div className="p-4 border-t border-white/[0.06]">
            <div className="bg-white/[0.03] rounded-xl p-3 text-center backdrop-blur-md">
              <p className="text-xs text-white/30">PrintFlow System</p>
              <p className="text-[10px] text-white/15">v1.0.0 • Enterprise</p>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
