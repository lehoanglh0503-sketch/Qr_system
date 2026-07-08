import { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import { useAuth } from '../../App'
import api from '../../api'

function formatPrice(n) {
  return n.toLocaleString('vi-VN') + 'đ'
}

export default function AdminMenu() {
  const { showToast } = useAuth()
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState(['Tất cả'])
  const [loading, setLoading] = useState(true)
  const [selectedCat, setSelectedCat] = useState('Tất cả')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ name: '', category: 'Món chính', price: '', desc: '', icon: '🍜', available: true })

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        const MAX = 400
        if (width > height) {
          if (width > MAX) {
            height *= MAX / width
            width = MAX
          }
        } else {
          if (height > MAX) {
            width *= MAX / height
            height = MAX
          }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
        setForm(f => ({ ...f, icon: dataUrl }))
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const filtered = items.filter(item => {
    const matchCat = selectedCat === 'Tất cả' || item.category === selectedCat
    const matchSearch = item.name?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [productsData, categoriesData] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ])
      setItems(productsData)
      setCategories(['Tất cả', ...categoriesData.map(c => c.name)])
    } catch (err) {
      showToast('Lỗi tải dữ liệu', '⚠️')
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditItem(null)
    setForm({ name: '', category: 'Món chính', price: '', desc: '', icon: '🍜', available: true })
    setShowModal(true)
  }

  function openEdit(item) {
    setEditItem(item)
    setForm({ ...item, price: String(item.price) })
    setShowModal(true)
  }

  async function handleSave() {
    if (!form.name || !form.price) { showToast('Vui lòng nhập tên và giá', '⚠️'); return }
    const itemData = { ...form, price: Number(String(form.price).replace(/\D/g, '')) }
    
    try {
      if (editItem) {
        await api.updateProduct(editItem.id, itemData)
        showToast('Đã cập nhật món ăn!')
      } else {
        await api.createProduct(itemData)
        showToast('Đã thêm món ăn mới! 🍽️')
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      showToast('Lỗi lưu món ăn', '⚠️')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Xoá món này?')) return
    try {
      await api.deleteProduct(id)
      showToast('Đã xoá món ăn', '🗑️')
      loadData()
    } catch (err) {
      showToast('Lỗi xoá món ăn', '⚠️')
    }
  }

  async function toggleAvailable(item) {
    try {
      await api.updateProduct(item.id, { ...item, available: !item.available })
      loadData()
    } catch (err) {
      showToast('Lỗi cập nhật trạng thái', '⚠️')
    }
  }

  return (
    <AdminLayout title="🍽️ Quản Lý Menu" actions={
      <button id="add-menu-item" className="btn btn-primary btn-sm" onClick={openAdd}>
        ➕ Thêm món
      </button>
    }>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ maxWidth: 260 }}>
          <span className="search-icon">🔍</span>
          <input placeholder="Tìm món ăn..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button key={c} onClick={() => setSelectedCat(c)} className="menu-cat-btn"
              data-active={selectedCat === c}
              style={{
                padding: '7px 16px', borderRadius: 20,
                border: `2px solid ${selectedCat === c ? '#dc2626' : '#e5e7eb'}`,
                background: selectedCat === c ? '#dc2626' : 'white',
                color: selectedCat === c ? 'white' : '#6b7280',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
              }}>
              {c}
            </button>
          ))}
        </div>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#9ca3af' }}>{filtered.length} món</span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🍽️</div>
          <p>Không tìm thấy món ăn nào</p>
          <button className="btn btn-primary" onClick={openAdd}>Thêm món đầu tiên</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map(item => (
            <div key={item.id} style={{
              background: 'white', borderRadius: 16, border: '1px solid #f3f4f6',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden',
              opacity: item.available ? 1 : 0.65, transition: 'all 0.2s',
            }}>
              <div style={{ height: 160, background: item.available ? '#fff1f2' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, overflow: 'hidden' }}>
                {item.icon?.startsWith('data:image') || item.icon?.startsWith('http') ? (
                  <img src={item.icon} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.name} />
                ) : (
                  item.icon
                )}
              </div>
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{item.name}</h3>
                  <span className={`badge ${item.available ? 'badge-success' : 'badge-gray'}`} style={{ flexShrink: 0, fontSize: 11 }}>
                    {item.available ? 'Còn' : 'Hết'}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 10, lineHeight: 1.5 }}>{item.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 18, fontWeight: 900, color: '#dc2626' }}>{formatPrice(item.price)}</span>
                  <span style={{ fontSize: 11, background: '#f3f4f6', padding: '3px 8px', borderRadius: 10, color: '#6b7280', fontWeight: 600 }}>{item.category}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '1px solid #f3f4f6' }}>
                  <button onClick={() => openEdit(item)} className="btn btn-outline btn-sm" style={{ flex: 1, borderRadius: 10 }}>✏️ Sửa</button>
                  <button onClick={() => toggleAvailable(item)} style={{ flex: 1, padding: '6px 12px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151', transition: 'all 0.15s' }}>
                    {item.available ? '🔴 Tắt' : '🟢 Bật'}
                  </button>
                  <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 12px', borderRadius: 10, border: '1.5px solid #fee2e2', background: '#fff1f2', cursor: 'pointer', fontSize: 13, color: '#dc2626', transition: 'all 0.15s' }}>
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editItem ? '✏️ Sửa món ăn' : '➕ Thêm món mới'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Hình ảnh món ăn</label>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 80, height: 80, borderRadius: 12, border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#f9fafb', flexShrink: 0 }}>
                    {form.icon?.startsWith('data:image') || form.icon?.startsWith('http') ? (
                      <img src={form.icon} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
                    ) : (
                      <span style={{ fontSize: 32 }}>{form.icon || '📸'}</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="btn btn-outline btn-sm" style={{ cursor: 'pointer', display: 'inline-block', padding: '6px 12px' }}>
                      📸 Tải ảnh lên
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      Hoặc nhập Emoji: 
                      <input 
                        value={(!form.icon?.startsWith('data:') && !form.icon?.startsWith('http')) ? form.icon : ''} 
                        onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} 
                        style={{ width: 44, border: '1px solid #e5e7eb', borderRadius: 6, padding: '2px 4px', textAlign: 'center', fontSize: 14 }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Tên món *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="VD: Phở bò đặc biệt" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Danh mục</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '2px solid #e5e7eb', borderRadius: 8, outline: 'none', background: 'white' }}>
                    {categories.filter(c => c !== 'Tất cả').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Giá (đ) *</label>
                  <input className="form-input" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="50000" type="number" min="0" />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">Mô tả</label>
                <textarea className="form-input" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} rows={2} placeholder="Mô tả ngắn về món ăn..." style={{ resize: 'none' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                  <input type="checkbox" checked={form.available} onChange={e => setForm(f => ({ ...f, available: e.target.checked }))} style={{ width: 16, height: 16 }} />
                  Còn món (đang phục vụ)
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline btn-sm" onClick={() => setShowModal(false)}>Huỷ</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>
                {editItem ? '💾 Lưu thay đổi' : '➕ Thêm món'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
