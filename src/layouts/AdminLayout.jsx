import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../App'
import api from '../api'

const NAV_ITEMS = [
  { path: '/admin/orders', icon: '🛎️', label: 'Đơn gọi' },
  { path: '/admin/kitchen', icon: '🍳', label: 'Bếp' },
  { path: '/admin/tables', icon: '🪑', label: 'Các bàn' },
  { path: '/admin/products', icon: '🍔', label: 'Các món' },
  { path: '/admin/categories', icon: '📋', label: 'Loại món' },
  { path: '/admin/company', icon: '🏪', label: 'Cửa hàng' },
  { path: '/admin/account', icon: '👥', label: 'Tài khoản' },
]

export default function AdminLayout({ children, title, actions, showHeader = true }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [company, setCompany] = useState(() => {
    const cached = sessionStorage.getItem('companyInfo');
    return cached ? JSON.parse(cached) : { name: '...', logo: '⏳', primaryColor: '#dc2626' };
  })
  const [notifications, setNotifications] = useState([])
  const [showNotifs, setShowNotifs] = useState(false)

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 5000)
    return () => clearInterval(interval)
  }, [])

  async function loadNotifications() {
    try {
      const data = await api.getNotifications()
      setNotifications(data || [])
    } catch (err) {}
  }

  async function handleResolve(id) {
    try {
      await api.resolveNotification(id)
      loadNotifications()
    } catch (err) {}
  }

  useEffect(() => {
    api.getCompanyInfo().then(data => {
      if (data) {
        setCompany(data)
        sessionStorage.setItem('companyInfo', JSON.stringify(data));
      }
    }).catch(err => console.log(err))
  }, [])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="flex h-screen bg-gray-50/50 font-sans text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] bg-[#050A1F] border-r border-[#050A1F] flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-20">
        {/* Logo */}
        <div className="pt-10 pb-8 px-6 flex flex-col items-center">
          <div className="font-serif text-[26px] font-bold tracking-widest uppercase text-center leading-tight" style={{ color: '#D4AF37' }}>
            {company?.name || 'VIỆT NHẬT'}
          </div>
          <div className="text-[12px] font-medium tracking-widest mt-1 uppercase text-center" style={{ color: '#64748B' }}>
            Fine Dining Excellence
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 space-y-1">
          {NAV_ITEMS.filter(item => {
            if (user?.role === 'Nhân viên' || user?.role === 'Waiter' || user?.role === 'Thu ngân' || user?.role === 'Cashier') {
              return item.path === '/admin/orders' || item.path === '/admin/account'
            }
            if (user?.role === 'Bếp' || user?.role === 'Kitchen') {
              return item.path === '/admin/kitchen' || item.path === '/admin/account'
            }
            return true
          }).map(item => {
            const isActive = location.pathname.startsWith(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-6 py-4 transition-all duration-200 group border-l-4 ${
                  isActive 
                    ? 'bg-[#101835] border-[#D4AF37] text-[#D4AF37]' 
                    : 'bg-transparent border-transparent text-[#64748B] hover:bg-[#101835] hover:text-[#E6C087]'
                }`}
              >
                <span className={`text-[20px] mr-4 transition-transform duration-200 ${isActive ? 'scale-110' : 'grayscale group-hover:grayscale-0'}`}>
                  {item.icon}
                </span>
                <span className={`text-[15px] tracking-wide ${isActive ? 'font-bold' : 'font-semibold'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-6 border-t border-[#101835] bg-[#050A1F] space-y-4">
          <div className="pt-4 space-y-2">
            <button onClick={handleLogout} className="w-full flex items-center px-2 py-2 bg-transparent text-[#64748B] hover:text-[#E6C087] transition-all font-medium text-[14px] group">
              <span className="text-[18px] mr-3 group-hover:translate-x-1 transition-transform">↪️</span> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAFAF9]">
        {showHeader && (
          <header className="h-[80px] bg-transparent flex items-center justify-between px-10 z-10 shrink-0">
            <div className="flex items-center gap-6 flex-1">
              <div className="flex items-center w-full max-w-md transition-all">
                <span className="text-gray-400 mr-4 text-lg">🔍</span>
                <input 
                  type="text" 
                  placeholder="Search tables or reservations..." 
                  className="bg-transparent border-none outline-none w-full text-[15px] text-gray-700 placeholder-gray-400 font-medium"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              {actions}
              <div className="relative">
                <button onClick={() => setShowNotifs(!showNotifs)} className="relative text-gray-600 hover:text-gray-900 transition-colors focus:outline-none">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
                      {notifications.length}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 font-bold text-gray-800">
                      Thông báo ({notifications.length})
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-6 text-center text-gray-500 text-sm">Không có thông báo mới</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="px-4 py-3 hover:bg-gray-50 border-b border-gray-50 flex flex-col gap-1 cursor-default">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-900">{n.tableName}</span>
                              <span className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {n.type === 'Call_Staff' ? '🛎️ Gọi nhân viên phục vụ' : '💰 Yêu cầu tính tiền'}
                            </div>
                            <button onClick={() => handleResolve(n.id)} className="mt-2 self-start text-xs font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition-colors">
                              Đã xử lý
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="w-px h-8 bg-gray-200"></div>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 shadow-sm overflow-hidden bg-white">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <span className="font-bold text-[14px] text-gray-900 tracking-wide">{user?.name || 'Staff'} ({user?.role})</span>
              </div>
            </div>
          </header>
        )}

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
