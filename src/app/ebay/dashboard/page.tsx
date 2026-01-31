'use client'

import { useEffect, useState } from 'react'
import { createClient, Store, Order, Screenshot } from '@/lib/supabase'
import { 
  Store as StoreIcon, 
  ClipboardList, 
  DollarSign,
  Camera,
  TrendingUp,
  Clock,
  AlertCircle,
  Upload
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalStores: number
  activeStores: number
  totalOrders: number
  pendingOrders: number
  todayScreenshots: number
  missingScreenshots: number
}

export default function EbayDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStores: 0,
    activeStores: 0,
    totalOrders: 0,
    pendingOrders: 0,
    todayScreenshots: 0,
    missingScreenshots: 0
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [recentScreenshots, setRecentScreenshots] = useState<Screenshot[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      // Get stores count
      const { data: stores } = await supabase
        .from('stores')
        .select('*')
        .eq('platform', 'ebay')

      // Get orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*, store:stores(*)')
        .order('created_at', { ascending: false })
        .limit(10)

      const ebayOrders = orders?.filter(o => o.store?.platform === 'ebay') || []

      // Get today's screenshots
      const today = new Date().toISOString().split('T')[0]
      const { data: screenshots } = await supabase
        .from('screenshots')
        .select('*, store:stores(*)')
        .eq('screenshot_date', today)
        .order('created_at', { ascending: false })

      const activeStores = stores?.filter(s => s.is_active).length || 0
      const todayCount = screenshots?.length || 0

      setStats({
        totalStores: stores?.length || 0,
        activeStores,
        totalOrders: ebayOrders.length,
        pendingOrders: ebayOrders.filter(o => o.status === 'pending').length,
        todayScreenshots: todayCount,
        missingScreenshots: activeStores - todayCount
      })

      setRecentOrders(ebayOrders.slice(0, 5))
      setRecentScreenshots(screenshots?.slice(0, 5) || [])
      setLoading(false)
    }

    loadData()
  }, [supabase])

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">eBay Dashboard</h1>
        <p className="text-gray-500">Overview of your eBay operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <StoreIcon className="w-6 h-6 text-blue-600" />
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
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-purple-600" />
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
              <Camera className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{stats.todayScreenshots}</h3>
          <p className="text-gray-500 text-sm">Today's Screenshots</p>
          {stats.missingScreenshots > 0 && (
            <p className="text-red-400 text-xs mt-1">{stats.missingScreenshots} stores missing</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">$0</h3>
          <p className="text-gray-500 text-sm">Today's Revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/ebay/orders" className="text-blue-500 text-sm hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            {recentOrders.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{order.store?.name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">${order.total || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Screenshot Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Screenshot Status</h2>
            <Link href="/ebay/screenshots" className="text-blue-500 text-sm hover:underline">
              Upload
            </Link>
          </div>
          <div className="p-6">
            {stats.missingScreenshots > 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-red-700 font-medium">{stats.missingScreenshots} stores missing screenshots</p>
                    <p className="text-red-500 text-sm">Please upload daily screenshots for all stores</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-green-700 font-medium">All screenshots uploaded!</p>
                    <p className="text-green-500 text-sm">Great job keeping up with daily tracking</p>
                  </div>
                </div>
              </div>
            )}

            <Link
              href="/ebay/screenshots"
              className="flex items-center justify-center gap-2 w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              <Upload className="w-5 h-5" />
              Upload Screenshot
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
