'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Package, Printer, Download } from 'lucide-react'

export default function SupplierPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    // Get orders that need to be prepared
    const { data: o } = await supabase
      .from('store_orders')
      .select('*')
      .eq('status', 'PREPARE')
      .order('order_date', { ascending: true })
    const { data: p } = await supabase.from('store_products').select('*')
    setOrders(o || [])
    setProducts(p || [])
    setLoading(false)
  }

  function getProductImage(order: any) {
    if (order.main_image) return order.main_image
    const product = products.find(p => 
      p.store_name === order.store_name || 
      order.sku?.includes(p.sku)
    )
    return product?.main_image || null
  }

  function printPicklist() {
    window.print()
  }

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Picklist</h1>
          <p className="text-gray-500">{orders.length} orders ready to prepare</p>
        </div>
        <button 
          onClick={printPicklist}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <Printer className="w-5 h-5" />
          Print Picklist
        </button>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold">EcomGiga - Supplier Picklist</h1>
        <p className="text-gray-600">Generated: {new Date().toLocaleDateString()} | Orders: {orders.length}</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">No orders to prepare!</p>
          <p className="text-gray-400">All orders have been processed</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2">
          {orders.map((order, index) => {
            const image = getProductImage(order)
            
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border overflow-hidden print:break-inside-avoid print:border-2">
                {/* Order Number Banner */}
                <div className="bg-orange-500 text-white px-4 py-2 flex justify-between items-center">
                  <span className="font-bold">#{index + 1}</span>
                  <span className="font-mono text-sm">{order.order_number}</span>
                </div>

                {/* Product Image - Large for supplier */}
                <div className="aspect-square bg-gray-100">
                  {image ? (
                    <img src={image} alt="Product" className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-16 h-16" />
                    </div>
                  )}
                </div>

                {/* Order Details */}
                <div className="p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Color:</span>
                    <span className="font-bold text-lg">{order.color || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Size:</span>
                    <span className="font-bold text-lg">{order.size || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Quantity:</span>
                    <span className="font-bold text-lg text-orange-600">{order.quantity}</span>
                  </div>
                  
                  <div className="border-t pt-2 mt-2">
                    <p className="text-xs text-gray-500">Ship to:</p>
                    <p className="font-medium">{order.buyer_name}</p>
                    <p className="text-sm text-gray-600">{order.city}, {order.country}</p>
                  </div>

                  <div className="text-xs text-gray-400 pt-2 border-t">
                    SKU: {order.sku}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
        }
      `}</style>
    </div>
  )
}
