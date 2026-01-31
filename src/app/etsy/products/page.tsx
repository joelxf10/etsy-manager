'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Package, Search, Plus, X, ExternalLink, Image, AlertTriangle } from 'lucide-react'

export default function EtsyProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [variants, setVariants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    const { data: p } = await supabase.from('product_master').select('*').order('gp_id')
    const { data: v } = await supabase.from('variant_master').select('*')
    setProducts(p || [])
    setVariants(v || [])
    setLoading(false)
  }

  const filtered = products.filter(p => 
    p.gp_id?.toLowerCase().includes(search.toLowerCase()) || 
    p.product_internal_name?.toLowerCase().includes(search.toLowerCase())
  )

  const getVariantCount = (gpId: string) => variants.filter(v => v.gp_id === gpId).length

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Master</h1>
          <p className="text-gray-500">{products.length} products with GP_ID system</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Image className="w-5 h-5 text-blue-500 mt-0.5" />
        <div>
          <p className="font-medium text-blue-700">Image-Based Sourcing</p>
          <p className="text-sm text-blue-600">Products are tracked by images for supplier (Suri). 1688 links are optional - most products use image matching.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search GP_ID or product name..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filtered.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GP_ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variants</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sourcing</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">1688 Link</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm font-bold text-orange-600">{product.gp_id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.product_internal_name || 'Unnamed Product'}</p>
                        {product.notes && <p className="text-xs text-gray-500">{product.notes}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {getVariantCount(product.gp_id)} variants
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.is_image_based ? (
                      <span className="flex items-center gap-1 text-xs text-blue-600">
                        <Image className="w-4 h-4" /> Image-based
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">Link-based</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {product.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.canonical_1688_link ? (
                      <a href={product.canonical_1688_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 text-sm">
                        <ExternalLink className="w-4 h-4" />1688
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No products yet</p>
            <p className="text-sm mt-2">Products sync from CORE_MASTER Google Sheet</p>
          </div>
        )}
      </div>

      {/* Variants Section */}
      {variants.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Recent Variants ({variants.length} total)</h2>
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">VAR_ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">GP_ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {variants.slice(0, 10).map(v => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-sm text-gray-600">{v.var_id}</td>
                    <td className="px-4 py-3 font-mono text-sm text-orange-600">{v.gp_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{v.etsy_color || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{v.etsy_size || '—'}</td>
                    <td className="px-4 py-3">
                      {v.missing_price ? (
                        <span className="flex items-center gap-1 text-xs text-yellow-600">
                          <AlertTriangle className="w-3 h-3" /> Missing
                        </span>
                      ) : (
                        <span className="text-xs text-green-600">✓ Has price</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
