'use client'

import { useEffect, useState } from 'react'
import { supabase, canSeeCosts, UserRole } from '@/lib/supabase'
import { resolveOrder, resolveAllOrders } from '@/lib/resolver'

interface Order {
  id: string
  order_number: string
  order_date: string
  store_id: string
  store_name?: string
  store_sku: string
  etsy_color: string | null
  etsy_size: string | null
  qty: number
  price_item: number
  currency: string
  resolved_cost_usd: number | null
  resolved_shipping_usd: number | null
  resolve_status: string | null
  order_status: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stores, setStores] = useState<Record<string, string>>({})
  const [storesList, setStoresList] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'ok' | 'fix' | 'cancelled'>('all')
  const [showImport, setShowImport] = useState(false)
  const [importData, setImportData] = useState('')
  const [importing, setImporting] = useState(false)
  const [selectedStore, setSelectedStore] = useState('')
  const [userRole, setUserRole] = useState<UserRole>('store_manager')
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
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

    const { data: storesData } = await supabase.from('stores').select('id, name')
    const storeMap: Record<string, string> = {}
    storesData?.forEach(s => { storeMap[s.id] = s.name })
    setStores(storeMap)
    setStoresList(storesData || [])
    if (storesData && storesData.length > 0) {
      setSelectedStore(storesData[0].id)
    }

    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('order_date', { ascending: false })
      .limit(500)

    if (ordersData) {
      setOrders(ordersData.map(o => ({ ...o, store_name: storeMap[o.store_id] })))
    }
    setLoading(false)
  }

  const filteredOrders = orders.filter(o => {
    if (filter === 'all') return true
    if (filter === 'ok') return o.resolve_status === 'OK' && o.order_status === 'OK'
    if (filter === 'fix') return o.resolve_status === 'Needs Fix' || !o.resolve_status
    if (filter === 'cancelled') return o.order_status === 'Cancelled' || o.order_status === 'Refunded'
    return true
  })

  const handleImport = async () => {
    if (!importData.trim() || !selectedStore) return
    setImporting(true)

    try {
      const lines = importData.trim().split('\n')
      const headers = lines[0].split('\t')
      
      const findCol = (names: string[]) => {
        for (const name of names) {
          const idx = headers.findIndex(h => h.toLowerCase().includes(name.toLowerCase()))
          if (idx !== -1) return idx
        }
        return -1
      }

      const colDate = findCol(['Sale Date'])
      const colOrderId = findCol(['Order ID'])
      const colTxnId = findCol(['Transaction ID'])
      const colSku = findCol(['SKU'])
      const colQty = findCol(['Quantity'])
      const colPrice = findCol(['Price'])
      const colCurrency = findCol(['Currency'])
      const colVariations = findCol(['Variations'])

      if (colOrderId === -1 || colTxnId === -1 || colSku === -1) {
        alert('Missing required columns: Order ID, Transaction ID, or SKU')
        setImporting(false)
        return
      }

      const newOrders = []
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split('\t')
        if (cols.length < headers.length) continue

        const variations = cols[colVariations] || ''
        let color = ''
        let size = ''

        const colorMatch = variations.match(/(?:Color|Colour)\s*:\s*([^,]+)/i)
        if (colorMatch) color = colorMatch[1].trim()

        const typeMatch = variations.match(/Types\s*:\s*([^,]+)/i)
        if (!color && typeMatch) color = typeMatch[1].trim()

        const sizeMatch = variations.match(/Size\s*:\s*([^,]+)/i)
        if (sizeMatch) size = sizeMatch[1].trim()

        newOrders.push({
          order_number: cols[colOrderId]?.trim(),
          order_line_id: cols[colTxnId]?.trim(),
          platform: 'ETSY',
          store_id: selectedStore,
          store_sku: cols[colSku]?.trim(),
          etsy_order_id: cols[colOrderId]?.trim(),
          etsy_color: color || null,
          etsy_size: size || null,
          qty: parseInt(cols[colQty]) || 1,
          price_item: parseFloat(cols[colPrice]) || 0,
          currency: cols[colCurrency]?.trim() || 'GBP',
          order_date: cols[colDate]?.trim() || new Date().toISOString().split('T')[0],
          order_status: 'OK',
        })
      }

      if (newOrders.length > 0) {
        const { error } = await supabase.from('orders').upsert(newOrders, {
          onConflict: 'etsy_order_id,order_line_id',
        })

        if (error) {
          console.error(error)
          alert('Import error: ' + error.message)
        } else {
          // Auto-resolve imported orders
          const result = await resolveAllOrders()
          alert(`Imported ${newOrders.length} orders. Resolved: ${result.resolved}, Need attention: ${result.failed}`)
          setShowImport(false)
          setImportData('')
          loadData()
        }
      }
    } catch (err: any) {
      alert('Import failed: ' + err.message)
    }

    setImporting(false)
  }

  const handleResolveAll = async () => {
    setResolving(true)
    const result = await resolveAllOrders()
    alert(`Resolved: ${result.resolved}, Failed: ${result.failed}`)
    loadData()
    setResolving(false)
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from('orders').update({ order_status: status }).eq('id', orderId)
    loadData()
  }

  const showCosts = canSeeCosts(userRole)

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Orders</h2>
          <p className="text-sm text-gray-500">{orders.length} total orders</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleResolveAll}
            disabled={resolving}
            className="border border-emerald-500 text-emerald-600 px-4 py-2 rounded-lg text-sm hover:bg-emerald-50 flex items-center gap-2 disabled:opacity-50"
          >
            <i className={`fas ${resolving ? 'fa-spinner fa-spin' : 'fa-magic'}`}></i>
            Resolve All
          </button>
          <button
            onClick={() => setShowImport(true)}
            data-tour="import-btn"
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-600 flex items-center gap-2"
          >
            <i className="fas fa-file-import"></i> Import Orders
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Import Modal */}
        {showImport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-auto" data-tour="product-form">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Import Orders from Etsy CSV</h3>
                <button onClick={() => setShowImport(false)} className="text-gray-400 hover:text-gray-600">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Store</label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {storesList.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Copy and paste your Etsy "Sold Order Items" CSV data below (including headers).
              </p>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste CSV data here..."
                className="w-full h-64 border rounded-lg p-3 text-sm font-mono"
                data-tour="import-textarea"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowImport(false)}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 disabled:opacity-50"
                  data-tour="import-submit"
                >
                  {importing ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {(['all', 'ok', 'fix', 'cancelled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === f ? 'bg-emerald-500 text-white' : 'bg-white border hover:bg-gray-50'
              }`}
            >
              {f === 'all' && `All (${orders.length})`}
              {f === 'ok' && `Resolved (${orders.filter(o => o.resolve_status === 'OK' && o.order_status === 'OK').length})`}
              {f === 'fix' && `Needs Fix (${orders.filter(o => o.resolve_status === 'Needs Fix' || !o.resolve_status).length})`}
              {f === 'cancelled' && `Cancelled (${orders.filter(o => o.order_status !== 'OK').length})`}
            </button>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Store</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Variant</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Price</th>
                {showCosts && <th className="px-4 py-3">Cost</th>}
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={showCosts ? 10 : 9} className="px-4 py-8 text-center text-gray-500">
                    No orders found. Import orders or add a store first.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm">#{order.order_number}</td>
                    <td className="px-4 py-3 text-sm">{order.order_date}</td>
                    <td className="px-4 py-3 text-sm">{order.store_name?.split(' - ')[0] || '-'}</td>
                    <td className="px-4 py-3 text-sm font-mono">{order.store_sku}</td>
                    <td className="px-4 py-3 text-sm">
                      {order.etsy_color || '-'} / {order.etsy_size || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{order.qty}</td>
                    <td className="px-4 py-3 text-sm">
                      {order.currency === 'GBP' ? '£' : '$'}{order.price_item.toFixed(2)}
                    </td>
                    {showCosts && (
                      <td className="px-4 py-3 text-sm">
                        {order.resolved_cost_usd ? `$${order.resolved_cost_usd.toFixed(2)}` : <span className="text-red-500">-</span>}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        order.order_status === 'Cancelled' || order.order_status === 'Refunded'
                          ? 'status-cancelled'
                          : order.resolve_status === 'OK'
                          ? 'status-ok'
                          : 'status-fix'
                      }`}>
                        {order.order_status !== 'OK' ? order.order_status : order.resolve_status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {order.order_status === 'OK' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                              className="text-xs text-gray-400 hover:text-red-500"
                              title="Mark Cancelled"
                            >
                              <i className="fas fa-ban"></i>
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'Refunded')}
                              className="text-xs text-gray-400 hover:text-orange-500 ml-2"
                              title="Mark Refunded"
                            >
                              <i className="fas fa-undo"></i>
                            </button>
                          </>
                        )}
                        {order.order_status !== 'OK' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'OK')}
                            className="text-xs text-gray-400 hover:text-emerald-500"
                            title="Restore"
                          >
                            <i className="fas fa-check"></i>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
