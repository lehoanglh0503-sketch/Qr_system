import { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import { useAuth } from '../../App'
import api from '../../api'

export default function AdminKitchen() {
  const { showToast } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(Date.now())

  useEffect(() => {
    loadOrders(true)
    const interval = setInterval(() => {
      loadOrders(false)
      setCurrentTime(Date.now())
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

  async function handleUpdateMultipleItems(orderId, itemsToUpdate, newStatus) {
    try {
      await Promise.all(itemsToUpdate.map(item =>
        api.updateOrderItemStatus(orderId, item.originalIndex, newStatus)
      ))

      // Optimistic update
      setOrders(prev => {
        const copy = JSON.parse(JSON.stringify(prev))
        const orderIndex = copy.findIndex(o => o.id === orderId)
        if (orderIndex > -1) {
          itemsToUpdate.forEach(item => {
            copy[orderIndex].items[item.originalIndex].status = newStatus
          })
        }
        return copy
      })

      if (newStatus === 'cooking') showToast('Đã bắt đầu làm món', '🔥')
      if (newStatus === 'ready') showToast('Đã hoàn thành món', '✅')
    } catch (err) {
      showToast('Lỗi cập nhật món', '⚠️')
      loadOrders(false)
    }
  }

  // Helper to format elapsed time
  const getElapsedTime = (createdAt) => {
    if (!createdAt) return 'Vừa xong';
    // If createdAt is a timestamp or date string
    const time = typeof createdAt === 'object' && createdAt.seconds ? createdAt.seconds * 1000 : new Date(createdAt).getTime();
    if (isNaN(time)) return 'Vừa xong';

    const diffMins = Math.floor((currentTime - time) / 60000);
    if (diffMins <= 0) return 'Vừa xong';
    if (diffMins >= 60) {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      return `${hours}h ${mins}p trước`;
    }
    return `${diffMins} phút trước`;
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
          orderStatus: order.status,
          createdAt: order.createdAt
        })
      }
    }
  })

  // Sort orders: oldest first
  kitchenOrders.sort((a, b) => {
    const timeA = a.createdAt?.seconds || 0;
    const timeB = b.createdAt?.seconds || 0;
    return timeA - timeB;
  });

  return (
    <AdminLayout showHeader={true}>
      <div>
        <div className="text-center mb-10">
          <h1 className="font-serif text-[32px] font-bold text-[#0F172A] mb-2 flex items-center justify-center gap-3">
            <span className="text-[36px]">🍳</span> Bếp Chế Biến
          </h1>
          <p className="text-[18px] text-[#64748B]">
            Quản lý các món ăn đang chờ nấu
          </p>
        </div>

        {loading && kitchenOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D4AF37]"></div>
            <span className="text-gray-500">Đang tải danh sách đơn...</span>
          </div>
        ) : kitchenOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-lg text-gray-500">Bếp đang rảnh rỗi, không có đơn nào chờ nấu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {kitchenOrders.map((kOrder) => {
              const pendingItems = kOrder.items.filter(i => i.status === 'pending');
              const cookingItems = kOrder.items.filter(i => i.status === 'cooking');
              const hasCooking = cookingItems.length > 0;

              const combinedNotes = kOrder.items
                .filter(i => i.note)
                .map(i => i.note)
                .join(' | ');

              return (
                <div key={kOrder.orderId} className={`bg-white p-6 rounded-[24px] flex flex-col shadow-sm transition-all border-2 ${hasCooking ? 'border-[#F59E0B]/50' : 'border-gray-100 hover:border-gray-200'}`}>
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="bg-[#FAFAF9] border border-gray-100 rounded-xl px-4 py-2">
                      <span className="font-serif text-[20px] font-bold text-[#0F172A]">{kOrder.tableName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[#D97706] font-bold text-[15px]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      {getElapsedTime(kOrder.createdAt)}
                    </div>
                  </div>

                  <hr className="border-gray-100 mb-5" />

                  {/* Item List */}
                  <div className="flex flex-col gap-3 mb-5 flex-1">
                    {kOrder.items.map(item => (
                      <div key={item.originalIndex} className="flex justify-between items-start">
                        <div className="flex gap-2 text-[16px] font-medium text-gray-800">
                          <span className="text-gray-400 mt-0.5">•</span>
                          <span className={item.status === 'cooking' ? 'text-[#D97706]' : ''}>{item.name}</span>
                        </div>
                        <div className={`font-bold text-[16px] ${item.status === 'cooking' ? 'text-[#D97706]' : 'text-[#D4AF37]'}`}>
                          x{item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Notes */}
                  {combinedNotes && (
                    <div className="bg-[#FFF9EA] border border-[#FDE68A] rounded-xl p-4 mb-5 flex items-start gap-2">
                      <span className="text-lg leading-none">📝</span>
                      <div className="text-[#B45309] text-[15px]">
                        <span className="font-bold">Ghi chú: </span>
                        {combinedNotes}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="mt-auto">
                    {!hasCooking ? (
                      <button
                        onClick={() => handleUpdateMultipleItems(kOrder.orderId, pendingItems, 'cooking')}
                        className="w-full py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-[16px] rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"></path></svg>
                        Bắt đầu làm món
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateMultipleItems(kOrder.orderId, cookingItems, 'ready')}
                        className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[16px] rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        Hoàn thành {cookingItems.length} món
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
