'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { DollarSign, TrendingUp, Package, Store, Link2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function EtsyFinancePage() {
  const [orders, setOrders] = useState<any[]>([])
  const [stores, setStores] = useState<any[]>([])
  const [qbConnected, setQbConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: s } = await supabase.from('stores').select('*').eq('platform', 'etsy')
      const { data: o } = await supabase.from('orders_ledger').select('*').eq('platform', 'ETSY').order('order_date', { ascending: false })
      const { data: qb } = await supabase.from('integrations').select('*').eq('type', 'quickbooks').single()
      setStores(s || [])
      setOrders(o || [])
      setQbConnected(!!qb?.access_token)
      setLoading(false)
    }
    load()
  }, [supabase])

  const okOrders = orders.filter(o => o.order_status === 'OK')
  const totalRevenue = okOrders.reduce((sum, o) => sum + ((o.price_item || 0) * (o.qty || 1)), 0)
  const avgOrder = okOrders.length > 0 ? totalRevenue / okOrders.length : 0

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Etsy Finance</h1>
          <p className="text-gray-500">Revenue and performance from Orders Ledger</p>
        </div>
        <Link href="/admin/quickbooks" className={`flex items-center gap-2 px-4 py-2 rounded-lg ${qbConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          <Link2 className="w-5 h-5" />
          {qbConnected ? 'QuickBooks Connected' : 'Connect QuickBooks'}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* QuickBooks Banner */}
      {!qbConnected && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Sync with QuickBooks</h3>
              <p className="text-green-100">Connect QuickBooks to automatically create invoices from orders and track expenses.</p>
            </div>
            <Link href="/admin/quickbooks" className="px-4 py-2 bg-white text-green-600 rounded-lg font-medium hover:bg-green-50">
              Connect Now
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4"><DollarSign className="w-5 h-5 text-green-600" /></div>
          <h3 className="text-2xl font-bold text-gray-900">£{totalRevenue.toFixed(2)}</h3>
          <p className="text-gray-500 text-sm">Total Revenue (GBP)</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4"><Package className="w-5 h-5 text-blue-600" /></div>
          <h3 className="text-2xl font-bold text-gray-900">{okOrders.length}</h3>
          <p className="text-gray-500 text-sm">Completed Orders</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
          <h3 className="text-2xl font-bold text-gray-900">£{avgOrder.toFixed(2)}</h3>
          <p className="text-gray-500 text-sm">Avg Order Value</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-4"><Store className="w-5 h-5 text-orange-600" /></div>
          <h3 className="text-2xl font-bold text-gray-900">{stores.filter(s => s.is_active).length}</h3>
          <p className="text-gray-500 text-sm">Active Stores</p>
        </div>
      </div>

      {/* FX Rates Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Currency Exchange Rates</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">GBP/USD</div>
            <div className="text-lg font-bold text-gray-900">1.27</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">EUR/USD</div>
            <div className="text-lg font-bold text-gray-900">1.085</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">AUD/USD</div>
            <div className="text-lg font-bold text-gray-900">0.655</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-xs text-gray-500">CAD/USD</div>
            <div className="text-lg font-bold text-gray-900">0.74</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b"><h2 className="text-lg font-semibold">Revenue by Store</h2></div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {stores.slice(0, 15).map(store => {
              const storeOrders = orders.filter(o => o.store_name === store.name && o.order_status === 'OK')
              const revenue = storeOrders.reduce((sum, o) => sum + ((o.price_item || 0) * (o.qty || 1)), 0)
              const items = storeOrders.reduce((sum, o) => sum + (o.qty || 1), 0)
              return (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{store.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{storeOrders.length}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{items}</td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">£{revenue.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
