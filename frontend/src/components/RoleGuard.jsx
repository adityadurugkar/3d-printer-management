import { Navigate } from 'react-router-dom'
import { getUser } from '../lib/auth'

export default function RoleGuard({ roles, children }) {
  const user = getUser()
  if (!user?.token) {
    return <Navigate to="/login" />
  }
  if (!roles.includes(user?.role || '')) {
    return <Navigate to="/dashboard" />
  }
  return children
}
