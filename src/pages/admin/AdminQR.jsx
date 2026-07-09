import { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import { useAuth } from '../../App'
import api from '../../api'

export default function AdminQR() {
  const { showToast } = useAuth()
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [newTableName, setNewTableName] = useState('')

  useEffect(() => {
    loadTables()
  }, [])

  async function loadTables() {
    try {
      const data = await api.getTables()
      setTables(data)
    } catch(err) {
      showToast('Lỗi tải danh sách bàn', '⚠️')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddTable(e) {
    e.preventDefault()
    if (!newTableName.trim()) return
    try {
      await api.createTable({ name: newTableName.trim() })
      showToast('Đã thêm bàn mới')
      setNewTableName('')
      loadTables()
    } catch(err) {
      showToast('Lỗi khi thêm bàn', '⚠️')
    }
  }

  async function handleDeleteTable(id) {
    if (confirm('Xóa bàn này?')) {
      try {
        await api.deleteTable(id)
        showToast('Đã xóa bàn')
        loadTables()
      } catch(err) {
        showToast('Lỗi khi xóa bàn', '⚠️')
      }
    }
  }

  async function handleDownload(table) {
    const link = `${window.location.origin}/menu/quan-an-ngon?table=${encodeURIComponent(table.name)}`
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(link)}`
    
    try {
      const response = await fetch(qrUrl)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = `QR_${table.name.replace(/\s+/g, '_')}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
      showToast('Đã tải QR Code')
    } catch (err) {
      showToast('Lỗi tải ảnh', '⚠️')
    }
  }

  // Format name logic if it's "Bàn 1" -> "Bàn 01" (Optional visual enhancement)
  const formatName = (name) => {
    if (name.toLowerCase().startsWith('bàn ')) {
      const numStr = name.substring(4).trim();
      const num = parseInt(numStr);
      if (!isNaN(num) && num < 10) {
        return `Bàn 0${num}`;
      }
    }
    return name;
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-serif text-[32px] font-bold text-[#0F172A] mb-2 tracking-wide">Sơ đồ bàn ăn</h1>
          <div className="flex items-center gap-2 text-[13px] font-bold text-[#64748B] uppercase tracking-wider">
            <span className="text-[#A16207]">Dashboard</span>
            <span>/</span>
            <span>Management</span>
            <span>/</span>
            <span className="text-[#0F172A]">Tables Layout</span>
          </div>
        </div>
        
        {/* Add Table Form */}
        <form onSubmit={handleAddTable} className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100 max-w-sm w-full">
          <input 
            type="text" 
            value={newTableName} 
            onChange={e => setNewTableName(e.target.value)} 
            placeholder="Tên bàn mới (vd: Bàn 15)" 
            className="flex-1 px-4 py-2 bg-transparent outline-none text-[15px]"
          />
          <button type="submit" className="px-5 py-2.5 bg-[#050A1F] text-[#D4AF37] font-bold text-[14px] rounded-lg hover:bg-[#101835] transition-colors">
            Thêm Bàn
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37] mb-4"></div>
          <p className="text-gray-500">Đang tải sơ đồ bàn...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.map((table) => {
            const formattedName = formatName(table.name);
            const link = `${window.location.origin}/menu/quan-an-ngon?table=${encodeURIComponent(table.name)}`;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(link)}`;

            return (
              <div key={table.id} className="bg-white rounded-[24px] border border-gray-100 p-6 flex flex-col shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.08)] transition-all">
                <div className="mb-4">
                  <h3 className="font-serif text-[26px] font-bold text-[#0F172A]">{formattedName}</h3>
                </div>
                
                <div className="bg-[#FAFAF9] border border-gray-100 rounded-2xl p-4 flex flex-col items-center mb-6">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 mb-4 hover:scale-105 transition-transform cursor-pointer" onClick={() => window.open(link, '_blank')} title="Mở trang đặt món">
                    <img src={qrUrl} alt={`QR Code ${table.name}`} className="w-40 h-40 object-contain" />
                  </div>
                  <a href={link} target="_blank" rel="noreferrer" className="text-[13px] text-blue-500 hover:text-blue-700 hover:underline break-all text-center px-2 line-clamp-1" title={link}>
                    Mở trang đặt món &rarr;
                  </a>
                </div>
                
                <div className="flex gap-3 mt-auto">
                  <button 
                    onClick={() => handleDownload(table)}
                    className="flex-1 py-3.5 bg-white border-2 border-gray-100 rounded-xl text-[14px] font-bold text-[#0F172A] hover:bg-gray-50 hover:border-gray-200 transition-colors flex justify-center items-center gap-2"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                    In Thẻ Bàn
                  </button>
                  <button 
                    onClick={() => handleDeleteTable(table.id)}
                    className="w-14 h-14 shrink-0 bg-[#fff1f2] text-[#ef4444] rounded-xl flex justify-center items-center hover:bg-[#fecdd3] transition-colors"
                    title="Xóa bàn này"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}
