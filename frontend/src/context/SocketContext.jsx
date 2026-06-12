import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { io } from 'socket.io-client'
import api from '../api'

const SOCKET_URL = import.meta.env.DEV ? 'http://localhost:5000' : 'https://threed-printer-management.onrender.com'

export const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  useEffect(() => {
    if (!user?.token) return

    const s = io(SOCKET_URL, {
      auth: { token: user.token },
      transports: ['websocket', 'polling'],
    })

    s.on('connect', () => {})

    s.on('notification:new', (notification) => {
      setNotifications((prev) => [notification, ...prev])
      setUnreadCount((prev) => prev + 1)
    })

    s.on('notifications:read-all', () => {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    })

    setSocket(s)

    return () => s.disconnect()
  }, [user?.token])

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications')
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch {}
  }, [])

  const markAsRead = useCallback(async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {}
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all')
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {}
  }, [])

  useEffect(() => {
    if (user?.token) fetchNotifications()
  }, [user?.token, fetchNotifications])

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
