import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../App'

export default function RegisterPage() {
  const [form, setForm] = useState({ restaurantName: '', phone: '', password: '', confirm: '', address: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { showToast } = useAuth()
  const navigate = useNavigate()

  function validate() {
    const e = {}
    if (!form.restaurantName) e.restaurantName = 'Tên quán là bắt buộc'
    if (!form.phone || form.phone.length < 10) e.phone = 'Số điện thoại không hợp lệ'
    if (!form.password || form.password.length < 6) e.password = 'Mật khẩu ít nhất 6 ký tự'
    if (form.password !== form.confirm) e.confirm = 'Mật khẩu xác nhận không khớp'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false)
    showToast('Tạo quán thành công! Chào mừng bạn 🎉')
    navigate('/login')
  }

  function setField(k, v) {
    setForm(f => ({ ...f, [k]: v }))
    setErrors(e => ({ ...e, [k]: undefined }))
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 960 }}>
        {/* Visual */}
        <div className="auth-visual">
          <div className="auth-visual-emoji">🏪</div>
          <h2>Tạo Quán Của Bạn</h2>
          <p>Chỉ mất 5 phút để có website gọi món QR Code chuyên nghiệp cho nhà hàng của bạn</p>

          <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 16, width: '100%', position: 'relative', zIndex: 1 }}>
            {[
              { step: '1', text: 'Điền thông tin quán' },
              { step: '2', text: 'Thêm món ăn vào menu' },
              { step: '3', text: 'Chia sẻ QR Code' },
              { step: '4', text: 'Nhận đơn hàng & tăng thu!' },
            ].map(s => (
              <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                  {s.step}
                </div>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{s.text}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '16px 20px', width: '100%', position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 14, opacity: 0.9 }}>🎁 <strong>Miễn phí 100%</strong> trong 30 ngày đầu. Không cần thẻ tín dụng!</p>
          </div>
        </div>

        {/* Form */}
        <div className="auth-form-side">
          <div style={{ marginBottom: 8, fontSize: 28 }}>📝</div>
          <h1>Tạo Quán Mới</h1>
          <p className="subtitle">Tạo website gọi món miễn phí cho nhà hàng của bạn</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Tên nhà hàng / quán ăn *</label>
              <div className="input-icon-wrapper">
                <span className="input-icon">🏪</span>
                <input id="reg-name" className="form-input" type="text" placeholder="VD: Quán Phở Hà Nội" value={form.restaurantName} onChange={e => setField('restaurantName', e.target.value)} />
              </div>
              {errors.restaurantName && <span style={{ fontSize: 12, color: '#dc2626' }}>{errors.restaurantName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Số điện thoại *</label>
              <div className="input-icon-wrapper">
                <span className="input-icon">📞</span>
                <input id="reg-phone" className="form-input" type="tel" placeholder="VD: 0901234567" value={form.phone} onChange={e => setField('phone', e.target.value)} />
              </div>
              {errors.phone && <span style={{ fontSize: 12, color: '#dc2626' }}>{errors.phone}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Mật khẩu *</label>
                <div className="input-icon-wrapper">
                  <span className="input-icon">🔒</span>
                  <input id="reg-password" className="form-input" type="password" placeholder="Ít nhất 6 ký tự" value={form.password} onChange={e => setField('password', e.target.value)} />
                </div>
                {errors.password && <span style={{ fontSize: 12, color: '#dc2626' }}>{errors.password}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Xác nhận mật khẩu *</label>
                <div className="input-icon-wrapper">
                  <span className="input-icon">🔒</span>
                  <input id="reg-confirm" className="form-input" type="password" placeholder="Nhập lại mật khẩu" value={form.confirm} onChange={e => setField('confirm', e.target.value)} />
                </div>
                {errors.confirm && <span style={{ fontSize: 12, color: '#dc2626' }}>{errors.confirm}</span>}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="form-label">Địa chỉ quán (tùy chọn)</label>
              <div className="input-icon-wrapper">
                <span className="input-icon">📍</span>
                <input id="reg-address" className="form-input" type="text" placeholder="VD: 123 Nguyễn Huệ, Q.1, TP.HCM" value={form.address} onChange={e => setField('address', e.target.value)} />
              </div>
            </div>

            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 16, lineHeight: 1.6 }}>
              Bằng cách đăng ký, bạn đồng ý với <a href="#" style={{ color: '#dc2626' }}>Điều khoản sử dụng</a> và <a href="#" style={{ color: '#dc2626' }}>Chính sách bảo mật</a> của chúng tôi.
            </div>

            <button id="reg-submit" type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '14px', fontSize: 16 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                  <span className="animate-spin" style={{ display: 'inline-block', width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%' }}></span>
                  Đang tạo quán...
                </span>
              ) : '🎉 Tạo Quán Miễn Phí'}
            </button>
          </form>

          <div className="auth-link">
            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
