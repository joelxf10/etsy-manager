'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Search, AlertTriangle, CheckCircle, XCircle, Package, Clock } from 'lucide-react'

export default function EtsyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [resolveFilter, setResolveFilter] = useState('all')
  const [orderFilter, setOrderFilter] = useState('all')
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('orders_ledger').select('*').eq('platform', 'ETSY').order('order_date', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  const filtered = orders.filter(o => {
    if (resolveFilter !== 'all' && o.resolve_status !== resolveFilter) return false
    if (orderFilter !== 'all' && o.order_status !== orderFilter) return false
    if (search && !o.store_name?.toLowerCase().includes(search.toLowerCase()) && !o.order_number?.includes(search) && !o.store_sku?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const getResolveBadge = (status: string) => {
    if (status === 'OK') return 'bg-green-100 text-green-700'
    if (status === 'Needs Fix') return 'bg-red-100 text-red-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  const getOrderBadge = (status: string) => {
    if (status === 'OK') return 'bg-green-100 text-green-700'
    if (status === 'Cancelled') return 'bg-gray-100 text-gray-700'
    if (status === 'Refunded') return 'bg-red-100 text-red-700'
    return 'bg-blue-100 text-blue-700'
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = { GBP: '£', USD: '$', EUR: '€', AUD: 'A$', CAD: 'C$' }
    return (symbols[currency] || currency + ' ') + (amount?.toFixed(2) || '0.00')
  }

  const exceptions = orders.filter(o => o.resolve_status === 'Needs Fix').length

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Ledger</h1>
          <p className="text-gray-500">{orders.length} orders from Google Sheets sync</p>
        </div>
        {exceptions > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">{exceptions} need resolution</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
          <div className="text-sm text-gray-500">Total Orders</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{orders.filter(o => o.resolve_status === 'OK' && o.order_status === 'OK').length}</div>
          <div className="text-sm text-gray-500">Ready to Ship</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{exceptions}</div>
          <div className="text-sm text-gray-500">Needs Fix</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">{orders.filter(o => o.order_status === 'Cancelled').length}</div>
          <div className="text-sm text-gray-500">Cancelled</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{orders.reduce((sum, o) => sum + (o.qty || 1), 0)}</div>
          <div className="text-sm text-gray-500">Total Items</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search order #, store, SKU..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
          <select value={resolveFilter} onChange={(e) => setResolveFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="all">All Resolve Status</option>
            <option value="OK">✓ Resolved (OK)</option>
            <option value="Needs Fix">⚠ Needs Fix</option>
            <option value="Pending">⏳ Pending</option>
          </select>
          <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="all">All Order Status</option>
            <option value="OK">OK</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color/Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GP_ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resolve</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(order => (
                  <tr key={order.id} className={`hover:bg-gray-50 ${order.resolve_status === 'Needs Fix' ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3 text-sm text-gray-500">{order.order_date}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-900">{order.order_number}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[150px] truncate" title={order.store_name}>{order.store_name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-gray-600">{order.store_sku}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {order.etsy_color && <span className="block">{order.etsy_color}</span>}
                      {order.etsy_size && <span className="text-gray-400">{order.etsy_size}</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{order.qty || 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(order.price_item, order.currency)}</td>
                    <td className="px-4 py-3 text-sm">
                      {order.resolved_gp_id ? (
                        <span className="font-mono text-green-700">{order.resolved_gp_id}</span>
                      ) : (
                        <span className="text-red-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getResolveBadge(order.resolve_status)}`}>
                        {order.resolve_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getOrderBadge(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">No orders found</div>
        )}
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Orders sync from Google Sheets (ORDERS_HUB) via Apps Script. 
          Resolve Status shows if SKU → GP_ID mapping is complete. 
          Orders with "Needs Fix" require manual mapping in CORE_MASTER sheet.
        </p>
      </div>
    </div>
  )
}
