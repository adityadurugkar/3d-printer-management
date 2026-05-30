import { Navigate } from "react-router-dom"
import { getUser } from "../lib/auth"

export default function PrivateRoute({ children }) {
  const user = getUser()

  if (!user?.token) {
    return <Navigate to="/login" />
  }

  return children
}