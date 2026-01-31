'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { BarChart3, DollarSign, Package, Users, Store, TrendingUp } from 'lucide-react'

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStores: 0, etsyStores: 0, ebayStores: 0, totalOrders: 0, totalRevenue: 0, totalEmployees: 0
  })
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: stores } = await supabase.from('stores').select('*')
      const { data: orders } = await supabase.from('orders').select('*')
      const { data: users } = await supabase.from('users').select('*')

      setStats({
        totalStores: stores?.length || 0,
        etsyStores: stores?.filter(s => s.platform === 'etsy').length || 0,
        ebayStores: stores?.filter(s => s.platform === 'ebay').length || 0,
        totalOrders: orders?.length || 0,
        totalRevenue: orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0,
        totalEmployees: users?.length || 0
      })
      setLoading(false)
    }
    loadData()
  }, [supabase])

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Reports</h1>
        <p className="text-gray-500">Overview of entire operation</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <Store className="w-6 h-6 text-purple-500 mb-2" />
          <p className="text-2xl font-bold">{stats.totalStores}</p>
          <p className="text-xs text-gray-500">Total Stores</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <Store className="w-6 h-6 text-orange-500 mb-2" />
          <p className="text-2xl font-bold">{stats.etsyStores}</p>
          <p className="text-xs text-gray-500">Etsy Stores</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <Store className="w-6 h-6 text-blue-500 mb-2" />
          <p className="text-2xl font-bold">{stats.ebayStores}</p>
          <p className="text-xs text-gray-500">eBay Stores</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <Package className="w-6 h-6 text-green-500 mb-2" />
          <p className="text-2xl font-bold">{stats.totalOrders}</p>
          <p className="text-xs text-gray-500">Total Orders</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <DollarSign className="w-6 h-6 text-emerald-500 mb-2" />
          <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(0)}</p>
          <p className="text-xs text-gray-500">Revenue</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <Users className="w-6 h-6 text-indigo-500 mb-2" />
          <p className="text-2xl font-bold">{stats.totalEmployees}</p>
          <p className="text-xs text-gray-500">Employees</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            Etsy Overview
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-500">Active Stores</span><span className="font-medium">{stats.etsyStores}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Team Members</span><span className="font-medium">8</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Avg Revenue/Store</span><span className="font-medium text-green-600">$0</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            eBay Overview
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between"><span className="text-gray-500">Active Stores</span><span className="font-medium">{stats.ebayStores}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Team Members</span><span className="font-medium">16</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Avg Revenue/Store</span><span className="font-medium text-green-600">$0</span></div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl shadow-sm border p-6">
        <h2 className="font-semibold mb-4">Monthly Summary</h2>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
            <p className="text-sm text-gray-500">Orders</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toFixed(0)}</p>
            <p className="text-sm text-gray-500">Revenue</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">$0</p>
            <p className="text-sm text-gray-500">Costs</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">$0</p>
            <p className="text-sm text-gray-500">Profit</p>
          </div>
        </div>
      </div>
    </div>
  )
}
