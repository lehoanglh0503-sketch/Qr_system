import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../App'
import api from '../api'

const NAV_ITEMS = [
  { path: '/admin/orders', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>, label: 'Đơn gọi' },
  { path: '/admin/kitchen', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path><path d="M7 2v20"></path><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path></svg>, label: 'Bếp' },
  { path: '/admin/tables', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>, label: 'Các bàn' },
  { path: '/admin/products', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>, label: 'Thực đơn' },
  { path: '/admin/company', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>, label: 'Cửa hàng' },
  { path: '/admin/account', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>, label: 'Tài khoản' },
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
    <div className="flex h-screen bg-[#F3EFE8] font-sans text-gray-900 overflow-hidden p-4 lg:p-6 lg:pl-4 gap-6 lg:gap-8">
      {/* Floating Pill Sidebar */}
      <aside className="w-[80px] bg-white rounded-[40px] flex flex-col items-center py-8 shadow-sm shrink-0 relative z-20">
        {/* Logo Icon */}
        <div className="w-12 h-12 rounded-full bg-[#FAFAF9] border border-gray-100 flex items-center justify-center text-[#D4AF37] mb-8 shrink-0">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L15 9H22L16.5 14L18.5 21L12 17L5.5 21L7.5 14L2 9H9L12 2Z"/></svg>
        </div>

        {/* Navigation */}
        <nav className="flex-1 self-start w-[200px] pr-[120px] overflow-y-auto no-scrollbar pointer-events-none">
          <div className="w-full flex flex-col items-center gap-4 pointer-events-auto">
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
                  title={item.label}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative group shrink-0 ${
                    isActive 
                      ? 'bg-[#050A1F] text-[#D4AF37] shadow-lg shadow-[#050A1F]/20' 
                      : 'bg-transparent text-gray-400 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  
                  {/* Tooltip */}
                  <div className="absolute left-[100%] ml-4 px-3 py-1.5 bg-[#050A1F] text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap transition-opacity shadow-lg z-50">
                    {item.label}
                    <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-[#050A1F] transform rotate-45"></div>
                  </div>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="mt-4 pt-4 shrink-0 flex flex-col gap-4">
          <button 
            onClick={handleLogout} 
            title="Đăng xuất"
            className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors group relative"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <div className="absolute left-[100%] ml-4 px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 whitespace-nowrap transition-opacity shadow-lg z-50">
              Đăng xuất
              <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 transform rotate-45"></div>
            </div>
          </button>
          
          <div className="w-12 h-12 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
             <span className="font-bold text-gray-600 text-xs">{user?.name ? user.name.substring(0,2).toUpperCase() : 'NV'}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {showHeader && (
          <header className="relative h-[80px] bg-transparent flex items-center justify-end z-50 shrink-0 mb-2">
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center bg-white rounded-full px-5 py-3.5 shadow-sm border border-gray-100 w-[300px] transition-all focus-within:ring-2 focus-within:ring-[#D4AF37]/50 focus-within:border-[#D4AF37]">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm..." 
                  className="bg-transparent border-none outline-none w-full text-[14px] text-gray-700 placeholder-gray-400 font-medium"
                />
                <button className="text-white bg-[#050A1F] rounded-full w-8 h-8 flex items-center justify-center shrink-0 hover:bg-[#1C1917] transition-colors ml-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </button>
              </div>

              <div className="relative">
                <button onClick={() => setShowNotifs(!showNotifs)} className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors focus:outline-none relative">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                  {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 flex h-2 w-2 items-center justify-center rounded-full bg-red-500"></span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-3 z-50 animate-fadeInUp">
                    <div className="px-5 py-2 border-b border-gray-50 font-bold text-gray-900">
                      Thông báo ({notifications.length})
                    </div>
                    <div className="max-h-96 overflow-y-auto p-2">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-gray-500 text-sm">Không có thông báo mới</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="p-3 hover:bg-gray-50 rounded-xl flex flex-col gap-1 cursor-default transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-900">{n.tableName}</span>
                              <span className="text-[10px] text-gray-400">{new Date(n.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              {n.type === 'Call_Staff' ? <span className="bg-orange-100 text-orange-600 p-1 rounded">🛎️</span> : <span className="bg-green-100 text-green-600 p-1 rounded">💰</span>}
                              {n.type === 'Call_Staff' ? 'Gọi nhân viên phục vụ' : 'Yêu cầu tính tiền'}
                            </div>
                            <button onClick={() => handleResolve(n.id)} className="mt-2 self-start text-[11px] font-bold bg-[#F3EFE8] text-[#8B7355] px-3 py-1.5 rounded-lg hover:bg-[#EADDCD] transition-colors">
                              Đánh dấu đã xử lý
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <button className="w-12 h-12 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </button>
            </div>
          </header>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
          {children}
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.3s ease forwards; }
      `}} />
    </div>
  )
}
