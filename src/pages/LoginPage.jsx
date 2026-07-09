import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../App'
import api from '../api'

export default function LoginPage() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [companyName, setCompanyName] = useState('')
  
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.getCompanyInfo().then(res => {
      if (res?.name) setCompanyName(res.name)
    }).catch(() => {})
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!name || !password) {
      setError('Vui lòng nhập đầy đủ thông tin')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await api.login(name, password)
      localStorage.setItem('token', data.token)
      login(data.user)
      if (data.user.role === 'Admin') navigate('/admin/company')
      else if (data.user.role === 'Bếp' || data.user.role === 'Kitchen') navigate('/admin/kitchen')
      else navigate('/admin/orders')
    } catch (err) {
      setError(err.message || 'Tên hoặc mật khẩu không đúng')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden" style={{ background: 'linear-gradient(160deg, #FDFBF7 0%, #F5F0E8 40%, #EDE5D8 100%)' }}>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(25px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.2; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        .login-card { animation: slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1); }
        .login-input:focus {
          border-color: #D4AF37 !important;
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.08);
          background: white !important;
        }
        .login-btn:not(:disabled):hover {
          box-shadow: 0 10px 35px rgba(5, 10, 31, 0.3);
          transform: translateY(-2px);
        }
        .login-btn:not(:disabled):active { transform: translateY(0); }
      `}</style>

      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft gradient blobs */}
        <div className="absolute -top-32 -right-32 w-[450px] h-[450px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 65%)' }}></div>
        <div className="absolute -bottom-48 -left-32 w-[500px] h-[500px] rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #C9A84C 0%, transparent 65%)' }}></div>
        <div className="absolute top-1/3 right-[10%] w-[300px] h-[300px] rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #8B7355 0%, transparent 65%)' }}></div>

        {/* Floating shapes */}
        <div className="absolute top-[12%] left-[8%] w-3 h-3 rounded-full border-2 border-[#D4AF37]/20" style={{ animation: 'float 7s ease-in-out infinite' }}></div>
        <div className="absolute top-[20%] right-[12%] w-2 h-2 bg-[#D4AF37]/15 rotate-45" style={{ animation: 'float 6s ease-in-out infinite 1s' }}></div>
        <div className="absolute bottom-[25%] left-[15%] w-4 h-4 border border-[#D4AF37]/15 rotate-45" style={{ animation: 'float 8s ease-in-out infinite 2s' }}></div>
        <div className="absolute top-[55%] right-[8%] w-2.5 h-2.5 rounded-full border-2 border-[#C9A84C]/20" style={{ animation: 'float 5s ease-in-out infinite 0.5s' }}></div>
        <div className="absolute bottom-[15%] right-[25%] w-1.5 h-1.5 bg-[#D4AF37]/10 rounded-full" style={{ animation: 'float 9s ease-in-out infinite 3s' }}></div>
        <div className="absolute top-[70%] left-[5%] w-2 h-2 border border-[#8B7355]/15 rounded-full" style={{ animation: 'float 6s ease-in-out infinite 1.5s' }}></div>
      </div>

      {/* Login Card */}
      <div className="login-card relative z-10 w-full max-w-[440px]">
        
        {/* Logo */}
        <div className="text-center mb-10" style={{ animation: 'fadeIn 0.8s ease-out 0.2s both' }}>
          <div className="relative inline-block mb-6">
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-3xl border-2 border-[#D4AF37]/15" style={{ animation: 'pulse-ring 3s ease-in-out infinite' }}></div>
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center relative shadow-lg" style={{ background: '#050A1F' }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                <path d="M7 2v20"></path>
                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
              </svg>
            </div>
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-wide text-[#050A1F] mb-2">
            {companyName || 'Nhà hàng'}
          </h1>
          <p className="text-[#8B7355] text-sm font-semibold tracking-[0.2em] uppercase">
            Cổng quản lý
          </p>
        </div>

        {/* Form card */}
        <div 
          className="rounded-[2rem] p-8 sm:p-10 shadow-xl border border-white/60"
          style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', animation: 'fadeIn 0.8s ease-out 0.4s both' }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-100 text-red-500 rounded-xl text-sm text-center font-semibold">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="name" className="text-[#050A1F] text-xs font-bold tracking-wider uppercase ml-1">Tên đăng nhập</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B7355]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <input 
                  id="name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nhập tên nhân viên"
                  className="login-input w-full py-4 px-4 pl-12 rounded-2xl text-[#050A1F] font-semibold placeholder-gray-300 outline-none transition-all duration-300"
                  style={{ background: '#F8F6F1', border: '2px solid transparent' }}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[#050A1F] text-xs font-bold tracking-wider uppercase ml-1">Mật khẩu</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B7355]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <input 
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="login-input w-full py-4 px-4 pl-12 pr-12 rounded-2xl text-[#050A1F] font-semibold placeholder-gray-300 outline-none transition-all duration-300"
                  style={{ background: '#F8F6F1', border: '2px solid transparent' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-[#8B7355] transition-colors"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                  )}
                </button>
              </div>
            </div>

            <div className="pt-3">
              <button 
                type="submit"
                disabled={loading}
                className="login-btn w-full py-4 rounded-2xl text-sm font-bold tracking-[0.15em] uppercase cursor-pointer transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                style={{ 
                  background: '#050A1F',
                  color: '#D4AF37',
                  boxShadow: '0 6px 25px rgba(5, 10, 31, 0.2)'
                }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8" style={{ animation: 'fadeIn 0.8s ease-out 0.6s both' }}>
          <p className="text-[#8B7355]/40 text-xs font-medium tracking-wide">
            Hệ thống quản lý nhà hàng
          </p>
        </div>
      </div>
    </div>
  )
}
