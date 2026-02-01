'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { DollarSign, TrendingUp, Package, Store } from 'lucide-react'

export default function EbayFinancePage() {
  const [orders, setOrders] = useState<any[]>([])
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: s } = await supabase.from('stores').select('*').eq('platform', 'ebay')
      const { data: o } = await supabase.from('orders').select('*, store:stores(*)').order('order_date', { ascending: false })
      setStores(s || [])
      setOrders(o?.filter((x: any) => x.store?.platform === 'ebay') || [])
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-2xl font-bold text-gray-900">eBay Finance</h1><p className="text-gray-500">Revenue and performance</p></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4"><DollarSign className="w-5 h-5 text-green-600" /></div>
          <h3 className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</h3>
          <p className="text-gray-500 text-sm">Total Revenue</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4"><Package className="w-5 h-5 text-blue-600" /></div>
          <h3 className="text-2xl font-bold text-gray-900">{orders.length}</h3>
          <p className="text-gray-500 text-sm">Total Orders</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4"><TrendingUp className="w-5 h-5 text-purple-600" /></div>
          <h3 className="text-2xl font-bold text-gray-900">${avgOrder.toFixed(2)}</h3>
          <p className="text-gray-500 text-sm">Avg Order Value</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4"><Store className="w-5 h-5 text-blue-600" /></div>
          <h3 className="text-2xl font-bold text-gray-900">{stores.length}</h3>
          <p className="text-gray-500 text-sm">Active Stores</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b"><h2 className="text-lg font-semibold">Revenue by Store</h2></div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {stores.map(store => {
              const storeOrders = orders.filter(o => o.store_id === store.id)
              const revenue = storeOrders.reduce((sum, o) => sum + (o.total || 0), 0)
              return (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{store.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{storeOrders.length}</td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">${revenue.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
