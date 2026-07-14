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
  const [showAddModal, setShowAddModal] = useState(false)

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
      showToast('Đã tạo tài khoản mới', '✅')
      setNewUser({ name: '', phone: '', password: '', role: 'Nhân viên' })
      setShowAddModal(false)
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
        showToast('Đã xóa tài khoản', '✅')
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
      showToast('Đã cập nhật mật khẩu thành công', '✅')
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
      <div className="px-2 lg:px-8 py-6 w-full max-w-6xl mx-auto relative min-h-full">

        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-black text-[#050A1F] tracking-tight mb-2">Tài khoản & Nhân sự</h1>
            <p className="text-gray-500 font-medium">Quản lý thông tin cá nhân và tài khoản nhân viên</p>
          </div>

          <div className="flex bg-gray-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setTab('profile')}
              className={`px-8 py-3 rounded-xl font-bold transition-all duration-200 ${tab === 'profile'
                  ? 'bg-white text-[#050A1F] shadow-sm'
                  : 'text-gray-500 hover:text-[#050A1F]'
                }`}
            >
              Hồ sơ cá nhân
            </button>
            {user?.role === 'Admin' && (
              <button
                onClick={() => setTab('staff')}
                className={`px-8 py-3 rounded-xl font-bold transition-all duration-200 ${tab === 'staff'
                    ? 'bg-white text-[#050A1F] shadow-sm'
                    : 'text-gray-500 hover:text-[#050A1F]'
                  }`}
              >
                Quản lý nhân sự
              </button>
            )}
          </div>
        </div>

        {tab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Profile Section */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-6 mb-10">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F3EFE8] to-white border border-[#EADDCD] flex items-center justify-center text-4xl shadow-inner text-[#D4AF37]">
                  👨‍💼
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#050A1F] mb-1">Thông tin cơ bản</h2>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F3EFE8] rounded-lg text-sm font-bold text-[#8B7355]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    Vai trò: {user?.role}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Họ và tên</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })}
                    className="w-full px-5 py-4 bg-[#F3EFE8] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-bold text-[#050A1F]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Số điện thoại đăng nhập</label>
                  <input
                    type="text"
                    value={profile.phone}
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl outline-none text-gray-500 font-bold cursor-not-allowed"
                    readOnly
                    title="Không thể đổi số điện thoại"
                  />
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={savingProfile} className="w-full bg-[#050A1F] text-[#D4AF37] px-8 py-4 rounded-2xl font-bold shadow-lg shadow-[#050A1F]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70">
                    {savingProfile ? 'Đang lưu...' : 'Lưu thông tin'}
                  </button>
                </div>
              </form>
            </div>

            {/* Password Section */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <div className="mb-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F3EFE8] to-white border border-[#EADDCD] flex items-center justify-center text-[#D4AF37] shadow-inner mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <h2 className="text-2xl font-bold text-[#050A1F] mb-1">Đổi mật khẩu</h2>
                <p className="text-gray-500 font-medium">Đảm bảo tài khoản của bạn luôn được bảo mật.</p>
              </div>

              <form onSubmit={handleSavePassword} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full px-5 py-4 bg-[#F3EFE8] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-bold text-[#050A1F]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={passwords.newPass}
                    onChange={e => setPasswords({ ...passwords, newPass: e.target.value })}
                    className="w-full px-5 py-4 bg-[#F3EFE8] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-bold text-[#050A1F]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    value={passwords.confirm}
                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="w-full px-5 py-4 bg-[#F3EFE8] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-bold text-[#050A1F]"
                    required
                  />
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={savingPassword} className="w-full bg-[#050A1F] text-[#D4AF37] px-8 py-4 rounded-2xl font-bold shadow-lg shadow-[#050A1F]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70">
                    {savingPassword ? 'Đang lưu...' : 'Cập nhật mật khẩu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {tab === 'staff' && user?.role === 'Admin' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-[#050A1F]">Danh sách nhân viên</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#050A1F] text-[#D4AF37] px-6 py-3 rounded-full font-bold shadow-lg shadow-[#050A1F]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Thêm nhân sự
              </button>
            </div>

            {loadingUsers ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <svg className="animate-spin w-10 h-10 mb-4 text-[#D4AF37]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="font-medium">Đang tải danh sách...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(u => (
                  <div key={u.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative group overflow-hidden">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#F3EFE8] flex items-center justify-center text-xl font-bold text-[#D4AF37]">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-[#050A1F]">{u.name}</h3>
                          <p className="text-gray-500 text-sm font-medium">{u.phone}</p>
                        </div>
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold mb-4"
                      style={{
                        background: u.role === 'Admin' ? '#fee2e2' : u.role === 'Bếp' ? '#fef08a' : u.role === 'Thu ngân' ? '#dcfce7' : '#e0f2fe',
                        color: u.role === 'Admin' ? '#991b1b' : u.role === 'Bếp' ? '#854d0e' : u.role === 'Thu ngân' ? '#166534' : '#0369a1'
                      }}
                    >
                      {u.role}
                    </div>

                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => { setEditingPasswordId(editingPasswordId === u.id ? null : u.id); setNewStaffPassword(''); }}
                        className="flex-1 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 font-bold text-[#050A1F] text-sm transition-colors"
                      >
                        Đổi mật khẩu
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === user.id}
                        className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${u.id === user.id ? 'bg-gray-50 text-gray-300 cursor-not-allowed' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'
                          }`}
                      >
                        Xóa
                      </button>
                    </div>

                    {/* Reset Password Slide Down */}
                    {editingPasswordId === u.id && (
                      <div className="mt-4 p-4 bg-[#F3EFE8] rounded-2xl animate-in fade-in slide-in-from-top-2">
                        <label className="text-xs font-bold text-gray-700 block mb-2">Mật khẩu mới cho {u.name}</label>
                        <div className="flex gap-2">
                          <input
                            type="password"
                            value={newStaffPassword}
                            onChange={(e) => setNewStaffPassword(e.target.value)}
                            placeholder="Tối thiểu 6 ký tự"
                            className="flex-1 px-3 py-2 bg-white rounded-xl outline-none focus:border-[#D4AF37] font-medium text-sm"
                          />
                          <button
                            onClick={() => handleUpdateStaffPassword(u.id)}
                            disabled={!newStaffPassword || newStaffPassword.length < 6}
                            className="bg-[#050A1F] text-[#D4AF37] px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-50"
                          >
                            Lưu
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-[#050A1F]/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="p-8 pb-6 relative">
                <div className="w-12 h-12 rounded-full bg-[#F3EFE8] text-[#D4AF37] flex items-center justify-center mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5c-1.1 0-2 .9-2 2v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                </div>
                <h3 className="text-2xl font-black text-[#050A1F] mb-2">Thêm tài khoản mới</h3>
                <p className="text-gray-500 font-medium">Tạo tài khoản cấp quyền cho nhân viên.</p>
                <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="px-8 py-2 max-h-[60vh] overflow-y-auto no-scrollbar">
                <form id="add-user-form" onSubmit={handleAddUser} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Tên nhân viên <span className="text-red-500">*</span></label>
                    <input type="text" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="w-full px-5 py-3.5 bg-[#F3EFE8] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-bold text-[#050A1F]" placeholder="Ví dụ: Nguyễn Văn A" required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Số điện thoại đăng nhập <span className="text-red-500">*</span></label>
                    <input type="tel" value={newUser.phone} onChange={e => setNewUser({ ...newUser, phone: e.target.value })} className="w-full px-5 py-3.5 bg-[#F3EFE8] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-bold text-[#050A1F]" placeholder="090..." required />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Mật khẩu <span className="text-red-500">*</span></label>
                    <input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-5 py-3.5 bg-[#F3EFE8] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-bold text-[#050A1F]" placeholder="Tối thiểu 6 ký tự" required minLength={6} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Vai trò phân quyền</label>
                    <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-5 py-3.5 bg-[#F3EFE8] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-bold text-[#050A1F] appearance-none">
                      <option value="Admin">Admin (Quản trị viên)</option>
                      <option value="Nhân viên">Nhân viên / Waiter</option>
                      <option value="Bếp">Nhà bếp</option>
                      <option value="Thu ngân">Thu ngân</option>
                    </select>
                  </div>
                </form>
              </div>

              <div className="p-8 pt-6 flex gap-4">
                <button onClick={() => setShowAddModal(false)} className="flex-1 px-6 py-4 rounded-full font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">Hủy</button>
                <button form="add-user-form" type="submit" disabled={savingUser} className="flex-[2] px-6 py-4 rounded-full font-bold text-[#D4AF37] bg-[#050A1F] shadow-lg shadow-[#050A1F]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70">
                  {savingUser ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}
