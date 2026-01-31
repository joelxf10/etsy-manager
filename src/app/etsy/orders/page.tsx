'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Search, Package, Truck, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react'

export default function EtsyOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('PREPARE')
  const [search, setSearch] = useState('')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    const { data: o } = await supabase.from('store_orders').select('*').order('order_date', { ascending: false })
    const { data: p } = await supabase.from('store_products').select('*')
    setOrders(o || [])
    setProducts(p || [])
    setLoading(false)
  }

  // Find product image for an order
  function getProductImage(order: any) {
    if (order.main_image) return order.main_image
    const product = products.find(p => 
      p.store_name === order.store_name || 
      order.sku?.includes(p.sku)
    )
    return product?.main_image || null
  }

  // Update order status
  async function updateStatus(orderId: string, newStatus: string) {
    setUpdating(orderId)
    await supabase.from('store_orders').update({ 
      status: newStatus,
      updated_at: new Date().toISOString()
    }).eq('id', orderId)
    
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    setUpdating(null)
  }

  // Update tracking
  async function updateTracking(orderId: string, tracking: string) {
    await supabase.from('store_orders').update({ 
      tracking,
      status: 'SHIPPED',
      updated_at: new Date().toISOString()
    }).eq('id', orderId)
    
    setOrders(orders.map(o => o.id === orderId ? { ...o, tracking, status: 'SHIPPED' } : o))
  }

  const filtered = orders.filter(o => {
    if (statusFilter !== 'ALL' && o.status?.toUpperCase() !== statusFilter) return false
    if (search) {
      const s = search.toLowerCase()
      return o.order_number?.includes(s) || 
             o.sku?.toLowerCase().includes(s) || 
             o.buyer_name?.toLowerCase().includes(s) ||
             o.store_name?.toLowerCase().includes(s)
    }
    return true
  })

  const statusCounts = {
    PREPARE: orders.filter(o => o.status?.toUpperCase() === 'PREPARE').length,
    SHIPPED: orders.filter(o => o.status?.toUpperCase() === 'SHIPPED').length,
    DELIVERED: orders.filter(o => o.status?.toUpperCase() === 'DELIVERED').length,
    CANCELLED: orders.filter(o => o.status?.toUpperCase() === 'CANCELLED').length,
  }

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500">Manage orders with product images for supplier</p>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setStatusFilter('ALL')} className={`px-4 py-2 rounded-lg font-medium ${statusFilter === 'ALL' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600'}`}>
          All ({orders.length})
        </button>
        <button onClick={() => setStatusFilter('PREPARE')} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${statusFilter === 'PREPARE' ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-700'}`}>
          <Package className="w-4 h-4" /> Prepare ({statusCounts.PREPARE})
        </button>
        <button onClick={() => setStatusFilter('SHIPPED')} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${statusFilter === 'SHIPPED' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700'}`}>
          <Truck className="w-4 h-4" /> Shipped ({statusCounts.SHIPPED})
        </button>
        <button onClick={() => setStatusFilter('DELIVERED')} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${statusFilter === 'DELIVERED' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'}`}>
          <CheckCircle className="w-4 h-4" /> Delivered ({statusCounts.DELIVERED})
        </button>
        <button onClick={() => setStatusFilter('CANCELLED')} className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${statusFilter === 'CANCELLED' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'}`}>
          <XCircle className="w-4 h-4" /> Cancelled ({statusCounts.CANCELLED})
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search order #, SKU, buyer, store..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 border rounded-lg" 
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400">
            No orders found
          </div>
        ) : (
          filtered.map(order => {
            const image = getProductImage(order)
            const isExpanded = expandedOrder === order.id
            
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {/* Order Header */}
                <div className="p-4 flex items-center gap-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {image ? (
                      <img src={image} alt="Product" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-gray-900">#{order.order_number}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        order.status?.toUpperCase() === 'PREPARE' ? 'bg-yellow-100 text-yellow-700' :
                        order.status?.toUpperCase() === 'SHIPPED' ? 'bg-blue-100 text-blue-700' :
                        order.status?.toUpperCase() === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{order.store_name}</p>
                    <p className="text-sm text-gray-500">
                      {order.color && <span className="mr-2">Color: <strong>{order.color}</strong></span>}
                      {order.size && <span className="mr-2">Size: <strong>{order.size}</strong></span>}
                      <span>Qty: <strong>{order.quantity}</strong></span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {order.status?.toUpperCase() === 'PREPARE' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'SHIPPED')}
                        disabled={updating === order.id}
                        className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 disabled:opacity-50"
                      >
                        {updating === order.id ? '...' : 'Mark Shipped'}
                      </button>
                    )}
                    {order.status?.toUpperCase() === 'SHIPPED' && (
                      <button 
                        onClick={() => updateStatus(order.id, 'DELIVERED')}
                        disabled={updating === order.id}
                        className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50"
                      >
                        {updating === order.id ? '...' : 'Mark Delivered'}
                      </button>
                    )}
                    <button 
                      onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t bg-gray-50 p-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">SKU</p>
                        <p className="font-mono text-sm">{order.sku}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Order Date</p>
                        <p className="text-sm">{order.order_date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Product Cost</p>
                        <p className="text-sm">${order.product_cost || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Shipping Cost</p>
                        <p className="text-sm">${order.shipping_cost || '—'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Buyer</p>
                        <p className="font-medium">{order.buyer_name}</p>
                        <p className="text-sm text-gray-600">{order.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase mb-1">Shipping Address</p>
                        <p className="text-sm">{order.address}</p>
                        <p className="text-sm">{order.city} {order.state} {order.postcode}</p>
                        <p className="text-sm font-medium">{order.country}</p>
                      </div>
                    </div>

                    {/* Tracking Input */}
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Enter tracking number..."
                        defaultValue={order.tracking || ''}
                        onBlur={(e) => {
                          if (e.target.value !== order.tracking) {
                            updateTracking(order.id, e.target.value)
                          }
                        }}
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      />
                      <select 
                        value={order.status?.toUpperCase()} 
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="PREPARE">Prepare</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
