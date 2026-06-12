import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Printer, Wrench, Package, Cpu, Users,
  BarChart3, FileText, Bell, Settings, X, ChevronLeft, ChevronRight,
  ChevronDown, Activity,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '../lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/printers', label: 'Printers', icon: Printer },
  { to: '/repairs', label: 'Repairs', icon: Wrench },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/spare-parts', label: 'Spare Parts', icon: Cpu },
  { to: '/technicians', label: 'Technicians', icon: Users },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/reports', label: 'Reports', icon: FileText },
]

const bottomLinks = [
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const statusColors = {
  overview: 'from-cyan-400 to-blue-500',
  printers: 'from-emerald-400 to-teal-500',
  repairs: 'from-amber-400 to-orange-500',
  inventory: 'from-violet-400 to-purple-500',
  'spare-parts': 'from-pink-400 to-rose-500',
  technicians: 'from-indigo-400 to-blue-500',
  analytics: 'from-cyan-400 to-sky-500',
  reports: 'from-emerald-400 to-green-500',
}

function getSection(path) {
  const p = path.replace('/dashboard', 'overview').split('/')[1]
  return statusColors[p] || statusColors.overview
}

export default function Sidebar({ open, collapsed, onClose, onToggleCollapse }) {
  const location = useLocation()
  const currentSection = getSection(location.pathname)
  const [hoveredItem, setHoveredItem] = useState(null)

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full flex flex-col glass-sidebar',
          'transition-all duration-300 ease-in-out',
          'lg:translate-x-0 lg:static lg:z-auto',
          collapsed ? 'w-[72px]' : 'w-64',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Premium Header */}
        <div className={cn(
          'flex items-center border-b border-white/[0.06] h-16 flex-shrink-0',
          collapsed ? 'justify-center px-0' : 'justify-between px-4'
        )}>
          {collapsed ? (
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 neon-glow">
                <Printer className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#05050f]" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 neon-glow">
                  <Printer className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#05050f]" />
              </div>
              <div className="leading-tight">
                <p className="font-bold text-base text-white">PHN</p>
                <p className="text-[10px] text-white/35 tracking-wide uppercase">3D Printer Fleet</p>
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

        {/* Active Section Indicator */}
        {!collapsed && (
          <div className="px-4 pt-3 pb-1">
            <div className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg',
              'bg-gradient-to-r opacity-90',
              currentSection
            )}>
              <Activity className="h-3 w-3 text-white" />
              <span className="text-[11px] font-medium text-white capitalize tracking-wide">
                {location.pathname.replace('/', '').replace('-', ' ') || 'Overview'}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {links.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
            return (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                onMouseEnter={() => setHoveredItem(label)}
                onMouseLeave={() => setHoveredItem(null)}
                className="block"
              >
                <div
                  className={cn(
                    'group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200',
                    collapsed ? 'justify-center h-11 w-full' : 'gap-3 px-3 py-2.5'
                  )}
                >
                  {isActive && !collapsed && (
                    <motion.div
                      layoutId="sidebarActive"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {isActive && collapsed && (
                    <motion.div
                      layoutId="sidebarActiveCollapsed"
                      className="absolute inset-0 rounded-xl bg-primary/20 border border-primary/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <div className={cn(
                    'relative flex items-center justify-center transition-all duration-200',
                    collapsed ? 'w-9 h-9 rounded-lg' : 'w-9 h-9 rounded-lg',
                    isActive && collapsed ? 'bg-primary/20 text-primary shadow-lg shadow-primary/10' : '',
                    !isActive && collapsed ? 'text-white/40 group-hover:text-white/70 group-hover:bg-white/[0.04]' : '',
                    isActive && !collapsed ? 'text-primary' : '',
                    !isActive && !collapsed ? 'text-white/40 group-hover:text-white/70' : ''
                  )}>
                    <Icon className={cn('h-[18px] w-[18px] flex-shrink-0 transition-transform', isActive && 'scale-110')} />
                  </div>
                  {!collapsed && (
                    <span className={cn(
                      'relative tracking-wide',
                      isActive ? 'text-white font-semibold' : 'text-white/50 group-hover:text-white/80'
                    )}>
                      {label}
                    </span>
                  )}
                  {isActive && !collapsed && (
                    <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-primary shadow-lg shadow-primary/50" />
                  )}
                </div>
              </NavLink>
            )
          })}
        </nav>

        {/* Bottom Links */}
        <div className="px-2 py-1 border-t border-white/[0.06]">
          {bottomLinks.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to
            return (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className="block"
              >
                <div className={cn(
                  'group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200',
                  collapsed ? 'justify-center h-11 w-full' : 'gap-3 px-3 py-2.5'
                )}>
                  {isActive && (
                    <motion.div
                      layoutId="sidebarBottomActive"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-primary/5 border border-primary/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <div className={cn(
                    'flex items-center justify-center transition-all duration-200',
                    collapsed ? 'w-9 h-9 rounded-lg' : 'w-9 h-9 rounded-lg',
                    isActive ? 'bg-primary/20 text-primary' : 'text-white/40 group-hover:text-white/70'
                  )}>
                    <Icon className={cn('h-[18px] w-[18px] flex-shrink-0')} />
                  </div>
                  {!collapsed && (
                    <span className={cn(
                      'relative tracking-wide',
                      isActive ? 'text-white font-semibold' : 'text-white/50 group-hover:text-white/80'
                    )}>
                      {label}
                    </span>
                  )}
                </div>
              </NavLink>
            )
          })}
        </div>

        {/* Collapse Toggle */}
        <div className="px-2 py-2 border-t border-white/[0.06]">
          <button
            onClick={onToggleCollapse}
            className={cn(
              'w-full flex items-center rounded-xl text-sm font-medium transition-all duration-200 text-white/30 hover:text-white/60 hover:bg-white/[0.04]',
              collapsed ? 'justify-center h-10' : 'gap-3 px-3 py-2.5'
            )}
          >
            <ChevronLeft className={cn(
              'h-4 w-4 transition-transform duration-300',
              collapsed && 'rotate-180'
            )} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="p-3 border-t border-white/[0.06]">
            <div className="bg-white/[0.03] rounded-xl p-3 text-center backdrop-blur-md">
              <p className="text-xs text-white/30">PHN 3D Printer Fleet</p>
              <p className="text-[10px] text-white/15">v2.0 • Enterprise</p>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
