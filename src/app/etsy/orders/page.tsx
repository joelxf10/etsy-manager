'use client'

import { useEffect, useState } from 'react'
import { createClient, Store, Order } from '@/lib/supabase'
import { Search, Plus, CheckCircle, Clock, Truck, Package, X } from 'lucide-react'

export default function EtsyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [storeFilter, setStoreFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newOrder, setNewOrder] = useState({
    store_id: '', platform_order_id: '', customer_name: '', shipping_country: '', total: '', notes: ''
  })
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: storesData } = await supabase.from('stores').select('*').eq('platform', 'etsy').eq('is_active', true).order('name')
    setStores(storesData || [])

    const { data: ordersData } = await supabase.from('orders').select('*, store:stores(*)').order('created_at', { ascending: false })
    setOrders(ordersData?.filter(o => o.store?.platform === 'etsy') || [])
    setLoading(false)
  }

  async function updateOrderStatus(orderId: string, status: string) {
    const { error } = await supabase.from('orders')
      .update({ status, fulfilled_at: status === 'shipped' ? new Date().toISOString() : null }).eq('id', orderId)
    if (!error) setOrders(orders.map(o => o.id === orderId ? { ...o, status: status as any } : o))
  }

  async function addOrder() {
    if (!newOrder.store_id) return
    const { data, error } = await supabase.from('orders').insert({
      store_id: newOrder.store_id, platform_order_id: newOrder.platform_order_id,
      customer_name: newOrder.customer_name, shipping_country: newOrder.shipping_country,
      total: parseFloat(newOrder.total) || 0, notes: newOrder.notes, status: 'pending'
    }).select('*, store:stores(*)').single()
    if (!error && data) {
      setOrders([data, ...orders])
      setShowAddModal(false)
      setNewOrder({ store_id: '', platform_order_id: '', customer_name: '', shipping_country: '', total: '', notes: '' })
    }
  }

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false
    if (storeFilter !== 'all' && o.store_id !== storeFilter) return false
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      return o.customer_name?.toLowerCase().includes(s) || o.platform_order_id?.toLowerCase().includes(s) || o.store?.name.toLowerCase().includes(s)
    }
    return true
  })

  const counts = { all: orders.length, pending: orders.filter(o => o.status === 'pending').length, shipped: orders.filter(o => o.status === 'shipped').length }

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Etsy Orders</h1>
          <p className="text-gray-500">Manage and fulfill orders</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
          <Plus className="w-5 h-5" /> Add Order
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
          <select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="all">All Stores</option>
            {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="flex gap-2">
            {[{ k: 'all', l: 'All', i: Package }, { k: 'pending', l: 'Pending', i: Clock }, { k: 'shipped', l: 'Shipped', i: Truck }].map(st => (
              <button key={st.k} onClick={() => setFilter(st.k)} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${filter === st.k ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <st.i className="w-4 h-4" /> {st.l} ({counts[st.k as keyof typeof counts]})
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filtered.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.platform_order_id || order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.store?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.customer_name || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : order.status === 'shipped' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>{order.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">${order.total || 0}</td>
                  <td className="px-6 py-4">
                    <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className="text-sm border rounded px-2 py-1">
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center"><Package className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No orders</p></div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Add Order</h2>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Store *</label>
                <select value={newOrder.store_id} onChange={(e) => setNewOrder({ ...newOrder, store_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Order ID</label>
                <input type="text" value={newOrder.platform_order_id} onChange={(e) => setNewOrder({ ...newOrder, platform_order_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Customer</label>
                <input type="text" value={newOrder.customer_name} onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total ($)</label>
                <input type="number" value={newOrder.total} onChange={(e) => setNewOrder({ ...newOrder, total: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <button onClick={addOrder} className="w-full py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
