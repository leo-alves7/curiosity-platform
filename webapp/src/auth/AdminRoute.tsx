import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

function AdminRoute() {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const isAdmin = useSelector((state: RootState) => state.auth.isAdmin)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}

export default AdminRoute
