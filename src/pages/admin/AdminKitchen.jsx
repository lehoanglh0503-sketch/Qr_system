import React, { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import { useAuth } from '../../App'
import api from '../../api'

export default function AdminKitchen() {
  const { showToast } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOrders(true)
    const interval = setInterval(() => {
      loadOrders(false)
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  async function loadOrders(showSpinner = true) {
    if (showSpinner && orders.length === 0) setLoading(true)
    try {
      const data = await api.getOrders()
      setOrders(data || [])
    } catch (err) {
      if (showSpinner) showToast('Lỗi tải danh sách món', '⚠️')
    } finally {
      setLoading(false)
    }
  }

  async function handleItemStatusChange(orderId, itemIndex, newStatus) {
    try {
      await api.updateOrderItemStatus(orderId, itemIndex, newStatus)
      // Optimistic update
      setOrders(prev => {
        const copy = [...prev]
        const orderIndex = copy.findIndex(o => o.id === orderId)
        if (orderIndex > -1) {
          copy[orderIndex].items[itemIndex].status = newStatus
        }
        return copy
      })
    } catch(err) {
      showToast('Lỗi cập nhật món', '⚠️')
      loadOrders(false)
    }
  }

  // Group by order for kitchen view
  let kitchenOrders = []
  orders.forEach(order => {
    if (order.status !== 'completed' && order.items) {
      const itemsToCook = order.items.map((item, index) => ({ ...item, originalIndex: index })).filter(item => item.status === 'pending' || item.status === 'cooking');
      if (itemsToCook.length > 0) {
        kitchenOrders.push({
          orderId: order.id,
          tableName: order.tableName,
          items: itemsToCook,
          orderStatus: order.status
        })
      }
    }
  })

  return (
    <AdminLayout showHeader={true}>
      <div style={{ fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <span style={{ fontSize: '36px' }}>🍳</span> Bếp Chế Biến
          </h1>
          <p style={{ fontSize: '18px', color: '#4b5563' }}>
            Quản lý các món ăn đang chờ nấu
          </p>
        </div>

        {loading && kitchenOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <svg className="animate-spin h-8 w-8 text-[#D4AF37]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span style={{ color: '#6b7280', fontSize: '15px' }}>Đang tải danh sách đơn...</span>
          </div>
        ) : kitchenOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 16 }}>Bếp đang rảnh rỗi, không có đơn nào chờ nấu.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {kitchenOrders.map((kOrder) => {
              const hasCooking = kOrder.items.some(i => i.status === 'cooking');
              return (
              <div key={kOrder.orderId} style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                border: hasCooking ? '2px solid #D4AF37' : '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #e5e7eb', paddingBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#111827' }}>
                    {kOrder.tableName}
                  </h3>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    background: hasCooking ? '#fef08a' : '#fee2e2',
                    color: hasCooking ? '#854d0e' : '#991b1b'
                  }}>
                    {hasCooking ? 'Đang Nấu' : 'Chờ Nấu'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {kOrder.items.map(item => (
                    <div key={item.originalIndex} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937' }}>
                          <span style={{ color: '#D4AF37', marginRight: '8px' }}>{item.quantity}x</span> 
                          {item.name}
                        </div>
                        {item.note && (
                          <div style={{ fontSize: '13px', color: '#b91c1c', marginTop: '4px' }}>
                            * {item.note}
                          </div>
                        )}
                      </div>
                      
                      <div style={{ marginLeft: '16px', display: 'flex', gap: '8px' }}>
                        {item.status === 'pending' && (
                          <button 
                            onClick={() => handleItemStatusChange(kOrder.orderId, item.originalIndex, 'cooking')}
                            className="flex items-center gap-2 px-4 py-2 bg-transparent border border-[#D4AF37] text-[#D4AF37] text-[13px] font-bold rounded-full hover:bg-[#D4AF37] hover:text-[#050A1F] transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                          >
                            <span>🍳</span>
                            <span>BẮT ĐẦU NẤU</span>
                          </button>
                        )}
                        {item.status === 'cooking' && (
                          <button 
                            onClick={() => handleItemStatusChange(kOrder.orderId, item.originalIndex, 'ready')}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[13px] font-bold rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                          >
                            <span>✅</span>
                            <span>ĐÃ NẤU XONG</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
