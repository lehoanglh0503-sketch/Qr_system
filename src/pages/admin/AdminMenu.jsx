import { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import { useAuth } from '../../App'
import api from '../../api'

function formatPrice(n) {
  return n.toLocaleString('vi-VN') + 'đ'
}

export default function AdminMenu() {
  const { showToast } = useAuth()

  const [view, setView] = useState('categories') // 'categories' or 'products'
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // -- Products State --
  const [selectedCat, setSelectedCat] = useState('Tất cả')
  const [search, setSearch] = useState('')
  const [showProdModal, setShowProdModal] = useState(false)
  const [editProdItem, setEditProdItem] = useState(null)
  const [prodForm, setProdForm] = useState({ name: '', category: 'Món chính', price: '', desc: '', icon: '🍜', available: true })

  // -- Categories State --
  const [showCatModal, setShowCatModal] = useState(false)
  const [editCatItem, setEditCatItem] = useState(null)
  const [catName, setCatName] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [productsData, categoriesData] = await Promise.all([
        api.getProducts(),
        api.getCategories()
      ])
      setItems(productsData)
      setCategories(categoriesData)
    } catch (err) {
      showToast('Lỗi tải dữ liệu', '⚠️')
    } finally {
      setLoading(false)
    }
  }

  // =====================
  // PRODUCT LOGIC
  // =====================
  const filteredItems = items.filter(item => {
    const matchCat = selectedCat === 'Tất cả' || item.category === selectedCat
    const matchSearch = item.name?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  function openAddProduct() {
    setEditProdItem(null)
    setProdForm({ name: '', category: selectedCat !== 'Tất cả' ? selectedCat : (categories[0]?.name || 'Món chính'), price: '', desc: '', icon: '🍜', available: true })
    setShowProdModal(true)
  }

  function openEditProduct(item) {
    setEditProdItem(item)
    setProdForm({ ...item, price: String(item.price) })
    setShowProdModal(true)
  }

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
          if (width > MAX) { height *= MAX / width; width = MAX; }
        } else {
          if (height > MAX) { width *= MAX / height; height = MAX; }
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        setProdForm(f => ({ ...f, icon: canvas.toDataURL('image/jpeg', 0.8) }))
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  async function handleSaveProduct() {
    if (!prodForm.name || !prodForm.price) { showToast('Vui lòng nhập tên và giá', '⚠️'); return }
    const itemData = { ...prodForm, price: Number(String(prodForm.price).replace(/\D/g, '')) }

    try {
      if (editProdItem) {
        await api.updateProduct(editProdItem.id, itemData)
        showToast('Đã cập nhật món ăn!')
      } else {
        await api.createProduct(itemData)
        showToast('Đã thêm món ăn mới! 🍽️')
      }
      setShowProdModal(false)
      loadData()
    } catch (err) {
      showToast('Lỗi lưu món ăn', '⚠️')
    }
  }

  async function handleDeleteProduct(id) {
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

  // =====================
  // CATEGORY LOGIC
  // =====================
  function openAddCategory() {
    setEditCatItem(null)
    setCatName('')
    setShowCatModal(true)
  }

  function openEditCategory(item, e) {
    e.stopPropagation()
    setEditCatItem(item)
    setCatName(item.name)
    setShowCatModal(true)
  }

  async function handleSaveCategory() {
    if (!catName.trim()) {
      showToast('Vui lòng nhập tên loại món', '⚠️')
      return
    }

    try {
      if (editCatItem) {
        await api.updateCategory(editCatItem.id, { name: catName.trim() })
        showToast('Cập nhật loại món thành công', '✅')
      } else {
        await api.createCategory({ name: catName.trim() })
        showToast('Thêm loại món thành công', '✅')
      }
      setShowCatModal(false)
      loadData()
    } catch (error) {
      showToast('Có lỗi xảy ra', '⚠️')
    }
  }

  async function handleDeleteCategory(id, e) {
    e.stopPropagation()
    if (confirm('Bạn có chắc chắn muốn xóa loại món này?')) {
      try {
        await api.deleteCategory(id)
        showToast('Đã xóa loại món', '✅')
        loadData()
      } catch (error) {
        showToast('Có lỗi xảy ra', '⚠️')
      }
    }
  }

  function goToCategory(catName) {
    setSelectedCat(catName)
    setView('products')
  }

  // =====================
  // RENDER
  // =====================

  return (
    <AdminLayout title="Thực đơn">
      <div className="px-2 lg:px-8 py-6 w-full max-w-7xl mx-auto relative min-h-full">

        {view === 'categories' ? (
          // ==============================
          // CATEGORIES VIEW
          // ==============================
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
              <div>
                <h1 className="text-3xl font-black text-[#050A1F] tracking-tight">Thực đơn</h1>
                <p className="text-gray-500 mt-2 font-medium">Quản lý danh mục và các món ăn của nhà hàng</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => goToCategory('Tất cả')}
                  className="bg-white text-[#050A1F] px-6 py-3.5 rounded-full font-bold shadow-sm border border-gray-200 hover:shadow-md transition-all flex items-center gap-2"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  Tất cả các món
                </button>
                <button
                  onClick={openAddCategory}
                  className="bg-[#050A1F] text-[#D4AF37] px-6 py-3.5 rounded-full font-bold shadow-lg shadow-[#050A1F]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 group"
                >
                  <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  </div>
                  Thêm loại món
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <svg className="animate-spin w-10 h-10 mb-4 text-[#D4AF37]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="font-medium text-gray-500">Đang tải danh sách...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-[#F3EFE8] rounded-full flex items-center justify-center mb-6">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <h3 className="text-xl font-bold text-[#050A1F] mb-2">Chưa có loại món nào</h3>
                <p className="text-gray-500 font-medium mb-8 max-w-sm">Hãy thêm các phân loại như "Món chính", "Tráng miệng" để quản lý menu dễ dàng hơn.</p>
                <button onClick={openAddCategory} className="bg-[#F3EFE8] text-[#050A1F] font-bold px-8 py-3 rounded-full hover:bg-[#EADDCD] transition-colors">
                  Thêm loại món đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => goToCategory(cat.name)}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden flex flex-col cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F3EFE8] to-white border border-[#EADDCD] flex items-center justify-center text-[#D4AF37] shadow-inner group-hover:scale-110 transition-transform">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                      </div>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => openEditCategory(cat, e)}
                          className="w-10 h-10 rounded-full bg-gray-50 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors relative"
                          title="Sửa"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                        </button>
                        <button
                          onClick={(e) => handleDeleteCategory(cat.id, e)}
                          className="w-10 h-10 rounded-full bg-gray-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors relative"
                          title="Xóa"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-[#050A1F] mb-1 line-clamp-1">{cat.name}</h3>
                    <div className="mt-auto pt-4 flex items-center gap-3">
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F3EFE8] rounded-lg text-sm font-bold text-[#8B7355]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 20v-5h6v5"></path><path d="M12 4v4"></path><path d="M8 8v4"></path><path d="M16 8v4"></path><path d="M3 13h18"></path></svg>
                        {items.filter(i => i.category === cat.name).length} món
                      </div>
                      <span className="text-xs font-semibold text-gray-400">ID: #{cat.id.substring(0, 4)}</span>
                    </div>

                    <div className="absolute bottom-0 left-0 h-1.5 bg-[#D4AF37] w-0 group-hover:w-full transition-all duration-300"></div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          // ==============================
          // PRODUCTS VIEW
          // ==============================
          <div className="animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <button
                  onClick={() => setView('categories')}
                  className="flex items-center gap-2 text-gray-500 hover:text-[#050A1F] font-bold mb-2 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                  Quay lại danh mục
                </button>
                <h1 className="text-3xl font-black text-[#050A1F] tracking-tight">
                  {selectedCat === 'Tất cả' ? 'Tất cả các món' : selectedCat}
                </h1>
              </div>
              <button
                onClick={openAddProduct}
                className="bg-[#050A1F] text-[#D4AF37] px-6 py-3.5 rounded-full font-bold shadow-lg shadow-[#050A1F]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2 group"
              >
                <div className="w-6 h-6 rounded-full bg-[#D4AF37]/20 flex items-center justify-center group-hover:rotate-90 transition-transform duration-300">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </div>
                Thêm món mới
              </button>
            </div>

            <div className="flex gap-3 mb-8 flex-wrap items-center">
              <div className="flex-1 min-w-[260px] max-w-sm relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                <input
                  placeholder="Tìm kiếm món ăn..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all font-medium"
                />
              </div>

              <div className="flex gap-2 flex-wrap flex-1">
                {['Tất cả', ...categories.map(c => c.name)].map(c => (
                  <button
                    key={c}
                    onClick={() => setSelectedCat(c)}
                    className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${selectedCat === c
                        ? 'bg-[#050A1F] text-[#D4AF37] shadow-md'
                        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                      }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-[#F3EFE8] rounded-full flex items-center justify-center mb-6">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
                </div>
                <h3 className="text-xl font-bold text-[#050A1F] mb-2">Chưa có món ăn nào</h3>
                <p className="text-gray-500 font-medium mb-8 max-w-sm">Danh mục "{selectedCat}" hiện tại chưa có món ăn nào. Hãy thêm món ăn mới.</p>
                <button onClick={openAddProduct} className="bg-[#F3EFE8] text-[#050A1F] font-bold px-8 py-3 rounded-full hover:bg-[#EADDCD] transition-colors">
                  Thêm món đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map(item => (
                  <div key={item.id} className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${!item.available ? 'opacity-70' : ''}`}>
                    <div className="h-48 relative overflow-hidden bg-[#F3EFE8] flex items-center justify-center text-6xl">
                      {item.icon?.startsWith('data:image') || item.icon?.startsWith('http') ? (
                        <img src={item.icon} className="w-full h-full object-cover" alt={item.name} />
                      ) : (
                        item.icon
                      )}
                      {!item.available && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                          <span className="bg-gray-800 text-white font-bold px-4 py-1.5 rounded-full text-sm">Hết món</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-bold text-lg text-[#050A1F] leading-tight line-clamp-1">{item.name}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{item.desc}</p>

                      <div className="flex items-end justify-between mb-5">
                        <div className="text-xl font-black text-red-600">{formatPrice(item.price)}</div>
                        <span className="text-xs font-bold text-[#8B7355] bg-[#F3EFE8] px-2 py-1 rounded-md">{item.category}</span>
                      </div>

                      <div className="flex gap-2 border-t border-gray-100 pt-4">
                        <button onClick={() => openEditProduct(item)} className="flex-1 bg-gray-50 hover:bg-gray-100 text-[#050A1F] font-bold py-2 rounded-xl transition-colors text-sm">
                          Sửa
                        </button>
                        <button onClick={() => toggleAvailable(item)} className={`flex-1 font-bold py-2 rounded-xl transition-colors text-sm ${item.available ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                          {item.available ? 'Tắt' : 'Bật'}
                        </button>
                        <button onClick={() => handleDeleteProduct(item.id)} className="w-10 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 flex items-center justify-center rounded-xl transition-colors">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================== */}
        {/* MODALS */}
        {/* ============================== */}

        {/* Category Modal */}
        {showCatModal && (
          <div className="fixed inset-0 bg-[#050A1F]/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="p-8 pb-6 relative">
                <div className="w-12 h-12 rounded-full bg-[#F3EFE8] text-[#D4AF37] flex items-center justify-center mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                </div>
                <h3 className="text-2xl font-black text-[#050A1F] mb-2">{editCatItem ? 'Cập nhật loại món' : 'Thêm loại món mới'}</h3>
                <button onClick={() => setShowCatModal(false)} className="absolute top-6 right-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
              <div className="px-8 py-2">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 ml-1">Tên loại món <span className="text-red-500">*</span></label>
                  <input type="text" value={catName} onChange={e => setCatName(e.target.value)} className="w-full px-5 py-4 bg-[#F3EFE8] border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-bold text-[#050A1F] placeholder-gray-400" placeholder="VD: Món chính..." autoFocus />
                </div>
              </div>
              <div className="p-8 pt-8 flex gap-4">
                <button onClick={() => setShowCatModal(false)} className="flex-1 px-6 py-4 rounded-full font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">Hủy bỏ</button>
                <button onClick={handleSaveCategory} className="flex-1 px-6 py-4 rounded-full font-bold text-[#D4AF37] bg-[#050A1F] shadow-lg shadow-[#050A1F]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">{editCatItem ? 'Cập nhật' : 'Thêm mới'}</button>
              </div>
            </div>
          </div>
        )}

        {/* Product Modal */}
        {showProdModal && (
          <div className="fixed inset-0 bg-[#050A1F]/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="p-6 sm:p-8 pb-4 relative">
                <h3 className="text-2xl font-black text-[#050A1F] mb-1">{editProdItem ? 'Cập nhật món ăn' : 'Thêm món ăn mới'}</h3>
                <p className="text-gray-500 font-medium">Nhập thông tin chi tiết cho món ăn.</p>
                <button onClick={() => setShowProdModal(false)} className="absolute top-6 right-6 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              <div className="px-6 sm:px-8 py-2 max-h-[60vh] overflow-y-auto no-scrollbar space-y-5">
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-2xl bg-[#F3EFE8] flex items-center justify-center text-3xl overflow-hidden shrink-0 border border-gray-100 shadow-inner">
                    {prodForm.icon?.startsWith('data:') || prodForm.icon?.startsWith('http') ? (
                      <img src={prodForm.icon} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      prodForm.icon || '🍽️'
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Hình ảnh / Emoji</label>
                    <div className="flex gap-2">
                      <label className="flex-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-center cursor-pointer transition-colors text-sm">
                        Tải ảnh lên
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                      <input
                        value={(!prodForm.icon?.startsWith('data:') && !prodForm.icon?.startsWith('http')) ? prodForm.icon : ''}
                        onChange={e => setProdForm(f => ({ ...f, icon: e.target.value }))}
                        className="w-16 text-center bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#D4AF37] font-medium"
                        placeholder="🍕"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Tên món ăn <span className="text-red-500">*</span></label>
                  <input type="text" value={prodForm.name} onChange={e => setProdForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-3 bg-[#F3EFE8] border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-bold text-[#050A1F]" placeholder="VD: Phở bò đặc biệt" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Danh mục</label>
                    <select value={prodForm.category} onChange={e => setProdForm({ ...prodForm, category: e.target.value })} className="w-full px-4 py-3 bg-[#F3EFE8] border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-bold text-[#050A1F] appearance-none">
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Giá (đ) <span className="text-red-500">*</span></label>
                    <input type="number" value={prodForm.price} onChange={e => setProdForm(f => ({ ...f, price: e.target.value }))} className="w-full px-4 py-3 bg-[#F3EFE8] border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-bold text-[#050A1F]" placeholder="50000" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Mô tả (không bắt buộc)</label>
                  <textarea value={prodForm.desc} onChange={e => setProdForm(f => ({ ...f, desc: e.target.value }))} className="w-full px-4 py-3 bg-[#F3EFE8] border-2 border-transparent rounded-xl outline-none focus:bg-white focus:border-[#D4AF37] transition-all font-medium text-[#050A1F] resize-none h-20" placeholder="Mô tả ngắn gọn về món ăn..." />
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                  <input type="checkbox" checked={prodForm.available} onChange={e => setProdForm(f => ({ ...f, available: e.target.checked }))} className="w-5 h-5 accent-[#050A1F]" />
                  <span className="font-bold text-gray-700">Món đang phục vụ (Có sẵn)</span>
                </label>
              </div>

              <div className="p-6 sm:p-8 pt-6 flex gap-3">
                <button onClick={() => setShowProdModal(false)} className="flex-1 px-6 py-3.5 rounded-full font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors">Hủy bỏ</button>
                <button onClick={handleSaveProduct} className="flex-[2] px-6 py-3.5 rounded-full font-bold text-[#D4AF37] bg-[#050A1F] shadow-lg shadow-[#050A1F]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">{editProdItem ? 'Cập nhật món' : 'Thêm món ăn'}</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}
