import { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import { useAuth } from '../../App'
import api from '../../api'

export default function AdminOrders() {
  const { showToast } = useAuth()
  const [orders, setOrders] = useState([])
  const [tables, setTables] = useState([])
  const [selectedTableName, setSelectedTableName] = useState(null)
  const [loading, setLoading] = useState(true)
  const [printingOrder, setPrintingOrder] = useState(null)

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [orderNote, setOrderNote] = useState('')

  useEffect(() => {
    loadOrders(true)
    loadTables()
    const interval = setInterval(() => {
      loadOrders(false)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (printingOrder) {
      const timer = setTimeout(() => {
        window.print()
        if (printingOrder.shouldPay) {
          handleStatusChange(printingOrder.id, 'paid')
        }
        setPrintingOrder(null)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [printingOrder])

  async function loadTables() {
    try {
      const data = await api.getTables()
      setTables(data || [])
    } catch (err) {
      console.error('Lỗi tải danh sách bàn', err)
    }
  }

  async function loadOrders(showSpinner = true) {
    if (showSpinner && orders.length === 0) setLoading(true)
    try {
      const data = await api.getOrders()
      setOrders(data || [])
    } catch (err) {
      if (showSpinner) showToast('Lỗi tải danh sách đơn', '⚠️')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id, status) {
    try {
      await api.updateOrderStatus(id, status)
      showToast('Đã cập nhật trạng thái đơn')
      loadOrders()
    } catch (err) {
      showToast('Lỗi cập nhật', '⚠️')
    }
  }

  async function handleItemStatusChange(orderId, itemIndex, newStatus) {
    try {
      await api.updateOrderItemStatus(orderId, itemIndex, newStatus)
      loadOrders(false)
    } catch (err) {
      showToast('Lỗi cập nhật món', '⚠️')
    }
  }

  const handlePrintOnly = (order) => {
    setPrintingOrder({ ...order, shouldPay: false })
  }

  const handlePay = (order) => {
    // If order has pending items, warn
    const allServed = order.items?.every(i => i.status === 'served')
    if (!allServed) {
      if (!window.confirm('Vẫn còn món đang làm hoặc chưa bưng. Bạn có chắc chắn muốn thanh toán không?')) {
        return
      }
    }
    setShowPaymentModal(true)
  }

  const confirmPayment = (order) => {
    setPrintingOrder({ ...order, paymentMethod, orderNote, shouldPay: true })
    setShowPaymentModal(false)
  }

  // Get active order for selected table
  const selectedOrder = orders.find(o => o.tableName === selectedTableName && o.status !== 'paid')

  return (
    <>
      {/* Giao diện in hóa đơn */}
      {printingOrder && (
        <div className="print-only hidden print:block" style={{ width: '80mm', margin: '0 auto', fontFamily: 'monospace', color: '#000', padding: '10px', fontSize: '12px', background: 'white' }}>
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>NHÀ HÀNG GỌI MÓN</h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>ĐC: 123 Đường ABC, Quận 1, TP.HCM</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px' }}>SĐT: 0123 456 789</p>
          </div>

          <h3 style={{ textAlign: 'center', margin: '10px 0', fontSize: '16px', fontWeight: 'bold', borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '5px 0' }}>
            HÓA ĐƠN THANH TOÁN
          </h3>

          <div style={{ marginBottom: '10px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Bàn:</span> <strong>{printingOrder.tableName}</strong></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Mã đơn:</span> <span>#{printingOrder.id?.substring(0, 6).toUpperCase()}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Ngày:</span> <span>{new Date().toLocaleString('vi-VN')}</span></div>
          </div>

          <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

          <table style={{ width: '100%', fontSize: '12px', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #000' }}>
                <th style={{ padding: '4px 0', width: '20%' }}>SL</th>
                <th style={{ padding: '4px 0', width: '80%' }}>Tên món</th>
              </tr>
            </thead>
            <tbody>
              {printingOrder.items?.map((i, idx) => (
                <tr key={idx}>
                  <td style={{ padding: '4px 0', verticalAlign: 'top' }}>{i.quantity}</td>
                  <td style={{ padding: '4px 0' }}>
                    <div>{i.name}</div>
                    <div style={{ color: '#666', fontSize: '10px' }}>{Number(i.price).toLocaleString('vi-VN')}đ</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
            <span>TỔNG CỘNG:</span>
            <span>{Number(printingOrder.totalAmount).toLocaleString('vi-VN')} đ</span>
          </div>

          {printingOrder.paymentMethod === 'qr' && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', fontWeight: 'bold' }}>Quét mã QR để thanh toán</p>
              <img
                src={`https://img.vietqr.io/image/mb-0853272393-compact2.png?amount=${printingOrder.totalAmount}&addInfo=ThanhToan${printingOrder.id?.substring(0, 6)}`}
                alt="QR Code MB Bank"
                style={{ width: '150px', height: '150px', objectFit: 'contain' }}
              />
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px' }}>
            <p style={{ margin: 0 }}>Cảm ơn quý khách!</p>
            <p style={{ margin: '2px 0 0 0' }}>Hẹn gặp lại.</p>
          </div>
        </div>
      )}

      {/* Main UI */}
      <div className="no-print print:hidden">
        <AdminLayout showHeader={true}>
          <div className="flex min-h-[calc(100vh-140px)] gap-6 font-sans">

            {/* Left Panel: Tables Grid */}
            <div className="flex-1 flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-white z-10">
                <h2 className="text-2xl font-serif font-bold text-gray-900">Sơ Đồ {tables.length} Bàn Ăn L'Étoile</h2>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-6 text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                    <span className="text-gray-600">Trống</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                    <span className="text-gray-600">Đang phục vụ</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                {loading && tables.length === 0 ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {tables.map((table, idx) => {
                      const tableOrders = orders.filter(o => o.tableName === table.name && o.status !== 'paid');
                      const activeOrder = tableOrders.length > 0 ? tableOrders[0] : null;
                      const isSelected = selectedTableName === table.name;
                      const isOccupied = !!activeOrder;

                      return (
                        <div
                          key={table.id || idx}
                          onClick={() => setSelectedTableName(table.name)}
                          className={`relative flex flex-col justify-between cursor-pointer rounded-[20px] p-6 border transition-all duration-200 min-h-[140px]
                            ${isOccupied
                              ? (isSelected ? 'border-[#ef4444] bg-[#fef2f2] shadow-md ring-4 ring-[#ef4444]/10 z-10 scale-[1.02]' : 'border-red-100 bg-[#fef2f2] hover:border-red-200 hover:shadow-md shadow-sm')
                              : (isSelected ? 'border-[#10b981] bg-white shadow-md ring-4 ring-[#10b981]/10 z-10 scale-[1.02]' : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-md shadow-sm')
                            }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className={`font-serif text-[20px] font-bold ${isSelected ? 'text-[#050A1F]' : 'text-[#0F172A]'}`}>{table.name}</h3>
                            <span className={`w-2.5 h-2.5 rounded-full shadow-sm mt-1.5 ${isOccupied ? 'bg-[#ef4444]' : 'bg-[#10b981]'}`}></span>
                          </div>

                          {isOccupied && (
                            <div className="flex justify-between items-end mt-auto pt-4">
                              <div className="flex items-center gap-1">
                                <span className="text-[15px] font-bold text-[#ef4444]">{activeOrder.items?.reduce((sum, i) => sum + i.quantity, 0)}</span>
                                <span className="text-[13px] font-medium text-[#ef4444]">món</span>
                              </div>
                              <span className="text-[16px] font-bold text-[#ef4444]">{Number(activeOrder.totalAmount).toLocaleString('vi-VN')}đ</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Receipt */}
            <div className="w-[380px] xl:w-[450px] h-full bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col flex-shrink-0 relative">
              {selectedTableName ? (
                <>
                  {/* Receipt Header */}
                  <div className="p-6 pb-4 border-b border-gray-100 bg-white rounded-t-2xl z-10 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#fffbf2] border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <div>
                          <h2 className="text-xl font-serif font-bold text-gray-900">Chi Tiết Hóa Đơn</h2>
                          <div className="text-sm font-medium text-[#D4AF37]">{selectedTableName}</div>
                        </div>
                      </div>

                      {selectedOrder && (
                        <span className="px-3 py-1 bg-red-50 text-[#ef4444] text-xs font-bold rounded-full uppercase tracking-wider border border-red-100">
                          {selectedOrder.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedOrder ? (
                    <>
                      {/* Receipt Items */}
                      <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                        <div className="space-y-4">
                          {selectedOrder.items?.map((item, idx) => (
                            <div key={idx} className="flex flex-col group relative">
                              <div className="flex justify-between items-start">
                                <div className="flex-1 pr-4">
                                  <div className="font-semibold text-gray-900 text-[15px]">{item.name}</div>
                                  <div className="text-sm text-gray-500 mt-0.5">{Number(item.price).toLocaleString('vi-VN')}đ/món</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-bold text-gray-900">x{item.quantity}</div>
                                  <div className="font-bold text-gray-900 mt-1">{Number(item.price * item.quantity).toLocaleString('vi-VN')}đ</div>
                                </div>
                              </div>

                              {/* Item status / actions for cashier */}
                              <div className="mt-2 flex gap-2">
                                {item.status === 'ready' && (
                                  <button onClick={() => handleItemStatusChange(selectedOrder.id, idx, 'served')} className="text-[10px] font-bold px-2 py-1 bg-[#10b981] text-white rounded cursor-pointer hover:bg-[#059669]">
                                    Đánh dấu đã bưng
                                  </button>
                                )}
                                {(item.status === 'pending' || item.status === 'cooking') && (
                                  <span className="text-[10px] font-bold px-2 py-1 bg-orange-100 text-orange-600 border border-orange-200 rounded">
                                    Đang nấu
                                  </span>
                                )}
                                {item.status === 'served' && (
                                  <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded">
                                    Đã phục vụ
                                  </span>
                                )}
                              </div>

                              <div className="w-full h-px border-b border-dashed border-gray-200 mt-4"></div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Receipt Summary */}
                      <div className="p-6 bg-white border-t border-gray-100 rounded-b-2xl shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Tạm tính:</span>
                            <span className="font-medium text-gray-900">{Number(selectedOrder.totalAmount).toLocaleString('vi-VN')}đ</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Giảm giá (Discount):</span>
                            <select className="border border-gray-200 rounded p-1 text-sm bg-gray-50 outline-none focus:border-[#D4AF37]">
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="10">10%</option>
                            </select>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">Thuế VAT (8%):</span>
                            <span className="font-medium text-gray-900">{Number(selectedOrder.totalAmount * 0.08).toLocaleString('vi-VN')}đ</span>
                          </div>

                          <div className="h-px bg-gray-200 my-4"></div>

                          <div className="flex justify-between items-center">
                            <span className="text-base font-bold text-gray-900">Tổng thanh toán:</span>
                            <span className="text-2xl font-bold text-[#D4AF37]">
                              {Number(selectedOrder.totalAmount * 1.08).toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => handlePrintOnly(selectedOrder)}
                            className="py-3.5 px-4 rounded-xl border-2 border-gray-200 bg-[#f9fafb] text-gray-700 font-bold hover:bg-gray-100 hover:border-gray-300 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                            In Hóa Đơn
                          </button>
                          <button
                            onClick={() => handlePay(selectedOrder)}
                            className="py-3.5 px-4 rounded-xl bg-[#D4AF37] text-white font-bold hover:bg-[#b8952b] transition-colors shadow-lg shadow-[#D4AF37]/30 flex items-center justify-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            Thanh Toán
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 bg-gray-50/50">
                      <div className="w-24 h-24 mb-6 opacity-20">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                      </div>
                      <h3 className="text-xl font-medium text-gray-700 mb-2">Bàn này đang trống</h3>
                      <p className="text-sm">Chưa có đơn hàng nào được ghi nhận cho bàn này.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex flex-col relative bg-white rounded-2xl">
                  <div className="p-6 pb-4 border-b border-gray-100 bg-white rounded-t-2xl z-10 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#fffbf2] border border-[#D4AF37]/30 text-[#D4AF37] rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <div>
                          <h2 className="text-xl font-serif font-bold text-gray-900">Chi Tiết Hóa Đơn</h2>
                          <div className="text-sm font-medium text-[#D4AF37]">Chưa chọn bàn</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white rounded-b-2xl">
                    <p className="text-base font-medium text-gray-500 leading-relaxed max-w-[250px]">Vui lòng chọn bàn trên sơ đồ để xem chi tiết hóa đơn hoặc thanh toán.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeInUp">
                  <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Thanh toán {selectedTableName}</h3>
                    <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="mb-6">
                      <div className="text-4xl font-bold text-center text-[#ef4444] mb-2">
                        {Number(selectedOrder.totalAmount * 1.08).toLocaleString('vi-VN')}đ
                      </div>
                      <div className="text-center text-gray-500 text-sm">Tổng tiền đã bao gồm VAT</div>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-3">Phương thức thanh toán</h4>
                    <div className="space-y-3 mb-6">
                      <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-[#D4AF37] bg-[#fffbf2] shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="w-5 h-5 text-[#D4AF37] focus:ring-[#D4AF37]" />
                        <span className="ml-3 font-medium text-gray-900 flex-1">Tiền mặt</span>
                        <span className="text-2xl">💵</span>
                      </label>
                      <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'qr' ? 'border-[#D4AF37] bg-[#fffbf2] shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input type="radio" name="payment" value="qr" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} className="w-5 h-5 text-[#D4AF37] focus:ring-[#D4AF37]" />
                        <span className="ml-3 font-medium text-gray-900 flex-1">Chuyển khoản / Quét QR</span>
                        <span className="text-2xl">📱</span>
                      </label>
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-3">Ghi chú (Tùy chọn)</h4>
                    <textarea
                      value={orderNote}
                      onChange={e => setOrderNote(e.target.value)}
                      placeholder="Thêm ghi chú đơn hàng..."
                      className="w-full border border-gray-200 rounded-xl p-3 h-24 resize-none outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                    ></textarea>
                  </div>

                  <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button
                      onClick={() => setShowPaymentModal(false)}
                      className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={() => confirmPayment(selectedOrder)}
                      className="flex-1 py-3 px-4 bg-[#D4AF37] text-white font-bold rounded-xl hover:bg-[#b8952b] transition-colors shadow-md shadow-[#D4AF37]/20"
                    >
                      Hoàn Tất & In Bill
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </AdminLayout>
      </div>
    </>
  )
}
