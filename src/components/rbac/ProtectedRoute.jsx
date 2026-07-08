import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../App'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'Admin') return <Navigate to="/admin/company" replace />
    if (user.role === 'Bếp' || user.role === 'Kitchen') return <Navigate to="/admin/kitchen" replace />
    if (user.role === 'Nhân viên' || user.role === 'Waiter') return <Navigate to="/admin/orders" replace />
    if (user.role === 'Thu ngân' || user.role === 'Cashier') return <Navigate to="/admin/orders" replace />
    return <Navigate to="/" replace />
  }

  return children
}
