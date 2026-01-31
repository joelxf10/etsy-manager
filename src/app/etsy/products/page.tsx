'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Package, Search, ExternalLink, Image } from 'lucide-react'

export default function EtsyProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('store_products').select('*').order('store_name')
    setProducts(data || [])
    setLoading(false)
  }

  const filtered = products.filter(p => 
    p.store_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  )

  // Group by store
  const byStore: Record<string, any[]> = {}
  filtered.forEach(p => {
    if (!byStore[p.store_name]) byStore[p.store_name] = []
    byStore[p.store_name].push(p)
  })

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-500">{products.length} products with images across {Object.keys(byStore).length} stores</p>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Image className="w-5 h-5 text-blue-500 mt-0.5" />
        <div>
          <p className="font-medium text-blue-700">Image-Based Sourcing</p>
          <p className="text-sm text-blue-600">Supplier (Suri) uses these images to identify and source products. Click any product to see all images.</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search store or SKU..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="w-full pl-10 pr-4 py-2 border rounded-lg" 
          />
        </div>
      </div>

      {/* Products Grid by Store */}
      {Object.entries(byStore).map(([storeName, storeProducts]) => (
        <div key={storeName} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{storeName}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {storeProducts.map(product => (
              <div 
                key={product.id} 
                className="bg-white rounded-xl shadow-sm border overflow-hidden cursor-pointer hover:shadow-md transition"
                onClick={() => setSelectedProduct(product)}
              >
                {/* Product Image */}
                <div className="aspect-square bg-gray-100">
                  {product.main_image ? (
                    <img src={product.main_image} alt={product.sku} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="font-mono text-xs text-gray-600 truncate">{product.sku}</p>
                  {product.link_1688 && (
                    <a 
                      href={product.link_1688} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                    >
                      <ExternalLink className="w-3 h-3" /> 1688
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-4" />
          <p>No products found</p>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedProduct(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedProduct.sku}</h2>
                  <p className="text-gray-500">{selectedProduct.store_name}</p>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
              </div>

              {/* Main Image */}
              <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden mb-4">
                <img src={selectedProduct.main_image} alt={selectedProduct.sku} className="w-full h-full object-contain" />
              </div>

              {/* All Images */}
              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">All Images ({selectedProduct.images.length})</p>
                  <div className="grid grid-cols-5 gap-2">
                    {selectedProduct.images.map((img: string, i: number) => (
                      <div key={i} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <img src={img} alt={`${selectedProduct.sku} - ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 1688 Link */}
              {selectedProduct.link_1688 && (
                <a 
                  href={selectedProduct.link_1688} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  <ExternalLink className="w-4 h-4" /> View on 1688
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
