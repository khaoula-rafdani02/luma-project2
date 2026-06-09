import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function PrivateRoute() {
  const { isAuthenticated, user } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (user?.role === 'admin') return <Navigate to="/admin" replace />
  return <Outlet />
}