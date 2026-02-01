'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Package, Printer, AlertCircle, CheckCircle } from 'lucide-react'

export default function SupplierPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [variants, setVariants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    const { data: o } = await supabase
      .from('store_orders')
      .select('*')
      .in('status', ['PREPARE', 'prepare'])
      .order('order_date', { ascending: true })
    const { data: p } = await supabase.from('store_products').select('*')
    const { data: v } = await supabase.from('store_variants').select('*')
    setOrders(o || [])
    setProducts(p || [])
    setVariants(v || [])
    setLoading(false)
  }

  // Find the best matching image for an order based on color/variant
  function getOrderImage(order: any) {
    // First try to match by color/variant name
    if (order.color) {
      const colorLower = order.color.toLowerCase()
      const matchingVariant = variants.find(v => 
        v.store_name === order.store_name && 
        v.variant_name?.toLowerCase().includes(colorLower)
      )
      if (matchingVariant?.image) return { image: matchingVariant.image, matched: true }
    }
    
    // Try to match by SKU product number
    if (order.sku) {
      const skuMatch = order.sku.match(/(\d+)$/)
      if (skuMatch) {
        const prodNum = parseInt(skuMatch[1])
        const product = products.find(p => 
          p.store_name === order.store_name && 
          p.product_num === prodNum
        )
        if (product?.main_image) return { image: product.main_image, matched: false }
      }
    }
    
    // Fallback to any product from same store
    const storeProduct = products.find(p => p.store_name === order.store_name)
    return { image: storeProduct?.main_image || null, matched: false }
  }

  async function markAsShipped(orderId: string) {
    await supabase.from('store_orders').update({ 
      status: 'SHIPPED',
      updated_at: new Date().toISOString()
    }).eq('id', orderId)
    
    setOrders(orders.filter(o => o.id !== orderId))
  }

  function printPicklist() {
    window.print()
  }

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Supplier Picklist</h1>
          <p className="text-gray-500">{orders.length} orders ready to prepare for Suri</p>
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
      <div className="hidden print:block mb-6 text-center border-b pb-4">
        <h1 className="text-2xl font-bold">EcomGiga - Supplier Picklist</h1>
        <p className="text-gray-600">Date: {new Date().toLocaleDateString()} | Total Orders: {orders.length}</p>
      </div>

      {/* Legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 print:hidden">
        <p className="font-medium text-blue-700 mb-2">For Supplier (Suri):</p>
        <p className="text-sm text-blue-600">Each card shows the product IMAGE, color/style, size, and quantity. Use the image to identify the product.</p>
        <div className="flex gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded-full"></span> Image matches color</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-orange-400 rounded-full"></span> General product image</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
          <p className="text-gray-700 text-lg font-medium">All caught up!</p>
          <p className="text-gray-500">No orders to prepare right now</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2 print:gap-2">
          {orders.map((order, index) => {
            const { image, matched } = getOrderImage(order)
            
            return (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border overflow-hidden print:break-inside-avoid print:shadow-none print:border-2">
                {/* Header with order number */}
                <div className={`px-4 py-2 flex justify-between items-center ${matched ? 'bg-green-500' : 'bg-orange-500'} text-white`}>
                  <span className="font-bold text-lg">#{index + 1}</span>
                  <span className="font-mono text-sm">{order.order_number}</span>
                </div>

                {/* Product Image - LARGE for supplier */}
                <div className="aspect-square bg-gray-100 relative">
                  {image ? (
                    <img src={image} alt="Product" className="w-full h-full object-contain p-2" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-orange-400">
                      <AlertCircle className="w-16 h-16 mb-2" />
                      <span className="text-sm">No image found</span>
                    </div>
                  )}
                  {!matched && image && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                      General image
                    </div>
                  )}
                </div>

                {/* Order Details - Clear for supplier */}
                <div className="p-4 space-y-3">
                  {/* Color/Type - Most important for identification */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-700 uppercase font-medium">Color / Type</p>
                    <p className="text-lg font-bold text-gray-900">{order.color || '—'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 uppercase">Size</p>
                      <p className="text-lg font-bold text-gray-900">{order.size || '—'}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-orange-600 uppercase">Quantity</p>
                      <p className="text-2xl font-bold text-orange-600">{order.quantity}</p>
                    </div>
                  </div>
                  
                  {/* Ship To */}
                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-500 uppercase mb-1">Ship To</p>
                    <p className="font-medium text-sm">{order.buyer_name}</p>
                    <p className="text-sm text-gray-600">{order.city}, {order.country}</p>
                  </div>

                  {/* SKU for reference */}
                  <p className="text-xs text-gray-400 border-t pt-2">SKU: {order.sku}</p>

                  {/* Mark as Done button (hidden in print) */}
                  <button 
                    onClick={() => markAsShipped(order.id)}
                    className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 print:hidden"
                  >
                    ✓ Mark as Shipped
                  </button>
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
          .print\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
        }
      `}</style>
    </div>
  )
}
