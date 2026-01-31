'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Store, Package, ClipboardList, DollarSign, TrendingUp, Clock } from 'lucide-react'

export default function EtsyDashboard() {
  const [stores, setStores] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: s } = await supabase.from('stores').select('*').eq('platform', 'etsy')
      const { data: o } = await supabase.from('orders').select('*, store:stores(*)').order('created_at', { ascending: false })
      setStores(s || [])
      setOrders(o?.filter((x: any) => x.store?.platform === 'etsy') || [])
      setLoading(false)
    }
    load()
  }, [supabase])

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Etsy Dashboard</h1>
        <p className="text-gray-500">Overview of your Etsy operations</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center"><Store className="w-6 h-6 text-orange-600" /></div>
            <span className="text-green-500 text-sm font-medium flex items-center gap-1"><TrendingUp className="w-4 h-4" />Active</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{stores.filter(s => s.is_active).length}</h3>
          <p className="text-gray-500 text-sm">Active Stores</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><ClipboardList className="w-6 h-6 text-blue-600" /></div>
            {pendingOrders > 0 && <span className="text-yellow-500 text-sm font-medium flex items-center gap-1"><Clock className="w-4 h-4" />{pendingOrders} pending</span>}
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{orders.length}</h3>
          <p className="text-gray-500 text-sm">Total Orders</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4"><DollarSign className="w-6 h-6 text-green-600" /></div>
          <h3 className="text-3xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</h3>
          <p className="text-gray-500 text-sm">Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4"><Package className="w-6 h-6 text-purple-600" /></div>
          <h3 className="text-3xl font-bold text-gray-900">{orders.filter(o => o.status === 'shipped' || o.status === 'delivered').length}</h3>
          <p className="text-gray-500 text-sm">Fulfilled Orders</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b"><h2 className="text-lg font-semibold">Recent Orders</h2></div>
        {orders.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.slice(0, 10).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{order.platform_order_id || order.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.store?.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.customer_name || 'N/A'}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : order.status === 'shipped' ? 'bg-blue-100 text-blue-700' : order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{order.status}</span></td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">${order.total || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-400">No orders yet</div>
        )}
      </div>
    </div>
  )
}
