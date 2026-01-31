'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Store, ClipboardList, DollarSign, Camera, TrendingUp, Clock, AlertCircle, Upload } from 'lucide-react'
import Link from 'next/link'

export default function EbayDashboard() {
  const [stores, setStores] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [screenshots, setScreenshots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: s } = await supabase.from('stores').select('*').eq('platform', 'ebay')
      const { data: o } = await supabase.from('orders').select('*, store:stores(*)').order('created_at', { ascending: false })
      const today = new Date().toISOString().split('T')[0]
      const { data: ss } = await supabase.from('screenshots').select('*').eq('screenshot_date', today)
      setStores(s || [])
      setOrders(o?.filter((x: any) => x.store?.platform === 'ebay') || [])
      setScreenshots(ss || [])
      setLoading(false)
    }
    load()
  }, [supabase])

  const activeStores = stores.filter(s => s.is_active).length
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const missingScreenshots = activeStores - screenshots.length

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-2xl font-bold text-gray-900">eBay Dashboard</h1><p className="text-gray-500">Overview of your eBay operations</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Store className="w-6 h-6 text-blue-600" /></div>
            <span className="text-green-500 text-sm font-medium flex items-center gap-1"><TrendingUp className="w-4 h-4" />Active</span>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{activeStores}</h3>
          <p className="text-gray-500 text-sm">Active Stores</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"><ClipboardList className="w-6 h-6 text-purple-600" /></div>
            {pendingOrders > 0 && <span className="text-yellow-500 text-sm font-medium flex items-center gap-1"><Clock className="w-4 h-4" />{pendingOrders}</span>}
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{orders.length}</h3>
          <p className="text-gray-500 text-sm">Total Orders</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4"><Camera className="w-6 h-6 text-green-600" /></div>
          <h3 className="text-3xl font-bold text-gray-900">{screenshots.length}</h3>
          <p className="text-gray-500 text-sm">Today's Screenshots</p>
          {missingScreenshots > 0 && <p className="text-red-400 text-xs mt-1">{missingScreenshots} stores missing</p>}
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4"><DollarSign className="w-6 h-6 text-yellow-600" /></div>
          <h3 className="text-3xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</h3>
          <p className="text-gray-500 text-sm">Total Revenue</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b flex justify-between items-center"><h2 className="text-lg font-semibold">Recent Orders</h2><Link href="/ebay/orders" className="text-blue-500 text-sm">View all</Link></div>
          {orders.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50"><tr><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th></tr></thead>
              <tbody className="divide-y">{orders.slice(0, 5).map(o => (<tr key={o.id} className="hover:bg-gray-50"><td className="px-4 py-3 text-sm text-gray-900">{o.store?.name}</td><td className="px-4 py-3"><span className={`px-2 py-1 text-xs rounded-full ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{o.status}</span></td><td className="px-4 py-3 text-sm font-medium">${o.total || 0}</td></tr>))}</tbody>
            </table>
          ) : (<div className="p-8 text-center text-gray-400">No orders yet</div>)}
        </div>
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b flex justify-between items-center"><h2 className="text-lg font-semibold">Screenshot Status</h2><Link href="/ebay/screenshots" className="text-blue-500 text-sm">Upload</Link></div>
          <div className="p-6">
            {missingScreenshots > 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3"><AlertCircle className="w-5 h-5 text-red-500" /><div><p className="text-red-700 font-medium">{missingScreenshots} stores missing</p><p className="text-red-500 text-sm">Upload daily screenshots</p></div></div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3"><TrendingUp className="w-5 h-5 text-green-500" /><div><p className="text-green-700 font-medium">All done!</p></div></div>
              </div>
            )}
            <Link href="/ebay/screenshots" className="flex items-center justify-center gap-2 w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"><Upload className="w-5 h-5" />Upload Screenshot</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
