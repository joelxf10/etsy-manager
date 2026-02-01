'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Store, Package, ShoppingCart, DollarSign, TrendingUp, Clock, Globe, BarChart3 } from 'lucide-react'

export default function EtsyDashboard() {
  const [stores, setStores] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      // Load stores
      const { data: s } = await supabase.from('stores').select('*').eq('platform', 'etsy').order('name')
      
      // Load orders from orders_ledger (new table) or fall back to store_orders
      let ordersData: any[] = []
      const { data: ledger } = await supabase.from('orders_ledger').select('*').eq('platform', 'ETSY').order('order_date', { ascending: false })
      if (ledger && ledger.length > 0) {
        ordersData = ledger
      } else {
        const { data: storeOrders } = await supabase.from('store_orders').select('*').order('order_date', { ascending: false })
        ordersData = storeOrders || []
      }
      
      // Load products
      const { data: p } = await supabase.from('store_products').select('*')
      
      setStores(s || [])
      setOrders(ordersData)
      setProducts(p || [])
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Calculate today's A/B group
  const getTodayGroup = () => {
    const day = new Date().getDay()
    // Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
    // A: Sun, Tue, Thu, Sat (0, 2, 4, 6)
    // B: Mon, Wed, Fri (1, 3, 5)
    return (day === 0 || day === 2 || day === 4 || day === 6) ? 'A' : 'B'
  }

  const todayGroup = getTodayGroup()
  const activeStores = stores.filter(s => s.is_active)
  const todayStores = activeStores.filter(s => s.ab_group === todayGroup)
  
  // Order stats
  const okOrders = orders.filter(o => (o.order_status === 'OK' || o.status === 'PREPARE' || o.status === 'SHIPPED'))
  const totalRevenue = okOrders.reduce((sum, o) => sum + ((o.price_item || o.total_price || 0) * (o.qty || 1)), 0)
  const recentOrders = orders.slice(0, 10)
  
  // Orders by status
  const ordersByStatus = {
    prepare: orders.filter(o => o.status === 'PREPARE').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    cancelled: orders.filter(o => o.order_status === 'Cancelled' || o.status === 'CANCELLED').length
  }

  // Top stores by orders
  const storeOrderCounts: Record<string, number> = {}
  orders.forEach(o => {
    const storeName = o.store_name || 'Unknown'
    storeOrderCounts[storeName] = (storeOrderCounts[storeName] || 0) + 1
  })
  const topStores = Object.entries(storeOrderCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  // Stores by country
  const storesByCountry: Record<string, number> = {}
  stores.forEach(s => {
    const country = s.country || 'Unknown'
    storesByCountry[country] = (storesByCountry[country] || 0) + 1
  })

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

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center"><Store className="w-6 h-6 text-orange-600" /></div>
            <span className="text-green-500 text-sm font-medium flex items-center gap-1"><TrendingUp className="w-4 h-4" />{todayStores.length} today</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{activeStores.length}</h3>
          <p className="text-gray-500 text-sm">Active Stores</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><ShoppingCart className="w-6 h-6 text-blue-600" /></div>
            {ordersByStatus.prepare > 0 && <span className="text-yellow-500 text-sm font-medium flex items-center gap-1"><Clock className="w-4 h-4" />{ordersByStatus.prepare} to prepare</span>}
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{orders.length}</h3>
          <p className="text-gray-500 text-sm">Total Orders</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4"><DollarSign className="w-6 h-6 text-green-600" /></div>
          <h3 className="text-3xl font-bold text-gray-900">£{totalRevenue.toFixed(2)}</h3>
          <p className="text-gray-500 text-sm">Total Revenue</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4"><Package className="w-6 h-6 text-purple-600" /></div>
          <h3 className="text-3xl font-bold text-gray-900">{products.length}</h3>
          <p className="text-gray-500 text-sm">Listed Products</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Today's Active Stores */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Today's Active Stores (Group {todayGroup})</h2>
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">{todayStores.length} stores</span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {todayStores.length > 0 ? todayStores.map(store => (
              <div key={store.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${store.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{store.name}</p>
                    <p className="text-xs text-gray-500">{store.niche || store.owner}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${store.dpo_type === '1 DPO' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                  {store.dpo_type || '14 DPO'}
                </span>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400">No stores scheduled for today</div>
            )}
          </div>
        </div>

        {/* Top Stores by Orders */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Top Stores by Orders</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {topStores.length > 0 ? topStores.map(([storeName, count], idx) => (
              <div key={storeName} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-100 text-gray-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}`}>
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{storeName}</span>
                    <span className="text-sm text-gray-500">{count} orders</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${(count / (topStores[0]?.[1] || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-400">No order data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Order Status Summary & Stores by Country */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Order Status */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Order Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm text-gray-700">To Prepare</span>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">{ordersByStatus.prepare}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-sm text-gray-700">Shipped</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">{ordersByStatus.shipped}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-sm text-gray-700">Delivered</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">{ordersByStatus.delivered}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-sm text-gray-700">Cancelled</span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">{ordersByStatus.cancelled}</span>
            </div>
          </div>
        </div>

        {/* Stores by Country */}
        <div className="bg-white rounded-xl shadow-sm border p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Stores by Country</h2>
            <Globe className="w-5 h-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(storesByCountry).map(([country, count]) => (
              <div key={country} className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-sm text-gray-500">{country}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <a href="/etsy/orders" className="text-sm text-orange-600 hover:underline">View all →</a>
        </div>
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-500">{order.order_date}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-900">{order.order_number || order.etsy_order_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[150px] truncate">{order.store_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[150px] truncate">{order.color || order.etsy_color || '-'} / {order.size || order.etsy_size || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'PREPARE' || order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'SHIPPED' || order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'DELIVERED' || order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.order_status === 'Cancelled' || order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status || order.order_status || 'OK'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">£{order.price_item || order.total_price || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">No orders yet - import from Etsy</div>
        )}
      </div>
    </div>
  )
}
