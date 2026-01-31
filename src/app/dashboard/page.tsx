'use client'

import { useEffect, useState } from 'react'
import { supabase, canSeeCosts, canSeeProfit, UserRole } from '@/lib/supabase'

interface Stats {
  totalRevenue: number
  totalProfit: number
  totalOrders: number
  openExceptions: number
  pendingResolve: number
}

interface Store {
  id: string
  name: string
  code: string
  orders: number
  revenue: number
  profit: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    totalProfit: 0,
    totalOrders: 0,
    openExceptions: 0,
    pendingResolve: 0,
  })
  const [stores, setStores] = useState<Store[]>([])
  const [userRole, setUserRole] = useState<UserRole>('store_manager')
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    // Get user role
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()
      if (profile) setUserRole(profile.role as UserRole)
    }

    // Get FX rates
    const { data: fxData } = await supabase.from('fx_rates').select('*')
    const fxRates: Record<string, number> = {}
    fxData?.forEach(r => { fxRates[r.currency] = r.rate_to_usd })

    // Load stores
    const { data: storesData } = await supabase
      .from('stores')
      .select('*')
      .eq('status', 'active')

    // Load orders for stats
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('order_status', 'OK')

    // Load open exceptions
    const { data: exceptionsData } = await supabase
      .from('exceptions')
      .select('*')
      .eq('resolved', false)

    // Calculate stats
    let totalRevenue = 0
    let totalProfit = 0
    let pendingResolve = 0
    const storeStats: Record<string, { orders: number; revenue: number; profit: number }> = {}

    if (ordersData) {
      ordersData.forEach((order) => {
        const fxRate = fxRates[order.currency] || 1
        const revenue = order.qty * order.price_item * fxRate
        const cost = ((order.resolved_cost_usd || 0) + (order.resolved_shipping_usd || 0)) * order.qty
        const profit = revenue - cost

        totalRevenue += revenue
        totalProfit += profit

        if (!order.resolve_status) pendingResolve++

        if (!storeStats[order.store_id]) {
          storeStats[order.store_id] = { orders: 0, revenue: 0, profit: 0 }
        }
        storeStats[order.store_id].orders++
        storeStats[order.store_id].revenue += revenue
        storeStats[order.store_id].profit += profit
      })
    }

    setStats({
      totalRevenue,
      totalProfit,
      totalOrders: ordersData?.filter(o => o.resolve_status === 'OK').length || 0,
      openExceptions: exceptionsData?.length || 0,
      pendingResolve,
    })

    if (storesData) {
      setStores(storesData.map((store) => ({
        ...store,
        orders: storeStats[store.id]?.orders || 0,
        revenue: storeStats[store.id]?.revenue || 0,
        profit: storeStats[store.id]?.profit || 0,
      })))
    }

    // Recent activity
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    setRecentActivity(recentOrders || [])
    setLoading(false)
  }

  const showCosts = canSeeCosts(userRole)
  const showProfit = canSeeProfit(userRole)

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white border-b px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500">Overview of your Etsy stores</p>
      </div>

      <div className="p-6">
        {/* Stats Cards */}
        <div className={`grid ${showProfit ? 'grid-cols-4' : 'grid-cols-3'} gap-4 mb-6`}>
          <div className="card bg-white rounded-xl p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-800">${stats.totalRevenue.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <i className="fas fa-dollar-sign text-emerald-600"></i>
              </div>
            </div>
          </div>

          {showProfit && (
            <div className="card bg-white rounded-xl p-4 border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Net Profit</p>
                  <p className="text-2xl font-bold text-emerald-600">${stats.totalProfit.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-chart-pie text-blue-600"></i>
                </div>
              </div>
            </div>
          )}

          <div className="card bg-white rounded-xl p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resolved Orders</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
                {stats.pendingResolve > 0 && (
                  <p className="text-xs text-orange-500">{stats.pendingResolve} pending</p>
                )}
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="fas fa-shopping-bag text-purple-600"></i>
              </div>
            </div>
          </div>

          <div className={`card bg-white rounded-xl p-4 border ${stats.openExceptions > 0 ? 'border-red-200 bg-red-50' : ''}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open Exceptions</p>
                <p className={`text-2xl font-bold ${stats.openExceptions > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                  {stats.openExceptions}
                </p>
              </div>
              <div className={`w-12 h-12 ${stats.openExceptions > 0 ? 'bg-red-100' : 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                <i className={`fas fa-exclamation-triangle ${stats.openExceptions > 0 ? 'text-red-600' : 'text-gray-400'}`}></i>
              </div>
            </div>
          </div>
        </div>

        {/* Store Performance */}
        <div className="bg-white rounded-xl border p-4">
          <h3 className="font-semibold mb-4">Store Performance</h3>
          {stores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <i className="fas fa-store text-4xl mb-4 text-gray-300"></i>
              <p>No stores yet. Add your first store in Settings.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-2">Store</th>
                  <th className="pb-2">Orders</th>
                  <th className="pb-2">Revenue</th>
                  {showProfit && <th className="pb-2">Profit</th>}
                  {showProfit && <th className="pb-2">Margin</th>}
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-medium text-sm">{store.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-sm">{store.orders}</td>
                    <td className="py-3 text-sm">${store.revenue.toFixed(2)}</td>
                    {showProfit && <td className="py-3 text-sm text-emerald-600">${store.profit.toFixed(2)}</td>}
                    {showProfit && (
                      <td className="py-3 text-sm">
                        {store.revenue > 0 ? ((store.profit / store.revenue) * 100).toFixed(1) : 0}%
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
