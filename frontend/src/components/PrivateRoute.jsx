import { Navigate } from 'react-router-dom'

export default function PrivateRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  if (!user?.token) {
    return <Navigate to="/login" replace />
  }
  return children
}
