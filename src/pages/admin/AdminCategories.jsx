import { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import { useAuth } from '../../App'
import api from '../../api'

export default function AdminCategories() {
  const { showToast } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [name, setName] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  async function loadCategories() {
    try {
      const data = await api.getCategories()
      setCategories(data)
    } catch (error) {
      showToast('Lỗi tải dữ liệu', '⚠️')
    } finally {
      setLoading(false)
    }
  }

  function openAdd() {
    setEditItem(null)
    setName('')
    setShowModal(true)
  }

  function openEdit(item) {
    setEditItem(item)
    setName(item.name)
    setShowModal(true)
  }

  async function handleSave() {
    if (!name.trim()) {
      showToast('Vui lòng nhập tên loại món', '⚠️')
      return
    }

    try {
      if (editItem) {
        await api.updateCategory(editItem.id, { name: name.trim() })
        showToast('Cập nhật loại món thành công')
      } else {
        await api.createCategory({ name: name.trim() })
        showToast('Thêm loại món thành công')
      }
      setShowModal(false)
      loadCategories()
    } catch (error) {
      showToast('Có lỗi xảy ra', '⚠️')
    }
  }

  async function handleDelete(id) {
    if (confirm('Bạn có chắc chắn muốn xóa loại món này?')) {
      try {
        await api.deleteCategory(id)
        showToast('Đã xóa loại món')
        loadCategories()
      } catch (error) {
        showToast('Có lỗi xảy ra', '⚠️')
      }
    }
  }

  const actions = (
    <button onClick={openAdd} style={{
      background: '#dc2626', color: 'white', border: 'none', padding: '8px 16px',
      borderRadius: '6px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px'
    }}>
      <span style={{ fontSize: '18px' }}>+</span> Thêm loại món
    </button>
  )

  return (
    <AdminLayout title="Loại món" actions={actions}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Đang tải...</div>
      ) : (
      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px', width: '60px' }}>ID</th>
              <th style={{ padding: '16px 24px', textAlign: 'left', color: '#64748b', fontWeight: '600', fontSize: '14px' }}>Tên loại món</th>
              <th style={{ padding: '16px 24px', textAlign: 'center', color: '#64748b', fontWeight: '600', fontSize: '14px', width: '120px' }}>Số lượng món</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', color: '#64748b', fontWeight: '600', fontSize: '14px', width: '120px' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '14px' }}>#{cat.id}</td>
                <td style={{ padding: '16px 24px', fontWeight: '500', color: '#1e293b' }}>{cat.name}</td>
                <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                  <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '99px', fontSize: '13px', fontWeight: '600' }}>
                    {cat.count}
                  </span>
                </td>
                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                  <button onClick={() => openEdit(cat)} style={{
                    background: 'transparent', border: 'none', cursor: 'pointer', color: '#3b82f6',
                    fontSize: '14px', fontWeight: '500', marginRight: '16px'
                  }}>Sửa</button>
                  <button onClick={() => handleDelete(cat.id)} style={{
                    background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444',
                    fontSize: '14px', fontWeight: '500'
                  }}>Xóa</button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                  <div>Chưa có loại món nào</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div style={{
            background: 'white', borderRadius: '12px', width: '100%', maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                {editItem ? 'Sửa loại món' : 'Thêm loại món'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{
                background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#94a3b8'
              }}>×</button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
                  Tên loại món <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="VD: Món chính, Đồ uống..."
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px',
                    fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#dc2626'}
                  onBlur={e => e.target.style.borderColor = '#cbd5e1'}
                />
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f8fafc', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
              <button onClick={() => setShowModal(false)} style={{
                padding: '8px 16px', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px',
                color: '#475569', fontWeight: '500', cursor: 'pointer'
              }}>
                Hủy
              </button>
              <button onClick={handleSave} style={{
                padding: '8px 16px', background: '#dc2626', border: 'none', borderRadius: '6px',
                color: 'white', fontWeight: '600', cursor: 'pointer'
              }}>
                {editItem ? 'Lưu thay đổi' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
