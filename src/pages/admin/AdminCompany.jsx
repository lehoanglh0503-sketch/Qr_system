import { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import { useAuth } from '../../App'
import api from '../../api'

export default function AdminCompany() {
  const { showToast } = useAuth()
  const [info, setInfo] = useState({ name: '', phone: '', address: '', description: '', openTime: '', closeTime: '', slug: '', logo: '🏪', primaryColor: '#dc2626', wifi: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('info')

  useEffect(() => {
    api.getCompanyInfo().then(res => {
      if (res) setInfo(prev => ({ ...prev, ...res }))
    }).finally(() => setLoading(false))
  }, [])

  function setField(k, v) { setInfo(i => ({ ...i, [k]: v })) }

  async function handleSave(e) {
    if (e) e.preventDefault()
    setSaving(true)
    try {
      await api.updateCompanyInfo(info)
      showToast('Đã lưu thông tin quán thành công! ✅')
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (err) {
      showToast('Lỗi khi lưu thông tin', '⚠️')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AdminLayout title="🏪 Quản Lý Quán" actions={
      <button className="btn btn-primary btn-sm" onClick={handleSave}>
        {saving ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
      </button>
    }>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid #e5e7eb', paddingBottom: 0 }}>
        {[
          { key: 'info', label: '📋 Thông tin cơ bản' },
          { key: 'appearance', label: '🎨 Giao diện' },
          { key: 'settings', label: '⚙️ Cài đặt' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontWeight: tab === t.key ? 700 : 500, fontSize: 14,
            color: tab === t.key ? '#dc2626' : '#6b7280',
            borderBottom: tab === t.key ? '3px solid #dc2626' : '3px solid transparent',
            marginBottom: -2, transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>Đang tải...</div>
      ) : (
      <form onSubmit={handleSave}>
        {tab === 'info' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="card" style={{ padding: 24, gridColumn: '1/-1' }}>
              <h3 style={{ fontWeight: 800, marginBottom: 20, fontSize: 16 }}>Thông tin nhà hàng</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="form-group">
                  <label className="form-label">Tên quán *</label>
                  <input className="form-input" value={info.name} onChange={e => setField('name', e.target.value)} placeholder="Tên nhà hàng" />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại *</label>
                  <input className="form-input" value={info.phone} onChange={e => setField('phone', e.target.value)} placeholder="0901234567" />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Địa chỉ</label>
                  <input className="form-input" value={info.address} onChange={e => setField('address', e.target.value)} placeholder="Địa chỉ quán" />
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}>
                  <label className="form-label">Mô tả quán</label>
                  <textarea className="form-input" value={info.description} onChange={e => setField('description', e.target.value)} rows={3} placeholder="Mô tả về nhà hàng..." style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Giờ mở cửa</label>
                  <input className="form-input" type="time" value={info.openTime} onChange={e => setField('openTime', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Giờ đóng cửa</label>
                  <input className="form-input" type="time" value={info.closeTime} onChange={e => setField('closeTime', e.target.value)} />
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 24, gridColumn: '1/-1' }}>
              <h3 style={{ fontWeight: 800, marginBottom: 20, fontSize: 16 }}>Link website của bạn</h3>
              <div className="form-group">
                <label className="form-label">Slug (đường dẫn)</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ color: '#9ca3af', fontSize: 14, whiteSpace: 'nowrap' }}>goimon.shop/menu/</span>
                  <input className="form-input" value={info.slug} onChange={e => setField('slug', e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="ten-quan" style={{ flex: 1 }} />
                </div>
              </div>
              <div style={{ background: '#f9fafb', border: '1.5px dashed #d1d5db', borderRadius: 10, padding: '12px 16px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>🔗</span>
                <span style={{ color: '#6b7280' }}>URL menu: </span>
                <strong style={{ color: '#dc2626' }}>goimon.shop/menu/{info.slug}</strong>
              </div>
            </div>
          </div>
        )}

        {tab === 'appearance' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 800, marginBottom: 20, fontSize: 16 }}>Logo & Thương hiệu</h3>
              <div className="form-group">
                <label className="form-label">Emoji logo (tạm thời)</label>
                <input className="form-input" value={info.logo} onChange={e => setField('logo', e.target.value)} placeholder="🏪" />
              </div>
              <div style={{ width: 100, height: 100, background: '#f9fafb', border: '2px dashed #d1d5db', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, margin: '16px 0' }}>
                {info.logo}
              </div>
              <button type="button" className="btn btn-outline btn-sm">📷 Upload ảnh logo</button>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 800, marginBottom: 20, fontSize: 16 }}>Màu sắc chủ đạo</h3>
              <div className="form-group">
                <label className="form-label">Màu chính</label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input type="color" value={info.primaryColor} onChange={e => setField('primaryColor', e.target.value)}
                    style={{ width: 52, height: 52, border: '2px solid #e5e7eb', borderRadius: 10, cursor: 'pointer', padding: 4 }} />
                  <input className="form-input" value={info.primaryColor} onChange={e => setField('primaryColor', e.target.value)} style={{ flex: 1 }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                {['#dc2626','#7c3aed','#2563eb','#059669','#d97706','#db2777'].map(c => (
                  <button key={c} type="button" onClick={() => setField('primaryColor', c)} style={{ width: 36, height: 36, borderRadius: 8, background: c, border: info.primaryColor === c ? '3px solid #111' : '2px solid transparent', cursor: 'pointer' }} />
                ))}
              </div>

              {/* Preview */}
              <div style={{ marginTop: 24, background: '#f9fafb', borderRadius: 12, padding: 16 }}>
                <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10, fontWeight: 600 }}>PREVIEW</p>
                <div style={{ borderBottom: `3px solid ${info.primaryColor}`, padding: '10px 14px', background: 'white', borderRadius: 8, fontSize: 14, fontWeight: 700 }}>
                  {info.logo} {info.name}
                </div>
                <button type="button" style={{ marginTop: 10, background: info.primaryColor, color: 'white', border: 'none', padding: '8px 18px', borderRadius: 20, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                  Đặt món
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 800, marginBottom: 20, fontSize: 16 }}>Cài đặt khác</h3>
            <div className="form-group">
              <label className="form-label">Mật khẩu WiFi (hiển thị trên menu)</label>
              <input className="form-input" value={info.wifi} onChange={e => setField('wifi', e.target.value)} placeholder="Mật khẩu WiFi của quán" />
            </div>
            <div style={{ marginTop: 16 }}>
              {[
                { label: 'Nhận thông báo đơn hàng mới qua SMS', desc: 'Gửi SMS khi có đơn mới' },
                { label: 'Cho phép khách nhận xét', desc: 'Khách có thể để lại đánh giá' },
                { label: 'Hiển thị giá menu', desc: 'Khách thấy được giá tiền' },
                { label: 'Cho phép đặt món ngoài giờ', desc: 'Nhận đơn kể cả khi đóng cửa' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{s.desc}</div>
                  </div>
                  <ToggleSwitch defaultOn={i < 3} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? '⏳ Đang lưu...' : '💾 Lưu tất cả thay đổi'}
          </button>
          <button type="button" className="btn btn-outline">Huỷ</button>
        </div>
      </form>
      )}
    </AdminLayout>
  )
}

function ToggleSwitch({ defaultOn }) {
  const [on, setOn] = useState(defaultOn)
  return (
    <button type="button" onClick={() => setOn(!on)} style={{
      width: 44, height: 24, borderRadius: 12,
      background: on ? '#dc2626' : '#d1d5db',
      border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
    }}>
      <span style={{
        position: 'absolute', top: 2, left: on ? 22 : 2,
        width: 20, height: 20, borderRadius: '50%',
        background: 'white', transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}
