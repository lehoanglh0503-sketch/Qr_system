import { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import { useAuth } from '../../App'
import api from '../../api'

export default function AdminQR() {
  const { showToast } = useAuth()
  const [tables, setTables] = useState([])
  const [selected, setSelected] = useState('all')
  const [downloaded, setDownloaded] = useState(false)
  const [loading, setLoading] = useState(true)

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

  const [newTableName, setNewTableName] = useState('')

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
        if (selected === String(id)) setSelected('all')
        loadTables()
      } catch(err) {
        showToast('Lỗi khi xóa bàn', '⚠️')
      }
    }
  }

  async function handleDownload(url, name) {
    if (!url) {
      showToast('Chưa có mã QR để tải', '⚠️')
      return
    }
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `QR_${name}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
      
      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 2000)
    } catch (err) {
      showToast('Lỗi tải ảnh', '⚠️')
    }
  }

  function handlePrint() {
    window.print()
  }

  const displayItems = selected === 'all'
    ? [{ id: 'menu', name: 'Menu chính (tất cả bàn)' }, ...tables]
    : tables.filter(t => String(t.id) === selected)

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-[32px] font-bold text-[#0F172A] mb-2 tracking-wide">Tables &amp; QR Codes</h1>
        <div className="flex items-center gap-2 text-[13px] font-bold text-[#64748B] uppercase tracking-wider">
          <span className="text-[#A16207]">Dashboard</span>
          <span>/</span>
          <span>Management</span>
          <span>/</span>
          <span className="text-[#0F172A]">QR Printing</span>
        </div>
      </div>
      <div className="grid lg:grid-cols-[340px_1fr] gap-8">
        {/* Left controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-sm shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-[#E2E8F0] p-8 relative overflow-hidden">
            <h3 className="font-serif font-bold text-[#0F172A] mb-6 text-[22px] flex items-center pl-4 border-l-[3px] border-[#D4AF37]">
              Chọn QR cần in
            </h3>
            
            <div className="flex flex-col gap-3">
              <label className={`flex items-center gap-4 cursor-pointer px-5 py-4 transition-all border ${selected === 'all' ? 'bg-[#FAFAF9] border-[#E2E8F0] shadow-sm' : 'bg-transparent border-[#E2E8F0] hover:bg-gray-50'}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected === 'all' ? 'border-[#A16207]' : 'border-gray-300'}`}>
                  {selected === 'all' && <div className="w-2.5 h-2.5 bg-[#A16207] rounded-full"></div>}
                </div>
                <input type="radio" name="table" value="all" checked={selected === 'all'} onChange={() => setSelected('all')} className="hidden" />
                <span className={`text-[15px] ${selected === 'all' ? 'font-bold text-[#0F172A]' : 'font-medium text-[#64748B]'}`}>Tất cả bàn</span>
                <span className="ml-auto text-[13px] text-gray-400">{tables.length} tables</span>
              </label>
              
              {tables.map(t => (
                <div key={t.id} className={`flex items-center gap-4 px-5 py-4 transition-all border ${selected === String(t.id) ? 'bg-[#FAFAF9] border-[#E2E8F0] shadow-sm' : 'bg-transparent border-[#E2E8F0] hover:bg-gray-50'}`}>
                  <label className="flex items-center gap-4 cursor-pointer flex-1">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected === String(t.id) ? 'border-[#A16207]' : 'border-gray-300'}`}>
                      {selected === String(t.id) && <div className="w-2.5 h-2.5 bg-[#A16207] rounded-full"></div>}
                    </div>
                    <input type="radio" name="table" value={String(t.id)} checked={selected === String(t.id)} onChange={() => setSelected(String(t.id))} className="hidden" />
                    <span className={`text-[15px] ${selected === String(t.id) ? 'font-bold text-[#0F172A]' : 'font-medium text-[#64748B]'}`}>{t.name}</span>
                  </label>
                  <button type="button" onClick={() => handleDeleteTable(t.id)} className="text-gray-300 hover:text-red-500 transition-colors" title="Xóa bàn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </div>
              ))}
              
              <form onSubmit={handleAddTable} className="flex items-center gap-2 mt-4 pt-6 border-t border-gray-100">
                <input 
                  type="text" 
                  value={newTableName} 
                  onChange={e => setNewTableName(e.target.value)} 
                  placeholder="e.g. Table 9" 
                  className="w-full px-4 py-3 border border-[#E2E8F0] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition-all text-[14px] font-medium placeholder-gray-400 bg-transparent"
                />
                <button type="submit" className="px-5 py-3 bg-[#FAFAF9] border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9] font-bold transition-all text-[14px] flex-shrink-0">
                  Add
                </button>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-sm shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-[#E2E8F0] p-8 relative overflow-hidden">
            <h3 className="font-serif font-bold text-[#0F172A] mb-6 text-[22px] flex items-center pl-4 border-l-[3px] border-[#D4AF37]">
              Thao tác
            </h3>
            <div className="flex flex-col gap-4">
              <button onClick={() => {
                if (selected === 'all') {
                  showToast('Vui lòng chọn 1 bàn cụ thể để tải, hoặc tải từng mã bên dưới.', '⚠️')
                } else {
                  const table = tables.find(t => String(t.id) === selected)
                  if (table) {
                     const qrData = `${window.location.origin}/menu/quan-an-ngon?table=${encodeURIComponent(table.name)}`
                     const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrData)}`
                     handleDownload(qrUrl, table.name)
                  }
                }
              }} className="w-full py-4 px-6 bg-[#050A1F] text-[#D4AF37] font-bold text-[14px] hover:bg-[#101835] shadow-md transition-all flex items-center justify-center gap-3 tracking-widest uppercase rounded-sm">
                {downloaded ? (
                  <>Đã tải xuống!</>
                ) : (
                  <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> TẢI XUỐNG PNG</>
                )}
              </button>
              
              <button onClick={handlePrint} className="w-full py-4 px-6 bg-[#050A1F] text-[#D4AF37] font-bold text-[14px] hover:bg-[#101835] shadow-md transition-all flex items-center justify-center gap-3 tracking-widest uppercase rounded-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                IN QR CODE
              </button>
              
              <div className="mt-4 text-center">
                <p className="text-[13px] text-[#64748B] italic">Standard Michelin 300dpi output format.</p>
              </div>
            </div>


          </div>
        </div>

        {/* QR Preview Grid */}
        <div className="bg-white rounded-sm shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-[#E2E8F0] p-12 min-h-[600px] flex flex-col relative overflow-hidden">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <svg width="120" height="80" viewBox="0 0 120 80" fill="none" className="mb-8">
                <path d="M20 70H100" stroke="#E6C087" strokeWidth="3" strokeLinecap="round"/>
                <path d="M25 68C25 45.9086 42.9086 28 65 28C87.0914 28 105 45.9086 105 68" stroke="#E6C087" strokeWidth="3"/>
                <circle cx="65" cy="20" r="4" stroke="#E6C087" strokeWidth="3"/>
                <path d="M65 24V28" stroke="#E6C087" strokeWidth="3"/>
              </svg>
              <h2 className="font-serif text-[28px] text-[#0F172A] font-bold mb-3 tracking-wide">Đang tải danh sách...</h2>
              <p className="text-[#64748B] text-[15px] max-w-md mx-auto mb-10 leading-relaxed">
                Preparing high-resolution table identifiers for your dining room layout.
              </p>
              
              <div className="grid grid-cols-3 gap-6 w-full max-w-2xl mx-auto opacity-50">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col items-center gap-4">
                    <div className="w-full aspect-square bg-[#F1F5F9] rounded-sm animate-pulse"></div>
                    <div className="w-16 h-3 bg-[#F1F5F9] rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {displayItems.map(item => {
                const link = `${window.location.origin}/menu/quan-an-ngon${item.id !== 'menu' ? `?table=${encodeURIComponent(item.name)}` : ''}`
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(link)}`
                
                return (
                  <div key={item.id} className="h-full bg-[#FAFAF9] rounded-sm border border-[#E2E8F0] p-6 flex flex-col items-center hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] transition-all duration-300">
                    <div className="text-[12px] text-[#A16207] font-bold uppercase tracking-widest mb-4 text-center">TABLE</div>
                    <div className="font-serif text-[24px] font-bold text-[#0F172A] mb-6 text-center">{item.name}</div>
                    
                    <div className="bg-white p-3 shadow-sm border border-[#E2E8F0] mb-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => window.open(link, '_blank')}>
                      <img src={qrUrl} alt={`QR Code ${item.name}`} className="w-32 h-32 object-contain" />
                    </div>

                    <a href={link} target="_blank" rel="noreferrer" className="text-[11px] text-blue-600 hover:underline break-all text-center mb-6 px-2 line-clamp-2" title={link}>
                      {link}
                    </a>
                    
                    <button onClick={() => handleDownload(qrUrl, item.name)} className="w-full mt-auto py-3 bg-transparent border border-[#050A1F] text-[#050A1F] text-[13px] font-bold tracking-widest uppercase hover:bg-[#050A1F] hover:text-[#D4AF37] transition-all rounded-sm flex justify-center items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                      DOWNLOAD
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
