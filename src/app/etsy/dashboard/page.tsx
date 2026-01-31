'use client'

import { useEffect, useState } from 'react'
import { createClient, Store, Order } from '@/lib/supabase'
import { 
  Store as StoreIcon, 
  Package, 
  ClipboardList, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock
} from 'lucide-react'

interface DashboardStats {
  totalStores: number
  activeStores: number
  totalOrders: number
  pendingOrders: number
  todayRevenue: number
  monthRevenue: number
}

export default function EtsyDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStores: 0,
    activeStores: 0,
    totalOrders: 0,
    pendingOrders: 0,
    todayRevenue: 0,
    monthRevenue: 0
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      // Get stores count
      const { data: stores } = await supabase
        .from('stores')
        .select('*')
        .eq('platform', 'etsy')

      // Get orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*, store:stores(*)')
        .order('created_at', { ascending: false })
        .limit(10)

      const etsyOrders = orders?.filter(o => o.store?.platform === 'etsy') || []

      setStats({
        totalStores: stores?.length || 0,
        activeStores: stores?.filter(s => s.is_active).length || 0,
        totalOrders: etsyOrders.length,
        pendingOrders: etsyOrders.filter(o => o.status === 'pending').length,
        todayRevenue: 0, // Calculate from orders
        monthRevenue: 0  // Calculate from orders
      })

      setRecentOrders(etsyOrders.slice(0, 5))
      setLoading(false)
    }

    loadData()
  }, [supabase])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Etsy Dashboard</h1>
        <p className="text-gray-500">Overview of your Etsy operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <StoreIcon className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-green-500 text-sm font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Active
            </span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{stats.activeStores}</h3>
          <p className="text-gray-500 text-sm">Active Stores</p>
          <p className="text-gray-400 text-xs mt-1">{stats.totalStores} total</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-blue-600" />
            </div>
            {stats.pendingOrders > 0 && (
              <span className="text-yellow-500 text-sm font-medium flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {stats.pendingOrders} pending
              </span>
            )}
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{stats.totalOrders}</h3>
          <p className="text-gray-500 text-sm">Total Orders</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">$0</h3>
          <p className="text-gray-500 text-sm">Today's Revenue</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">$0</h3>
          <p className="text-gray-500 text-sm">Month Revenue</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          {recentOrders.length > 0 ? (
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
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{order.platform_order_id || order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{order.store?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{order.customer_name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">${order.total || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No orders yet</p>
              <p className="text-gray-400 text-sm">Orders will appear here once created</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
