'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { DollarSign, TrendingUp, Package, Store, Calendar, PieChart, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function EtsyFinancePage() {
  const [orders, setOrders] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')
  const [selectedMonth, setSelectedMonth] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: o } = await supabase
        .from('orders_ledger')
        .select('*')
        .eq('platform', 'ETSY')
        .order('order_date', { ascending: false })
      
      const { data: e } = await supabase
        .from('company_expenses')
        .select('*')
        .order('expense_date', { ascending: false })
      
      const { data: s } = await supabase
        .from('stores')
        .select('*')
        .eq('platform', 'etsy')
      
      setOrders(o || [])
      setExpenses(e || [])
      setStores(s || [])
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - parseInt(dateRange))
  
  const filteredOrders = orders.filter(o => {
    const orderDate = new Date(o.order_date)
    return orderDate >= cutoffDate
  })

  const okOrders = filteredOrders.filter(o => o.order_status === 'OK')
  const totalRevenue = okOrders.reduce((sum, o) => sum + ((o.price_item || 0) * (o.qty || 1)), 0)
  const totalItems = okOrders.reduce((sum, o) => sum + (o.qty || 1), 0)
  const avgOrderValue = okOrders.length > 0 ? totalRevenue / okOrders.length : 0
  
  const ordersWithCost = okOrders.filter(o => o.resolved_cost_usd || o.resolved_shipping_usd)
  const totalCostUSD = ordersWithCost.reduce((sum, o) => 
    sum + ((o.resolved_cost_usd || 0) + (o.resolved_shipping_usd || 0)) * (o.qty || 1), 0
  )
  
  const gbpToUsd = 1.27
  const totalCostGBP = totalCostUSD / gbpToUsd
  const estimatedProfit = totalRevenue - totalCostGBP
  const profitMargin = totalRevenue > 0 ? (estimatedProfit / totalRevenue) * 100 : 0

  const revenueByStore = stores.map(store => {
    const storeOrders = okOrders.filter(o => o.store_name === store.name)
    const revenue = storeOrders.reduce((sum, o) => sum + ((o.price_item || 0) * (o.qty || 1)), 0)
    const items = storeOrders.reduce((sum, o) => sum + (o.qty || 1), 0)
    return { ...store, orders: storeOrders.length, items, revenue }
  }).filter(s => s.revenue > 0).sort((a, b) => b.revenue - a.revenue)

  const revenueByCountry: Record<string, { orders: number; revenue: number }> = {}
  stores.forEach(store => {
    const country = store.country || 'Unknown'
    if (!revenueByCountry[country]) revenueByCountry[country] = { orders: 0, revenue: 0 }
    const storeOrders = okOrders.filter(o => o.store_name === store.name)
    revenueByCountry[country].orders += storeOrders.length
    revenueByCountry[country].revenue += storeOrders.reduce((sum, o) => sum + ((o.price_item || 0) * (o.qty || 1)), 0)
  })

  const filterMonth = selectedMonth || '2026-01'
  const monthExpenses = expenses.filter(e => e.month_year === filterMonth)
  const expensesByCategory: Record<string, number> = {}
  monthExpenses.forEach(e => {
    const cat = e.category || 'Other'
    expensesByCategory[cat] = (expensesByCategory[cat] || 0) + (e.amount || 0)
  })
  const totalMonthExpenses = Object.values(expensesByCategory).reduce((a, b) => a + b, 0)

  const uniqueMonths = Array.from(new Set(expenses.map(e => e.month_year).filter(Boolean))).sort().reverse()

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Overview</h1>
          <p className="text-gray-500">Revenue, costs, and profit analysis</p>
        </div>
        <select 
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />Revenue
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">£{totalRevenue.toFixed(2)}</h3>
          <p className="text-gray-500 text-sm">{okOrders.length} orders / {totalItems} items</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs text-red-600 font-medium flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3" />Cost
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">£{totalCostGBP.toFixed(2)}</h3>
          <p className="text-gray-500 text-sm">${totalCostUSD.toFixed(2)} USD</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className={`text-xs font-medium flex items-center gap-1 ${estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {profitMargin.toFixed(1)}%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">£{estimatedProfit.toFixed(2)}</h3>
          <p className="text-gray-500 text-sm">Gross profit</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">£{avgOrderValue.toFixed(2)}</h3>
          <p className="text-gray-500 text-sm">Avg order value</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue by Store */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Store className="w-4 h-4 text-orange-500" />
              Revenue by Store
            </h2>
            <span className="text-xs text-gray-500">{revenueByStore.length} stores</span>
          </div>
          <div className="p-4 max-h-80 overflow-y-auto">
            {revenueByStore.slice(0, 10).map((store) => {
              const maxRevenue = revenueByStore[0]?.revenue || 1
              const percentage = (store.revenue / maxRevenue) * 100
              return (
                <div key={store.id} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium truncate max-w-[60%]">{store.name}</span>
                    <span className="text-green-600 font-medium">£{store.revenue.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{store.orders} orders</span>
                    <span>{store.items} items</span>
                  </div>
                </div>
              )
            })}
            {revenueByStore.length === 0 && (
              <p className="text-gray-500 text-center py-4">No sales data</p>
            )}
          </div>
        </div>

        {/* Revenue by Country */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-500" />
              Revenue by Country
            </h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(revenueByCountry)
                .sort((a, b) => b[1].revenue - a[1].revenue)
                .map(([country, data]) => {
                  const colors: Record<string, string> = {
                    'UK': 'bg-blue-500', 'USA': 'bg-red-500', 'Italy': 'bg-green-500',
                    'Australia': 'bg-yellow-500', 'Canada': 'bg-purple-500',
                  }
                  return (
                    <div key={country} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-3 h-3 rounded-full ${colors[country] || 'bg-gray-400'}`} />
                        <span className="font-medium text-sm">{country}</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">£{data.revenue.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{data.orders} orders</p>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Company Expenses */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4 text-red-500" />
            Company Expenses (PKR)
          </h2>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1 border rounded text-sm"
          >
            {uniqueMonths.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
            {Object.entries(expensesByCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([category, amount]) => (
                <div key={category} className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 truncate">{category}</p>
                  <p className="text-lg font-bold text-red-600">₨{amount.toLocaleString()}</p>
                </div>
              ))}
          </div>
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="font-semibold text-gray-700">Total Monthly Expenses</span>
            <span className="text-xl font-bold text-red-600">₨{totalMonthExpenses.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Recent Orders</h2>
          <span className="text-xs text-gray-500">{filteredOrders.length} orders</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.slice(0, 20).map(order => {
                const cost = (order.resolved_cost_usd || 0) + (order.resolved_shipping_usd || 0)
                const priceGBP = (order.price_item || 0) * (order.qty || 1)
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(order.order_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{order.order_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-[150px] truncate">{order.store_name}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-gray-900">{order.etsy_color || '-'}</span>
                      <span className="text-gray-500"> / {order.etsy_size || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{order.qty || 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">£{priceGBP.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{cost > 0 ? `$${cost.toFixed(2)}` : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.order_status === 'OK' ? 'bg-green-100 text-green-700' :
                        order.order_status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                        order.order_status === 'Refunded' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.order_status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
