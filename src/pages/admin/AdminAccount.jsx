import { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import { useAuth } from '../../App'
import api from '../../api'

export default function AdminAccount() {
  const { user, showToast } = useAuth()
  const [tab, setTab] = useState('profile') // 'profile' or 'staff'
  
  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  })
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: ''
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  // Staff state
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', phone: '', password: '', role: 'Nhân viên' })
  const [savingUser, setSavingUser] = useState(false)
  const [editingPasswordId, setEditingPasswordId] = useState(null)
  const [newStaffPassword, setNewStaffPassword] = useState('')

  useEffect(() => {
    if (tab === 'staff' && user?.role === 'Admin') {
      loadUsers()
    }
  }, [tab])

  async function loadUsers() {
    setLoadingUsers(true)
    try {
      const data = await api.getUsers()
      setUsers(data || [])
    } catch (err) {
      showToast('Lỗi khi tải danh sách nhân viên', '⚠️')
    } finally {
      setLoadingUsers(false)
    }
  }

  async function handleAddUser(e) {
    e.preventDefault()
    if (!newUser.name || !newUser.phone || !newUser.password) {
      showToast('Vui lòng điền đủ thông tin', '⚠️')
      return
    }
    if (newUser.password.length < 6) {
      showToast('Mật khẩu ít nhất 6 ký tự', '⚠️')
      return
    }

    setSavingUser(true)
    try {
      await api.createUser(newUser)
      showToast('Đã tạo tài khoản mới')
      setNewUser({ name: '', phone: '', password: '', role: 'Nhân viên' })
      loadUsers()
    } catch (err) {
      showToast(err.message || 'Lỗi khi tạo tài khoản', '⚠️')
    } finally {
      setSavingUser(false)
    }
  }

  async function handleDeleteUser(id) {
    if (confirm('Bạn có chắc muốn xóa tài khoản này?')) {
      try {
        await api.deleteUser(id)
        showToast('Đã xóa tài khoản')
        loadUsers()
      } catch (err) {
        showToast(err.message || 'Lỗi khi xóa', '⚠️')
      }
    }
  }

  async function handleUpdateStaffPassword(id) {
    if (newStaffPassword.length < 6) {
      showToast('Mật khẩu phải có ít nhất 6 ký tự', '⚠️')
      return
    }
    try {
      await api.updateUserPassword(id, newStaffPassword)
      showToast('Đã cập nhật mật khẩu thành công')
      setEditingPasswordId(null)
      setNewStaffPassword('')
    } catch (err) {
      showToast(err.message || 'Lỗi khi cập nhật mật khẩu', '⚠️')
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault()
    showToast('Chức năng đang được cập nhật', '⚠️')
  }

  async function handleSavePassword(e) {
    e.preventDefault()
    showToast('Chức năng đang được cập nhật', '⚠️')
  }

  return (
    <AdminLayout title="Tài khoản">
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
          <button 
            onClick={() => setTab('profile')}
            style={{ 
              background: tab === 'profile' ? '#dc2626' : 'transparent',
              color: tab === 'profile' ? 'white' : '#64748b',
              border: 'none', padding: '8px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
            }}>
            Cá nhân
          </button>
          {user?.role === 'Admin' && (
            <button 
              onClick={() => setTab('staff')}
              style={{ 
                background: tab === 'staff' ? '#dc2626' : 'transparent',
                color: tab === 'staff' ? 'white' : '#64748b',
                border: 'none', padding: '8px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
              }}>
              Quản lý Nhân sự
            </button>
          )}
        </div>

        {tab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Profile Section */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', color: '#64748b'
                }}>👤</div>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#1e293b' }}>Thông tin tài khoản</h2>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Vai trò: <strong>{user?.role}</strong></p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Họ và tên</label>
                  <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="form-input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Số điện thoại (Tài khoản)</label>
                  <input type="tel" value={profile.phone} className="form-input" style={{ background: '#f8fafc', color: '#64748b' }} readOnly title="Không thể đổi số điện thoại" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button type="submit" disabled={savingProfile} style={{
                    background: '#dc2626', color: 'white', border: 'none', padding: '10px 24px',
                    borderRadius: '6px', fontWeight: '600', cursor: savingProfile ? 'not-allowed' : 'pointer'
                  }}>
                    {savingProfile ? 'Đang lưu...' : 'Lưu thông tin'}
                  </button>
                </div>
              </form>
            </div>
            
            {/* Password Section */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#1e293b' }}>Đổi mật khẩu</h2>
              </div>
              <form onSubmit={handleSavePassword} style={{ display: 'grid', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Mật khẩu hiện tại</label>
                  <input type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} className="form-input" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Mật khẩu mới</label>
                  <input type="password" value={passwords.newPass} onChange={e => setPasswords({...passwords, newPass: e.target.value})} className="form-input" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Xác nhận mật khẩu mới</label>
                  <input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} className="form-input" required />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button type="submit" disabled={savingPassword} style={{
                    background: '#1e293b', color: 'white', border: 'none', padding: '10px 24px',
                    borderRadius: '6px', fontWeight: '600', cursor: savingPassword ? 'not-allowed' : 'pointer'
                  }}>
                    {savingPassword ? 'Đang lưu...' : 'Đổi mật khẩu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {tab === 'staff' && user?.role === 'Admin' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
            
            {/* Users List */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1e293b' }}>Danh sách tài khoản</h2>
              {loadingUsers ? <div style={{ padding: 20, textAlign: 'center' }}>Đang tải...</div> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {users.map(u => (
                    <div key={u.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', gap: 8, alignItems: 'center' }}>
                            {u.name}
                            <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 12, background: u.role === 'Admin' ? '#fee2e2' : u.role === 'Bếp' ? '#fef08a' : u.role === 'Thu ngân' ? '#dcfce7' : '#e0f2fe', color: u.role === 'Admin' ? '#991b1b' : u.role === 'Bếp' ? '#854d0e' : u.role === 'Thu ngân' ? '#166534' : '#0369a1' }}>
                              {u.role}
                            </span>
                          </div>
                          <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{u.phone}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => { setEditingPasswordId(editingPasswordId === u.id ? null : u.id); setNewStaffPassword(''); }} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                            Đổi mật khẩu
                          </button>
                          <button onClick={() => handleDeleteUser(u.id)} disabled={u.id === user.id} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: u.id === user.id ? 'not-allowed' : 'pointer', opacity: u.id === user.id ? 0.3 : 1 }}>
                            Xóa
                          </button>
                        </div>
                      </div>
                      {editingPasswordId === u.id && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <input 
                            type="password" 
                            value={newStaffPassword}
                            onChange={(e) => setNewStaffPassword(e.target.value)}
                            placeholder="Nhập mật khẩu mới" 
                            className="form-input" 
                            style={{ flex: 1, padding: '6px 12px', fontSize: 14 }}
                          />
                          <button 
                            onClick={() => handleUpdateStaffPassword(u.id)}
                            disabled={!newStaffPassword || newStaffPassword.length < 6}
                            style={{ background: '#1e293b', color: 'white', border: 'none', padding: '6px 16px', borderRadius: 6, cursor: (!newStaffPassword || newStaffPassword.length < 6) ? 'not-allowed' : 'pointer', opacity: (!newStaffPassword || newStaffPassword.length < 6) ? 0.5 : 1 }}
                          >
                            Lưu
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add User Form */}
            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: 20 }}>
              <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1e293b' }}>Thêm tài khoản mới</h2>
              <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="form-label">Tên nhân viên</label>
                  <input type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="form-input" placeholder="Nguyễn Văn A" required />
                </div>
                <div>
                  <label className="form-label">Số điện thoại (Tên đăng nhập)</label>
                  <input type="tel" value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} className="form-input" placeholder="090..." required />
                </div>
                <div>
                  <label className="form-label">Mật khẩu</label>
                  <input type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="form-input" placeholder="Mật khẩu" required minLength={6} />
                </div>
                <div>
                  <label className="form-label">Phân quyền</label>
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="form-input">
                    <option value="Admin">Admin (Quản lý toàn quyền)</option>
                    <option value="Nhân viên">Waiter (Nhân viên chạy bàn)</option>
                    <option value="Bếp">Kitchen (Nhà bếp)</option>
                    <option value="Thu ngân">Cashier (Thu ngân)</option>
                  </select>
                </div>
                <button type="submit" disabled={savingUser} className="btn" style={{ width: '100%', marginTop: 8 }}>
                  {savingUser ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </AdminLayout>
  )
}
