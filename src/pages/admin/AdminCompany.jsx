import { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import { useAuth } from '../../App'
import api from '../../api'

export default function AdminCompany() {
  const { showToast } = useAuth()
  const [info, setInfo] = useState({ name: '', phone: '', address: '', description: '', openTime: '', closeTime: '', slug: '', logo: '🏪', primaryColor: '#dc2626', wifi: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
    <AdminLayout title="Cửa hàng">
      <div className="px-2 lg:px-8 py-6 w-full max-w-5xl mx-auto relative min-h-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#050A1F] tracking-tight">Thông tin cửa hàng</h1>
            <p className="text-gray-500 mt-2 font-medium">Quản lý tên, địa chỉ và thời gian hoạt động của nhà hàng</p>
          </div>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-[#050A1F] text-[#D4AF37] px-8 py-3.5 rounded-full font-bold shadow-lg shadow-[#050A1F]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Đang lưu...
              </>
            ) : (
              <>
                <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                </div>
                Lưu thay đổi
              </>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <svg className="animate-spin w-10 h-10 mb-4 text-[#D4AF37]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="font-medium text-gray-500">Đang tải thông tin...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F3EFE8] to-white border border-[#EADDCD] flex items-center justify-center text-[#D4AF37] shadow-inner text-3xl">
                {info.logo || '🏪'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#050A1F]">Hồ sơ cơ sở</h2>
                <p className="text-gray-500 text-sm font-medium mt-1">Thông tin cơ bản sẽ hiển thị cho khách hàng</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Tên quán <span className="text-red-500">*</span></label>
                <input 
                  value={info.name} 
                  onChange={e => setField('name', e.target.value)} 
                  className="w-full px-5 py-4 bg-[#F3EFE8] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-bold text-[#050A1F] placeholder-gray-400" 
                  placeholder="Nhập tên nhà hàng" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Số điện thoại liên hệ <span className="text-red-500">*</span></label>
                <input 
                  value={info.phone} 
                  onChange={e => setField('phone', e.target.value)} 
                  className="w-full px-5 py-4 bg-[#F3EFE8] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-bold text-[#050A1F] placeholder-gray-400" 
                  placeholder="0901234567" 
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Địa chỉ chi tiết</label>
                <input 
                  value={info.address} 
                  onChange={e => setField('address', e.target.value)} 
                  className="w-full px-5 py-4 bg-[#F3EFE8] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-bold text-[#050A1F] placeholder-gray-400" 
                  placeholder="Ví dụ: 123 Nguyễn Huệ, Quận 1, TP.HCM" 
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Mô tả quán</label>
                <textarea 
                  value={info.description} 
                  onChange={e => setField('description', e.target.value)} 
                  rows={4} 
                  className="w-full px-5 py-4 bg-[#F3EFE8] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-medium text-[#050A1F] placeholder-gray-400 resize-none" 
                  placeholder="Mô tả về nhà hàng, đặc sản, không gian..." 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Giờ mở cửa</label>
                <div className="relative">
                  <input 
                    type="time" 
                    value={info.openTime} 
                    onChange={e => setField('openTime', e.target.value)} 
                    className="w-full px-5 py-4 bg-[#F3EFE8] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-bold text-[#050A1F]" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Giờ đóng cửa</label>
                <div className="relative">
                  <input 
                    type="time" 
                    value={info.closeTime} 
                    onChange={e => setField('closeTime', e.target.value)} 
                    className="w-full px-5 py-4 bg-[#F3EFE8] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-bold text-[#050A1F]" 
                  />
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  )
}
