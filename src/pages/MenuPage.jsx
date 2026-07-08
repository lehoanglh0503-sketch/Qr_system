import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useAuth } from '../App'
import api from '../api'

function formatPrice(n) {
  return n.toLocaleString('vi-VN') + 'đ'
}

export default function MenuPage() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const tableName = searchParams.get('table')
  const { showToast } = useAuth() || {}

  const [items, setItems] = useState([])
  const [categories, setCategories] = useState(['Tất cả'])
  const [company, setCompany] = useState({ name: 'VIỆT NHẬT', logo: 'vn', primaryColor: '#050A1F' })
  const [loading, setLoading] = useState(true)

  const [selectedCat, setSelectedCat] = useState('Tất cả')
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [isOrdering, setIsOrdering] = useState(false)
  const [tableNum] = useState(tableName || 'Bàn chưa rõ')
  const [search, setSearch] = useState('')
  const [note, setNote] = useState('')
  const [callingStaff, setCallingStaff] = useState(false)
  const [requestingBill, setRequestingBill] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [productsData, categoriesData, companyData] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getCompanyInfo()
      ])
      
      setItems(productsData.filter(i => i.available)) // Only show available
      setCategories(['Tất cả', ...categoriesData.map(c => c.name)])
      if (companyData) setCompany(companyData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = items.filter(item => {
    const matchCat = selectedCat === 'Tất cả' || item.category === selectedCat
    const matchSearch = item.name?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  function addToCart(item) {
    setCart(prev => {
      const ex = prev.find(c => c.id === item.id)
      if (ex) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  function changeQty(id, delta) {
    setCart(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, qty: c.qty + delta } : c)
      return updated.filter(c => c.qty > 0)
    })
  }



  async function placeOrder() {
    setIsOrdering(true)
    try {
      await api.createOrder({
        tableName: tableNum,
        items: cart.map(c => ({ id: c.id, name: c.name, price: c.price, quantity: c.qty })),
        totalAmount: totalPrice,
        note: note
      })
      setOrderPlaced(true)
      setCart([])
      setNote('')
      setCartOpen(false)
      setTimeout(() => setOrderPlaced(false), 5000)
    } catch (err) {
      if (showToast) showToast('Lỗi đặt món, vui lòng gọi nhân viên', '⚠️')
      else alert('Lỗi đặt món, vui lòng gọi nhân viên')
    } finally {
      setIsOrdering(false)
    }
  }

  async function handleCallStaff() {
    setCallingStaff(true)
    try {
      await api.createNotification({ tableName: tableNum, type: 'Call_Staff' })
      if (showToast) showToast('Đã gọi nhân viên, vui lòng chờ trong giây lát', '🛎️')
      else alert('Đã gọi nhân viên, vui lòng chờ trong giây lát')
    } catch (err) {
      if (showToast) showToast('Lỗi khi gọi nhân viên', '⚠️')
    } finally {
      setCallingStaff(false)
    }
  }

  async function handleRequestBill() {
    setRequestingBill(true)
    try {
      await api.createNotification({ tableName: tableNum, type: 'Request_Bill' })
      if (showToast) showToast('Đã yêu cầu thanh toán, nhân viên sẽ tới ngay', '💰')
      else alert('Đã yêu cầu thanh toán, nhân viên sẽ tới ngay')
    } catch (err) {
      if (showToast) showToast('Lỗi khi yêu cầu thanh toán', '⚠️')
    } finally {
      setRequestingBill(false)
    }
  }

  const totalItems = cart.reduce((s, c) => s + c.qty, 0)
  const totalPrice = cart.reduce((s, c) => s + c.qty * c.price, 0)
  const getQtyInCart = (id) => cart.find(c => c.id === id)?.qty || 0

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-[#8B7355] bg-[#FAF8F5]">
      <svg className="animate-spin h-10 w-10 text-[#8B7355]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <span className="font-serif italic text-lg">Đang chuẩn bị thực đơn...</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-32 font-sans relative text-[#1C1917]">
      {/* Header (Premium Fine Dining) */}
      <header className="bg-[#FAF8F5] border-b border-[#EADDCD] sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          {/* Top row mobile / Left desktop */}
          <div className="flex items-center justify-between w-full md:w-auto md:flex-shrink-0">
            {company.logo?.startsWith('http') || company.logo?.startsWith('data:image') ? (
              <img src={company.logo} className="h-8 object-contain" alt="Logo" />
            ) : (
              <h1 className="m-0 text-xl md:text-2xl font-serif font-black tracking-[0.2em] uppercase text-[#1C1917]">{company.name}</h1>
            )}

            {/* Right: Table Info (Mobile) */}
            <div className="md:hidden flex items-center gap-4">
              <button className="text-gray-800 hover:text-[#8B7355] transition-colors" onClick={handleCallStaff}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              </button>
              <div className="text-right border-r border-[#EADDCD] pr-3">
                <div className="text-[12px] font-bold text-[#1C1917]">{tableNum}</div>
                <div className="text-[9px] uppercase tracking-widest text-gray-500 mt-0.5">Sảnh Chính</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#050A1F] flex items-center justify-center text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
            </div>
          </div>

          {/* Center: Search */}
          <div className="w-full md:flex-1 md:max-w-xl relative">
             <label htmlFor="searchInput" className="sr-only">Tìm kiếm món ăn tinh hoa...</label>
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
             </span>
             <input
               id="searchInput"
               value={search}
               onChange={e => setSearch(e.target.value)}
               placeholder="Tìm kiếm món ăn tinh hoa..."
               className="w-full pl-11 pr-4 py-3 rounded-lg text-[14px] bg-[#F3EFE8] border-none focus:outline-none focus:ring-1 focus:ring-[#8B7355] transition-all placeholder-gray-500 font-serif italic"
             />
          </div>

          {/* Right: Table Info (Desktop) */}
          <div className="hidden md:flex flex-shrink-0 items-center gap-6">
            <button className="text-gray-800 hover:text-[#8B7355] transition-colors" onClick={handleCallStaff}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            </button>
            <div className="text-right border-r border-[#EADDCD] pr-4">
              <div className="text-[13px] font-bold text-[#1C1917]">{tableNum}</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-0.5">Sảnh Chính</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#050A1F] flex items-center justify-center text-white cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
          </div>
        </div>
      </header>

      {/* Categories (Fine Dining Tab Style) */}
      <div className="bg-[#FAF8F5] sticky top-[138px] md:top-[81px] z-20 shadow-[0_4px_10px_-10px_rgba(0,0,0,0.1)]">
        <div className="max-w-4xl mx-auto px-5 py-4 overflow-x-auto whitespace-nowrap flex justify-start sm:justify-center gap-8 no-scrollbar">
          {categories.map(c => (
            <button
              key={c}
              className={`pb-2 text-[12px] uppercase tracking-[0.15em] font-bold transition-all relative flex-shrink-0 ${
                selectedCat === c 
                  ? 'text-[#1C1917]' 
                  : 'text-gray-400 hover:text-[#8B7355]'
              }`}
              onClick={() => setSelectedCat(c)}
            >
              {c}
              {selectedCat === c && (
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#8B7355]"></span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Order success banner */}
      {orderPlaced && (
        <div className="bg-emerald-100 border-2 border-emerald-300 mx-5 my-4 rounded-2xl p-4 flex items-center gap-4 shadow-sm animate-fadeInUp">
          <span className="text-3xl">🎉</span>
          <div>
            <div className="font-extrabold text-emerald-800 text-base">Đặt món thành công!</div>
            <div className="text-sm font-medium text-emerald-700 leading-tight mt-0.5">Nhà hàng đã nhận được đơn của bạn. Vui lòng chờ trong giây lát!</div>
          </div>
        </div>
      )}

      {/* Menu grid */}
      <div className="max-w-4xl mx-auto px-5 pt-4 pb-12">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16 px-4 bg-white rounded-3xl border border-gray-100 shadow-sm mt-4">
            <div className="text-6xl mb-4 opacity-50 grayscale">🍽️</div>
            <p className="text-gray-500 font-medium text-lg">Không tìm thấy món nào</p>
          </div>
        ) : (
          <>
            {selectedCat === 'Tất cả' && search === '' && items.some(i => i.popular && i.available) && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">🔥</span>
                  <h2 className="text-xl font-bold text-gray-900 m-0">Món nổi bật</h2>
                </div>
                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar -mx-5 px-5">
                  {items.filter(i => i.popular && i.available).map(item => (
                    <div key={`pop-${item.id}`} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && addToCart(item)} onClick={() => addToCart(item)} className="bg-white rounded-xl sm:rounded-2xl border border-[#EADDCD] shadow-[0_4px_15px_rgba(0,0,0,0.03)] p-3 sm:p-4 cursor-pointer min-w-[130px] sm:min-w-[160px] w-[130px] sm:w-[160px] flex-shrink-0 flex flex-col items-center active:scale-95 transition-all duration-300 group relative">
                      {getQtyInCart(item.id) > 0 && (
                        <div className="absolute -top-2 -right-2 bg-[#8B7355] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10 border-2 border-white">
                          {getQtyInCart(item.id)}
                        </div>
                      )}
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#F3EFE8] flex items-center justify-center text-[2.5rem] sm:text-[3rem] mb-2 sm:mb-3 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                        {item.icon?.startsWith('data:image') || item.icon?.startsWith('http') ? (
                          <img src={item.icon} className="w-full h-full object-cover" alt={item.name} />
                        ) : (
                          item.icon
                        )}
                      </div>
                      <div className="text-[13px] sm:text-[14px] font-bold font-serif text-[#1C1917] mb-1 line-clamp-2 leading-tight text-center">{item.name}</div>
                      <div className="mt-auto pt-1 sm:pt-2 flex items-center justify-center w-full">
                        <span className="text-[14px] sm:text-[15px] font-black text-[#8B7355]">{formatPrice(item.price)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mt-6">
              {filtered.map(item => (
                <div key={item.id} role="button" tabIndex={item.available ? 0 : -1} onKeyDown={(e) => e.key === 'Enter' && item.available && getQtyInCart(item.id) === 0 && addToCart(item)} className={`bg-white flex flex-row sm:flex-col relative group shadow-sm sm:shadow-md rounded-xl sm:rounded-none overflow-hidden border border-[#EADDCD] sm:border-transparent ${item.available ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`} onClick={() => item.available && getQtyInCart(item.id) === 0 && addToCart(item)}>
                  <div className="relative w-[110px] sm:w-full h-[120px] sm:h-[250px] bg-[#F3EFE8] flex-shrink-0 sm:p-2 border-r sm:border-r-0 border-[#EADDCD] sm:border-transparent">
                    {item.popular && (
                      <div className="absolute top-1 left-1 sm:top-4 sm:left-4 z-10 bg-white/90 backdrop-blur-sm text-[#8B7355] text-[7px] sm:text-[9px] uppercase tracking-[0.1em] sm:tracking-[0.2em] font-bold px-1.5 sm:px-3 py-0.5 sm:py-1 border border-[#EADDCD] rounded-sm sm:rounded-none">
                        CHEF
                      </div>
                    )}
                    {!item.available && (
                      <div className="absolute inset-0 z-10 bg-black/50 flex items-center justify-center text-white font-serif tracking-[0.1em] sm:tracking-[0.2em] text-[11px] sm:text-[14px] uppercase text-center p-1">Hết món</div>
                    )}
                    {item.icon?.startsWith('data:image') || item.icon?.startsWith('http') ? (
                      <img src={item.icon} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={item.name} />
                    ) : (
                      <span className="text-[3rem] sm:text-[5rem] flex items-center justify-center h-full group-hover:scale-105 transition-transform duration-500 opacity-60">{item.icon}</span>
                    )}
                  </div>
                  <div className="p-3 sm:p-6 flex flex-col flex-1 bg-white items-start sm:items-center text-left sm:text-center justify-between">
                    <div className="w-full">
                      <div className="font-serif font-bold text-[#1C1917] text-[15px] sm:text-[18px] leading-snug mb-1 sm:mb-2 line-clamp-2">{item.name}</div>
                      <div className="font-serif italic text-gray-500 text-[12px] sm:text-[13px] leading-tight sm:leading-relaxed line-clamp-2 sm:line-clamp-none mb-2 sm:mb-6">{item.desc || 'A signature dish crafted with passion'}</div>
                    </div>
                    <div className="mt-auto w-full flex items-center justify-between sm:border-t sm:border-dashed border-[#EADDCD] sm:pt-5">
                      <span className="font-serif font-bold text-[#8B7355] text-[15px] sm:text-[17px] tracking-wide">{formatPrice(item.price)}</span>
                      {item.available && (
                        getQtyInCart(item.id) > 0 ? (
                          <div className="flex items-center gap-1.5 sm:gap-3" onClick={e => e.stopPropagation()}>
                            <button className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-[#8B7355] text-[#8B7355] rounded-md hover:bg-[#8B7355] hover:text-white transition-colors" onClick={() => changeQty(item.id, -1)} aria-label="Giảm số lượng">−</button>
                            <span className="font-bold text-[#1C1917] text-[13px] sm:text-[14px] min-w-[14px] sm:min-w-[16px] text-center">{getQtyInCart(item.id)}</span>
                            <button className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center border border-[#8B7355] bg-[#8B7355] text-white rounded-md hover:bg-[#6e5b43] transition-colors" onClick={() => changeQty(item.id, 1)} aria-label="Tăng số lượng">+</button>
                          </div>
                        ) : (
                          <button className="w-7 h-7 sm:w-8 sm:h-8 border border-[#EADDCD] text-[#8B7355] rounded-md flex items-center justify-center hover:border-[#8B7355] transition-colors duration-300 bg-white" onClick={(e) => { e.stopPropagation(); addToCart(item); }} aria-label="Thêm vào giỏ hàng">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}


      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FAF8F5] border-t border-[#EADDCD] shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          {/* Left: Table & WiFi */}
          <div className="hidden sm:flex items-center gap-6">
             <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#1C1917]">
               <span className="w-2 h-2 rounded-full bg-[#8B7355]"></span>
               BÀN {tableNum.replace('Bàn ', '')}
             </div>
          </div>

          {/* Right: Cart Summary */}
          <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-6 w-full sm:w-auto relative">
             <div className="text-left sm:text-right pl-1 sm:pl-0">
               <div className="text-[9px] md:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-gray-500 mb-0.5">Tạm tính</div>
               <div className="font-serif font-bold text-[15px] sm:text-[16px] md:text-[18px] text-[#1C1917] tracking-wide">{formatPrice(totalPrice)}</div>
             </div>
             <button onClick={() => setCartOpen(true)} className="px-4 sm:px-6 md:px-8 py-3 sm:py-3.5 bg-[#050A1F] text-white font-bold text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.2em] hover:bg-[#1C1917] transition-colors rounded-lg sm:rounded-none relative flex-shrink-0">
               GIỎ HÀNG {totalItems > 0 && `(${totalItems})`}
             </button>
             
             {/* Floating Bell Icon (Above right side) */}
             <button onClick={handleCallStaff} className="w-10 h-10 sm:w-12 sm:h-12 bg-[#8B7355] text-white flex items-center justify-center shadow-[0_4px_15px_rgba(139,115,85,0.4)] hover:bg-[#6e5b43] transition-colors absolute right-0 -top-[64px] sm:-top-[76px] rounded-full sm:rounded-md" aria-label="Gọi nhân viên">
               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
             </button>
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#FAF8F5] rounded-t-xl sm:rounded-xl max-h-[90vh] sm:max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-fadeInUp">
            <div className="p-5 border-b border-[#EADDCD] flex items-center justify-between bg-white">
              <h2 className="m-0 text-xl font-serif font-bold text-[#1C1917] flex items-center gap-2">Giỏ hàng của bạn</h2>
              <button onClick={() => setCartOpen(false)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#1C1917] rounded-full transition-colors font-bold">✕</button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-16 px-6 text-gray-400 flex-1 overflow-auto">
                <div className="text-6xl mb-4 grayscale opacity-50">🛒</div>
                <p className="font-medium text-lg">Chưa có món nào trong giỏ</p>
                <button onClick={() => setCartOpen(false)} className="mt-6 px-6 py-2.5 bg-zinc-100 text-zinc-900 font-bold rounded-full text-sm">Tiếp tục chọn món</button>
              </div>
            ) : (
              <>
                <div className="overflow-y-auto flex-1 p-5 scrollbar-hide bg-[#FAF8F5]">
                  <div className="flex flex-col gap-4">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center gap-4 bg-white border border-[#EADDCD] p-3 rounded-lg shadow-sm">
                        <div className="w-16 h-16 bg-[#F3EFE8] flex items-center justify-center text-3xl overflow-hidden flex-shrink-0">
                          {item.icon?.startsWith('data:image') || item.icon?.startsWith('http') ? (
                            <img src={item.icon} className="w-full h-full object-cover" alt={item.name} />
                          ) : (
                            item.icon
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-serif font-bold text-[#1C1917] text-[15px] line-clamp-1 mb-1">{item.name}</div>
                          <div className="text-[#8B7355] font-serif font-bold text-[14px]">{formatPrice(item.price)}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-3">
                            <button className="w-7 h-7 border border-[#8B7355] text-[#8B7355] rounded flex items-center justify-center font-bold active:scale-95 hover:bg-[#8B7355] hover:text-white transition-colors" onClick={() => changeQty(item.id, -1)} aria-label="Giảm số lượng">−</button>
                            <span className="font-bold text-[#1C1917] text-sm min-w-[16px] text-center">{item.qty}</span>
                            <button className="w-7 h-7 border border-[#8B7355] bg-[#8B7355] text-white rounded flex items-center justify-center font-bold active:scale-95 hover:bg-[#6e5b43] transition-colors" onClick={() => changeQty(item.id, 1)} aria-label="Tăng số lượng">+</button>
                          </div>
                          <span className="text-xs font-bold text-gray-400">={formatPrice(item.qty * item.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 bg-white p-4 rounded-lg border border-[#EADDCD]">
                    <label htmlFor="noteInput" className="text-xs uppercase tracking-[0.15em] font-bold text-gray-500 block mb-2">
                      Ghi chú cho bếp
                    </label>
                    <textarea
                      id="noteInput"
                      value={note}
                      onChange={e => setNote(e.target.value)}
                      placeholder="VD: Ít ớt, không hành..."
                      className="w-full p-3 rounded-none border border-[#EADDCD] text-sm focus:border-[#8B7355] focus:ring-1 focus:ring-[#8B7355] outline-none transition-all resize-none h-20 bg-[#FAF8F5] font-serif italic"
                    />
                  </div>
                </div>

                <div className="p-4 sm:p-5 bg-white border-t border-[#EADDCD] shadow-[0_-10px_20px_rgba(0,0,0,0.03)] pb-safe">
                  <div className="flex justify-between items-end mb-4 sm:mb-5">
                    <span className="text-gray-500 text-[10px] sm:text-[11px] uppercase tracking-[0.1em]">Tổng cộng ({totalItems} món)</span>
                    <span className="text-[#1C1917] text-xl sm:text-2xl font-serif font-bold tracking-tight">{formatPrice(totalPrice)}</span>
                  </div>

                  <div className="flex gap-2 sm:gap-3">
                    <button onClick={handleRequestBill} disabled={requestingBill} className="px-3 sm:px-5 py-3 sm:py-3.5 bg-white text-[#1C1917] font-bold text-[9px] sm:text-[11px] uppercase tracking-[0.1em] border border-[#EADDCD] hover:border-[#8B7355] transition-colors rounded-lg sm:rounded-none focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2">
                      {requestingBill ? 'ĐANG GỌI...' : 'TÍNH TIỀN'}
                    </button>
                    <button onClick={placeOrder} disabled={isOrdering} className="flex-1 py-3 sm:py-3.5 text-white font-bold text-[10px] sm:text-[12px] uppercase tracking-[0.1em] sm:tracking-[0.2em] flex items-center justify-center gap-2 shadow-sm rounded-lg sm:rounded-none hover:opacity-90 active:scale-95 transition-all focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed bg-[#050A1F]">
                      {isOrdering ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : 'ĐẶT MÓN NGAY'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}
