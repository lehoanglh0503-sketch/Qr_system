import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext, useContext, useEffect } from 'react'
import api from './api'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

import AdminCompany from './pages/admin/AdminCompany'
import AdminMenu from './pages/admin/AdminMenu'
import AdminOrders from './pages/admin/AdminOrders'
import AdminQR from './pages/admin/AdminQR'
import AdminAccount from './pages/admin/AdminAccount'
import AdminKitchen from './pages/admin/AdminKitchen'
import MenuPage from './pages/MenuPage'
import ProtectedRoute from './components/rbac/ProtectedRoute'

export const AuthContext = createContext(null)

export function useAuth() {
  return useContext(AuthContext)
}


export default function App() {
  const [user, setUser] = useState(null)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.getProfile()
        .then(data => setUser(data.user || data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  function showToast(msg, icon = '✅') {
    setToast({ msg, icon })
    setTimeout(() => setToast(null), 3000)
  }

  function login(userData) {
    setUser(userData)
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Đang tải...</div>

  return (
    <AuthContext.Provider value={{ user, login, logout, showToast }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/menu/:slug" element={<MenuPage />} />
          <Route path="/admin" element={<Navigate to="/admin/orders" replace />} />
          <Route path="/admin/company" element={<ProtectedRoute allowedRoles={['Admin']}><AdminCompany /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute allowedRoles={['Admin']}><AdminMenu /></ProtectedRoute>} />
          <Route path="/admin/kitchen" element={<ProtectedRoute allowedRoles={['Admin', 'Bếp', 'Kitchen']}><AdminKitchen /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute allowedRoles={['Admin', 'Nhân viên', 'Waiter', 'Thu ngân', 'Cashier']}><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/tables" element={<ProtectedRoute allowedRoles={['Admin']}><AdminQR /></ProtectedRoute>} />
          <Route path="/admin/account" element={<ProtectedRoute allowedRoles={['Admin', 'Bếp', 'Kitchen', 'Nhân viên', 'Waiter', 'Thu ngân', 'Cashier']}><AdminAccount /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {toast && (
        <div className="toast">
          <span className="toast-icon">{toast.icon}</span>
          <span className="toast-msg">{toast.msg}</span>
        </div>
      )}
    </AuthContext.Provider>
  )
}
