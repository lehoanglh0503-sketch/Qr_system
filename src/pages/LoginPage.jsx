import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../App'
import api from '../api'

export default function LoginPage() {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#FAFAF9',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        display: 'flex',
        width: '100%',
        maxWidth: '900px',
        minHeight: '550px',
        overflow: 'hidden'
      }}>
        {/* Left Side - Visual */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          background: '#050A1F',
          padding: '40px'
        }}>
          {/* Decorative shapes */}
          <div style={{ position: 'absolute', top: '35%', left: '15%', width: 12, height: 12, border: '2px solid #D4AF37', borderRadius: '50%' }}></div>
          <div style={{ position: 'absolute', top: '25%', right: '25%', width: 8, height: 8, border: '2px solid #E6C087' }}></div>
          <div style={{ position: 'absolute', bottom: '35%', left: '15%', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '10px solid #D4AF37' }}></div>
          <div style={{ position: 'absolute', top: '38%', right: '15%', width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '10px solid #E6C087', transform: 'rotate(90deg)' }}></div>
          <div style={{ position: 'absolute', bottom: '30%', right: '25%', width: 10, height: 10, border: '2px solid #D4AF37', borderRadius: '50%' }}></div>

          {/* Central circle & laptop */}
          <div style={{
            width: '280px',
            height: '280px',
            background: '#101835',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 10,
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}>
            <div className="text-center">
              <div className="font-serif text-[42px] font-bold tracking-widest uppercase mb-2" style={{ color: '#D4AF37' }}>
                VIỆT NHẬT
              </div>
              <div className="text-[#E6C087] font-medium tracking-[0.2em] text-[12px] uppercase">
                Fine Dining
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div style={{
          flex: 1,
          padding: '60px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <h2 className="font-serif" style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#0F172A',
            textAlign: 'center',
            marginBottom: '40px'
          }}>Staff Portal</h2>

          <form onSubmit={handleSubmit} className="w-full max-w-[320px] mx-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center" role="alert">
                {error}
              </div>
            )}

            <div className="mb-4 relative">
              <label htmlFor="name" className="sr-only">Tên nhân viên</label>
              <span className="absolute left-4 top-[14px] text-lg text-slate-500">👤</span>
              <input 
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tên nhân viên"
                className="w-full py-3.5 px-4 pl-[45px] bg-slate-100 border border-transparent rounded-sm text-[15px] text-slate-600 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:bg-white transition-all outline-none"
                autoComplete="username"
              />
            </div>

            <div className="mb-6 relative">
              <label htmlFor="password" className="sr-only">Mật khẩu</label>
              <span className="absolute left-4 top-[14px] text-lg text-slate-500">🔒</span>
              <input 
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                className="w-full py-3.5 px-4 pl-[45px] pr-12 bg-slate-100 border border-transparent rounded-sm text-[15px] text-slate-600 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:bg-white transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[14px] text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full w-6 h-6 flex items-center justify-center"
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#D4AF37] hover:bg-[#E6C087] text-[#050A1F] rounded-sm text-[14px] font-bold tracking-widest uppercase cursor-pointer mb-4 transition-all focus:outline-none focus:ring-2 focus:ring-[#D4AF37] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(212,175,55,0.2)]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#050A1F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ĐANG ĐĂNG NHẬP...
                </>
              ) : 'ĐĂNG NHẬP'}
            </button>


          </form>


        </div>
      </div>
    </div>
  )
}
