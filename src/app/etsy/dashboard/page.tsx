'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Store, Package, ClipboardList, DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

export default function EtsyDashboard() {
  const [stores, setStores] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: s } = await supabase.from('stores').select('*').eq('platform', 'etsy')
      const { data: o } = await supabase.from('orders_ledger').select('*').eq('platform', 'ETSY').order('order_date', { ascending: false })
      setStores(s || [])
      setOrders(o || [])
      setLoading(false)
    }
    load()
  }, [supabase])

  // Calculate today's A/B group
  const getTodayGroup = () => {
    const day = new Date().getDay()
    return (day === 0 || day === 2 || day === 4 || day === 6) ? 'A' : 'B'
  }

  const todayGroup = getTodayGroup()
  const activeStores = stores.filter(s => s.is_active)
  const todayStores = activeStores.filter(s => s.ab_group === todayGroup)
  const exceptions = orders.filter(o => o.resolve_status === 'Needs Fix').length
  const readyToShip = orders.filter(o => o.resolve_status === 'OK' && o.order_status === 'OK').length
  const totalRevenue = orders.filter(o => o.order_status === 'OK').reduce((sum, o) => sum + ((o.price_item || 0) * (o.qty || 1)), 0)

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Etsy Dashboard</h1>
          <p className="text-gray-500">Overview of your Etsy operations</p>
        </div>
        <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-medium">
          Today: Group {todayGroup} ({new Date().toLocaleDateString('en-US', { weekday: 'short' })})
        </div>
      </div>

      {/* Alert for exceptions */}
      {exceptions > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-medium text-red-700">{exceptions} orders need SKU resolution</p>
            <p className="text-sm text-red-600">Check the Orders page or CORE_MASTER sheet to fix mappings</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center"><Store className="w-6 h-6 text-orange-600" /></div>
            <span className="text-green-500 text-sm font-medium flex items-center gap-1"><TrendingUp className="w-4 h-4" />{todayStores.length} today</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{activeStores.length}</h3>
          <p className="text-gray-500 text-sm">Active Stores (of {stores.length})</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><ClipboardList className="w-6 h-6 text-blue-600" /></div>
            {exceptions > 0 && <span className="text-red-500 text-sm font-medium flex items-center gap-1"><AlertTriangle className="w-4 h-4" />{exceptions} issues</span>}
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{orders.length}</h3>
          <p className="text-gray-500 text-sm">Total Orders</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center"><CheckCircle className="w-6 h-6 text-green-600" /></div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{readyToShip}</h3>
          <p className="text-gray-500 text-sm">Ready to Ship</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4"><DollarSign className="w-6 h-6 text-purple-600" /></div>
          <h3 className="text-3xl font-bold text-gray-900">£{totalRevenue.toFixed(2)}</h3>
          <p className="text-gray-500 text-sm">Revenue (GBP)</p>
        </div>
      </div>

      {/* Store Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">DPO Distribution</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">1 DPO</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">{stores.filter(s => s.dpo_type === '1 DPO').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">14 DPO New</span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">{stores.filter(s => s.dpo_type === '14 DPO New').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">14 DPO OLD</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">{stores.filter(s => s.dpo_type === '14 DPO OLD' || !s.dpo_type).length}</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">A/B Groups</h2>
          <div className="space-y-3">
            <div className={`flex justify-between items-center p-3 rounded-lg ${todayGroup === 'A' ? 'bg-orange-50 ring-2 ring-orange-300' : ''}`}>
              <span className="text-sm text-gray-600">Group A {todayGroup === 'A' && '(Active Today)'}</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">{stores.filter(s => s.ab_group === 'A').length}</span>
            </div>
            <div className={`flex justify-between items-center p-3 rounded-lg ${todayGroup === 'B' ? 'bg-orange-50 ring-2 ring-orange-300' : ''}`}>
              <span className="text-sm text-gray-600">Group B {todayGroup === 'B' && '(Active Today)'}</span>
              <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">{stores.filter(s => s.ab_group === 'B').length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <a href="/etsy/orders" className="text-sm text-orange-600 hover:underline">View all →</a>
        </div>
        {orders.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resolve</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.slice(0, 8).map((order) => (
                <tr key={order.id} className={`hover:bg-gray-50 ${order.resolve_status === 'Needs Fix' ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.order_date}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{order.order_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-[150px] truncate">{order.store_name}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">{order.store_sku}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${order.resolve_status === 'OK' ? 'bg-green-100 text-green-700' : order.resolve_status === 'Needs Fix' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {order.resolve_status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${order.order_status === 'OK' ? 'bg-green-100 text-green-700' : order.order_status === 'Cancelled' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">£{order.price_item || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-400">No orders yet - sync from Google Sheets</div>
        )}
      </div>
    </div>
  )
}
