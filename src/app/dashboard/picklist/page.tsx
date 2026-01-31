'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface PicklistItem {
  id: string
  order_number: string
  order_date: string
  store_name: string
  var_id: string
  etsy_color: string | null
  etsy_size: string | null
  qty: number
  supplier_variation: string | null
  link_1688: string | null
}

export default function PicklistPage() {
  const [items, setItems] = useState<PicklistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPicklist()
  }, [])

  const loadPicklist = async () => {
    // Get stores
    const { data: storesData } = await supabase.from('stores').select('id, name')
    const storeMap: Record<string, string> = {}
    storesData?.forEach(s => { storeMap[s.id] = s.name })

    // Get products for 1688 links
    const { data: productsData } = await supabase.from('products').select('id, gp_id, canonical_1688_link')
    const productMap: Record<string, { gp_id: string; link: string | null }> = {}
    productsData?.forEach(p => { productMap[p.gp_id] = { gp_id: p.gp_id, link: p.canonical_1688_link } })

    // Get resolved orders that are OK
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .eq('order_status', 'OK')
      .eq('resolve_status', 'OK')
      .order('order_date', { ascending: false })

    if (ordersData) {
      const picklist = ordersData.map(order => {
        const gpId = order.resolved_gp_id
        const product = gpId ? productMap[gpId] : null

        return {
          id: order.id,
          order_number: order.order_number,
          order_date: order.order_date,
          store_name: storeMap[order.store_id] || '-',
          var_id: order.resolved_var_id || '-',
          etsy_color: order.etsy_color,
          etsy_size: order.etsy_size,
          qty: order.qty,
          supplier_variation: order.resolved_supplier_variation,
          link_1688: product?.link || null,
        }
      })
      setItems(picklist)
    }

    setLoading(false)
  }

  const exportCSV = () => {
    const headers = ['Order Date', 'Order #', 'VAR ID', 'Qty', 'Color', 'Size', 'Supplier Variation', '1688 Link']
    const rows = items.map(item => [
      item.order_date,
      item.order_number,
      item.var_id,
      item.qty,
      item.etsy_color || '',
      item.etsy_size || '',
      item.supplier_variation || '',
      item.link_1688 || '',
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `supplier-picklist-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Supplier Picklist</h2>
          <p className="text-sm text-gray-500">{items.length} items ready for fulfillment</p>
        </div>
        <button
          onClick={exportCSV}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-600 flex items-center gap-2"
        >
          <i className="fas fa-download"></i> Export CSV
        </button>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b bg-gray-50">
                <th className="px-4 py-3">Order Date</th>
                <th className="px-4 py-3">Order #</th>
                <th className="px-4 py-3">VAR ID</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Color</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Supplier Variation</th>
                <th className="px-4 py-3">1688 Link</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No items ready for fulfillment. Orders need to be resolved first.
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{item.order_date}</td>
                    <td className="px-4 py-3 font-mono text-sm">#{item.order_number}</td>
                    <td className="px-4 py-3 font-mono text-sm text-emerald-600">{item.var_id}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{item.qty}</td>
                    <td className="px-4 py-3 text-sm">{item.etsy_color || '-'}</td>
                    <td className="px-4 py-3 text-sm">{item.etsy_size || '-'}</td>
                    <td className="px-4 py-3 text-sm">{item.supplier_variation || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {item.link_1688 ? (
                        <a
                          href={item.link_1688}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          <i className="fas fa-external-link-alt mr-1"></i>Open
                        </a>
                      ) : (
                        <span className="text-gray-400">Image-based</span>
                      )}
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
