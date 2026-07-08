import React, { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import { useAuth } from '../../App'
import api from '../../api'

export default function AdminOrders() {
  const { showToast, user } = useAuth()
  const [orders, setOrders] = useState([])
  const [tables, setTables] = useState([])
  const [selectedTable, setSelectedTable] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('active')
  const [loading, setLoading] = useState(true)
  const [printingOrder, setPrintingOrder] = useState(null)
  const [payingOrder, setPayingOrder] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [orderNote, setOrderNote] = useState('')

  useEffect(() => {
    loadOrders(true)
    loadTables()
    // Tự động tải lại đơn mỗi 10 giây
    const interval = setInterval(() => {
      loadOrders(false)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (printingOrder) {
      const timer = setTimeout(() => {
        window.print()
        handleStatusChange(printingOrder.id, 'paid')
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
    } catch(err) {
      showToast('Lỗi cập nhật', '⚠️')
    }
  }

  async function handleItemStatusChange(orderId, itemIndex, newStatus) {
    try {
      await api.updateOrderItemStatus(orderId, itemIndex, newStatus)
      loadOrders(false)
    } catch(err) {
      showToast('Lỗi cập nhật món', '⚠️')
    }
  }

  const filteredOrders = selectedTable === 'all' ? orders : orders.filter(o => o.tableName === selectedTable)
  const displayOrders = filteredOrders.filter(o => {
    if (selectedStatus === 'active') return o.status !== 'paid'
    if (selectedStatus === 'paid') return o.status === 'paid'
    return true
  })
  
  const pendingCount = orders.filter(o => o.status === 'pending').length
  const unpaidCount = orders.filter(o => o.status === 'completed').length

  return (
    <>
      {/* Giao diện in hóa đơn (ẩn trên màn hình, chỉ hiện khi in) */}
      {printingOrder && (
        <div className="print-only hidden print:block" style={{ width: '80mm', margin: '0 auto', fontFamily: 'monospace', color: '#000', padding: '10px', fontSize: '12px', background: 'white' }}>
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>NHÀ HÀNG GỌI MÓN</h2>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>ĐC: 123 Đường ABC, Quận 1, TP.HCM</p>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px' }}>SĐT: 0123 456 789</p>
          </div>
          
          <h3 style={{ textAlign: 'center', margin: '10px 0', fontSize: '16px', fontWeight: 'bold', borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '5px 0' }}>HÓA ĐƠN THANH TOÁN</h3>
          
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
                  <td style={{ padding: '4px 0' }}>{i.quantity}</td>
                  <td style={{ padding: '4px 0' }}>{i.name}</td>
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
                src={`https://img.vietqr.io/image/mb-0853272393-compact2.png?amount=${printingOrder.totalAmount}&addInfo=ThanhToan${printingOrder.id?.substring(0,6)}`} 
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

      {/* Giao diện chính (ẩn khi in) */}
      <div className="no-print print:hidden">
        {payingOrder ? (
          <AdminLayout showHeader={false}>
        <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '40px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '30px' }}>
              <button onClick={() => setPayingOrder(null)} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}>
                &larr; Quay lại
              </button>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#111827' }}>Thanh toán bàn {payingOrder.tableName}</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px' }}>
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>Phương thức thanh toán</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: paymentMethod === 'cash' ? '2px solid #3b82f6' : '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'cash' ? '#eff6ff' : 'white' }}>
                      <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} style={{ width: '20px', height: '20px', accentColor: '#3b82f6' }} />
                      <span style={{ fontSize: '24px' }}>💵</span>
                      <span style={{ fontWeight: '600', color: '#374151' }}>Thanh toán bằng Tiền mặt</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: paymentMethod === 'qr' ? '2px solid #3b82f6' : '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'qr' ? '#eff6ff' : 'white' }}>
                      <input type="radio" name="payment" value="qr" checked={paymentMethod === 'qr'} onChange={() => setPaymentMethod('qr')} style={{ width: '20px', height: '20px', accentColor: '#3b82f6' }} />
                      <span style={{ fontSize: '24px' }}>📱</span>
                      <span style={{ fontWeight: '600', color: '#374151' }}>Chuyển khoản qua QR - MB Bank</span>
                    </label>

                  </div>
                </div>

                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>Ghi chú đơn hàng</h2>
                  <textarea 
                    value={orderNote}
                    onChange={e => setOrderNote(e.target.value)}
                    placeholder="Nhập ghi chú (nếu có)..." 
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e7eb', minHeight: '100px', resize: 'vertical', color: '#374151' }}
                  ></textarea>
                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>Giỏ hàng</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                    {payingOrder.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                            🍽️
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>{item.name}</div>
                            <div style={{ fontSize: '13px', color: '#6b7280' }}>Số lượng: {item.quantity}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>Tóm tắt đơn hàng</h2>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#4b5563' }}>
                    <span>Tổng tiền hàng</span>
                    <span>{Number(payingOrder.totalAmount).toLocaleString('vi-VN')} đ</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#4b5563' }}>
                    <span>Thuế / VAT</span>
                    <span>-</span>
                  </div>

                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#111827' }}>Tổng thanh toán</span>
                    <span style={{ fontWeight: '900', fontSize: '24px', color: '#ef4444' }}>{Number(payingOrder.totalAmount).toLocaleString('vi-VN')} đ</span>
                  </div>

                  <button 
                    onClick={() => {
                      setPrintingOrder({ ...payingOrder, paymentMethod, orderNote })
                      setPayingOrder(null)
                    }}
                    style={{ width: '100%', background: '#050A1F', color: 'white', padding: '16px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}
                    className="hover:bg-gray-800 transition-colors"
                  >
                    Thanh Toán & In Bill
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
        ) : (
      <AdminLayout showHeader={true}>
      <div style={{ fontFamily: 'sans-serif' }}>
        
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <span style={{ fontSize: '36px', opacity: 0.8 }}>🍽️</span> Đơn Gọi Món
          </h1>
          <p style={{ fontSize: '18px', color: '#4b5563' }}>
            Theo dõi trạng thái đơn gọi món của bạn
          </p>
        </div>

        {/* Controls Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <select 
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              style={{
              padding: '12px 24px',
              fontSize: '16px',
              color: '#374151',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              <option value="all">Tất cả bàn</option>
              {tables.map(table => (
                <option key={table.id} value={table.name}>{table.name}</option>
              ))}
            </select>

            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              style={{
              padding: '12px 24px',
              fontSize: '16px',
              color: '#374151',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}>
              <option value="active">Đơn đang phục vụ</option>
              <option value="paid">Lịch sử (Đã thanh toán)</option>
              <option value="all">Tất cả trạng thái</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{
              padding: '12px 16px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px'
            }}>
              🔔
            </button>
            <button onClick={() => loadOrders(true)} className="hover:bg-gray-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" style={{
              padding: '12px 24px',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500',
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span className={loading ? 'animate-spin' : ''}>↻</span> Tải Đơn Mới
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#f87171', // light red
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              color: 'white'
            }}>
              🕒
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#111827', lineHeight: 1 }}>{pendingCount}</div>
              <div style={{ fontSize: '15px', color: '#6b7280', marginTop: '4px' }}>Đơn chờ xác nhận</div>
            </div>
          </div>

          <div style={{
            background: 'white',
            padding: '24px',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#b91c1c', // dark red
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              color: 'white'
            }}>
              💳
            </div>
            <div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: '#111827', lineHeight: 1 }}>{unpaidCount}</div>
              <div style={{ fontSize: '15px', color: '#6b7280', marginTop: '4px' }}>Đơn đã phục vụ (chờ thanh toán)</div>
            </div>
          </div>

        </div>

        {/* Orders List */}
        <div style={{ marginTop: 30 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span style={{ color: '#6b7280', fontSize: '15px' }}>Đang tải danh sách...</span>
            </div>
          ) : displayOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 16 }}>Chưa có đơn hàng nào</div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {displayOrders.map(order => (
                <div key={order.id} style={{ 
                  background: 'white', 
                  padding: '24px', 
                  borderRadius: '12px', 
                  border: '1px solid #e5e7eb',
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Status Indicator Line */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    background: order.status === 'pending' ? '#ef4444' : '#10b981'
                  }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginLeft: '12px' }}>
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                        {order.tableName}
                      </h3>
                      <span style={{ color: '#6b7280', fontSize: '14px' }}>
                        #{order.id?.substring(0, 6).toUpperCase() || 'NEW'}
                      </span>
                    </div>
                    
                    {/* Items List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {order.items?.map((i, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '15px', padding: '8px', background: '#f9fafb', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span style={{ color: '#6b7280', fontWeight: '500' }}>{i.quantity} x</span>
                            <span style={{ color: '#374151', fontWeight: '500' }}>{i.name}</span>
                          </div>
                          <div>
                            {i.status === 'ready' && (
                              <button 
                                onClick={() => handleItemStatusChange(order.id, idx, 'served')}
                                className="px-3 py-1 bg-[#10b981] text-white text-xs font-bold rounded hover:bg-[#059669] transition-colors"
                              >
                                Đã bưng
                              </button>
                            )}
                            {i.status === 'served' && (
                              <span className="text-xs font-bold text-gray-400">Đã phục vụ</span>
                            )}
                            {(i.status === 'pending' || i.status === 'cooking') && (
                              <span className="text-xs font-bold text-orange-400">Bếp đang làm</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '20px' }}>
                    {/* Price */}
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827' }}>
                      {Number(order.totalAmount).toLocaleString('vi-VN')} đ
                    </div>
                    
                    {/* Actions */}
                    <div>
                      {order.status === 'pending' && (
                        <button 
                          onClick={() => {
                            const allServed = order.items?.every(i => i.status === 'served')
                            if (!allServed) {
                              if (!window.confirm('Vẫn còn món đang làm hoặc chưa bưng. Bạn có chắc chắn muốn báo Hoàn thành đơn này để thanh toán không?')) {
                                return
                              }
                            }
                            handleStatusChange(order.id, 'completed')
                          }} 
                          className="bg-gray-900 hover:bg-gray-700 text-white font-medium text-sm rounded-lg px-6 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                        >
                          Hoàn thành
                        </button>
                      )}
                      {order.status === 'completed' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                          <span style={{ 
                            padding: '8px 16px', 
                            background: '#f3f4f6', 
                            color: '#4b5563', 
                            borderRadius: '8px',
                            fontWeight: '500',
                            fontSize: '14px'
                          }}>
                            Đã phục vụ
                          </span>
                          {(user?.role === 'Thu ngân' || user?.role === 'Admin' || user?.role === 'Cashier') && (
                            <button 
                              onClick={() => {
                                setPaymentMethod('cash')
                                setOrderNote('')
                                setPayingOrder(order)
                              }} 
                              className="bg-[#D4AF37] hover:bg-[#E6C087] text-[#050A1F] font-bold text-sm rounded-lg px-6 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#D4AF37] shadow-md"
                            >
                              Thu Tiền & In Bill
                            </button>
                          )}
                        </div>
                      )}
                      {order.status === 'paid' && (
                        <span style={{ 
                          padding: '8px 16px', 
                          background: '#dcfce7', 
                          color: '#166534', 
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '14px'
                        }}>
                          ✅ Đã thanh toán
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      </AdminLayout>
        )}
      </div>
    </>
  )
}
