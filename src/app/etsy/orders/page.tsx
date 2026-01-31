'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Search, Plus, Clock, Truck, Package, X } from 'lucide-react'

export default function EtsyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newOrder, setNewOrder] = useState({ store_id: '', platform_order_id: '', customer_name: '', shipping_country: '', total: '' })
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    const { data: s } = await supabase.from('stores').select('*').eq('platform', 'etsy').order('name')
    const { data: o } = await supabase.from('orders').select('*, store:stores(*)').order('created_at', { ascending: false })
    setStores(s || [])
    setOrders(o?.filter((x: any) => x.store?.platform === 'etsy') || [])
    setLoading(false)
  }

  async function addOrder() {
    if (!newOrder.store_id) return
    await supabase.from('orders').insert({ ...newOrder, total: parseFloat(newOrder.total) || 0, status: 'pending' })
    setShowAdd(false)
    setNewOrder({ store_id: '', platform_order_id: '', customer_name: '', shipping_country: '', total: '' })
    load()
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('orders').update({ status }).eq('id', id)
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o))
  }

  const filtered = orders.filter(o => {
    if (filter !== 'all' && o.status !== filter) return false
    if (search && !o.customer_name?.toLowerCase().includes(search.toLowerCase()) && !o.store?.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="text-2xl font-bold text-gray-900">Orders</h1><p className="text-gray-500">Manage Etsy orders</p></div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"><Plus className="w-5 h-5" />Add Order</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'processing', 'shipped', 'delivered'].map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-2 rounded-lg capitalize ${filter === s ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{s}</button>
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
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : order.status === 'shipped' ? 'bg-purple-100 text-purple-700' : order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{order.status}</span></td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">${order.total || 0}</td>
                  <td className="px-6 py-4">
                    <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} className="text-sm border rounded px-2 py-1">
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
          <div className="p-12 text-center text-gray-400">No orders found</div>
        )}
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold">Add Order</h2><button onClick={() => setShowAdd(false)}><X className="w-5 h-5" /></button></div>
            <div className="space-y-4">
              <select value={newOrder.store_id} onChange={(e) => setNewOrder({ ...newOrder, store_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Select store</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input type="text" placeholder="Order ID" value={newOrder.platform_order_id} onChange={(e) => setNewOrder({ ...newOrder, platform_order_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              <input type="text" placeholder="Customer name" value={newOrder.customer_name} onChange={(e) => setNewOrder({ ...newOrder, customer_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              <input type="text" placeholder="Country" value={newOrder.shipping_country} onChange={(e) => setNewOrder({ ...newOrder, shipping_country: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              <input type="number" placeholder="Total" value={newOrder.total} onChange={(e) => setNewOrder({ ...newOrder, total: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              <button onClick={addOrder} className="w-full py-2 bg-orange-500 text-white rounded-lg">Add</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
