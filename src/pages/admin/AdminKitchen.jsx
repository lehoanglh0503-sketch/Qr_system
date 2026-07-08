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

  // Flatten items for kitchen view
  let kitchenItems = []
  orders.forEach(order => {
    if (order.status !== 'completed' && order.items) {
      order.items.forEach((item, index) => {
        if (item.status === 'pending' || item.status === 'cooking') {
          kitchenItems.push({
            orderId: order.id,
            tableName: order.tableName,
            itemIndex: index,
            ...item
          })
        }
      })
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

        {loading && kitchenItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <svg className="animate-spin h-8 w-8 text-[#D4AF37]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span style={{ color: '#6b7280', fontSize: '15px' }}>Đang tải danh sách món...</span>
          </div>
        ) : kitchenItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, background: 'white', borderRadius: 16 }}>Bếp đang rảnh rỗi, không có món nào chờ nấu.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {kitchenItems.map((kItem, idx) => (
              <div key={idx} style={{
                background: 'white',
                padding: '24px',
                borderRadius: '12px',
                border: kItem.status === 'cooking' ? '2px solid #D4AF37' : '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#111827' }}>
                    {kItem.tableName}
                  </h3>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    background: kItem.status === 'cooking' ? '#fef08a' : '#fee2e2',
                    color: kItem.status === 'cooking' ? '#854d0e' : '#991b1b'
                  }}>
                    {kItem.status === 'cooking' ? 'Đang Nấu' : 'Chờ Nấu'}
                  </span>
                </div>
                
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>
                    {kItem.quantity} x {kItem.name}
                  </div>
                  {kItem.note && (
                    <div style={{ fontSize: '14px', color: '#b91c1c', marginTop: '8px', padding: '8px', background: '#fef2f2', borderRadius: '6px' }}>
                      <strong>Ghi chú:</strong> {kItem.note}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', gap: '10px' }}>
                  {kItem.status === 'pending' && (
                    <button 
                      onClick={() => handleItemStatusChange(kItem.orderId, kItem.itemIndex, 'cooking')}
                      className="w-full py-2.5 bg-[#050A1F] text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      🍳 Bắt đầu nấu
                    </button>
                  )}
                  {kItem.status === 'cooking' && (
                    <button 
                      onClick={() => handleItemStatusChange(kItem.orderId, kItem.itemIndex, 'ready')}
                      className="w-full py-2.5 bg-[#10b981] text-white font-semibold rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      ✅ Đã nấu xong
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
