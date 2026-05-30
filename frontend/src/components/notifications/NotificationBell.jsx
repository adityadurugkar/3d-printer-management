import { useState, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useSocket } from '../../context/SocketContext'
import { Button } from '../ui/button'
import NotificationDropdown from './NotificationDropdown'

export default function NotificationBell() {
  const { unreadCount } = useSocket()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        className="relative rounded-xl"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-destructive text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-destructive/30">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 origin-top-right animate-scale-in">
          <NotificationDropdown onClose={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
