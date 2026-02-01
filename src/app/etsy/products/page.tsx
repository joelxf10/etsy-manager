'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Package, Search, ChevronDown, ChevronUp, ExternalLink, ImageOff } from 'lucide-react'

// Image component with error handling - uses Next.js unoptimized for external URLs
function ProductImage({ src, alt, className = '' }: { src?: string | null; alt: string; className?: string }) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)
  
  // Reset error state when src changes
  useEffect(() => {
    setError(false)
    setLoaded(false)
  }, [src])
  
  if (error || !src) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <ImageOff className="w-6 h-6 text-gray-300" />
      </div>
    )
  }
  
  return (
    <div className={`relative bg-gray-100 ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-pulse w-6 h-6 bg-gray-200 rounded" />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={src} 
        alt={alt} 
        className={`w-full h-full object-cover transition-opacity ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
        referrerPolicy="no-referrer"
        loading="lazy"
      />
    </div>
  )
}

export default function EtsyProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [variants, setVariants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    const { data: p } = await supabase.from('store_products').select('*').order('store_name')
    const { data: v } = await supabase.from('store_variants').select('*')
    setProducts(p || [])
    setVariants(v || [])
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

  // Get variants for a product
  const getVariants = (productSku: string, storeName: string) => {
    return variants.filter(v => v.product_sku === productSku && v.store_name === storeName)
  }

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products & Variants</h1>
        <p className="text-gray-500">{products.length} products with {variants.length} variants across {Object.keys(byStore).length} stores</p>
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

      {/* Products by Store */}
      {Object.entries(byStore).map(([storeName, storeProducts]) => (
        <div key={storeName} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            {storeName}
            <span className="text-sm font-normal text-gray-500">({storeProducts.length} products)</span>
          </h2>
          
          <div className="space-y-4">
            {storeProducts.map(product => {
              const productVariants = getVariants(product.sku, product.store_name)
              const isExpanded = expandedProduct === product.id
              
              return (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  {/* Product Header */}
                  <div 
                    className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                  >
                    {/* Main Image */}
                    <ProductImage 
                      src={product.main_image} 
                      alt={product.sku} 
                      className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0" 
                    />

                    {/* Product Info */}
                    <div className="flex-1">
                      <p className="font-mono font-bold text-gray-900">{product.sku}</p>
                      <p className="text-sm text-gray-500">Product #{product.product_num}</p>
                      {productVariants.length > 0 && (
                        <p className="text-sm text-orange-600 mt-1">
                          {productVariants.length} variants/colors
                        </p>
                      )}
                    </div>

                    {/* Expand Button */}
                    <div className="text-gray-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Expanded: Show Variants */}
                  {isExpanded && (
                    <div className="border-t bg-gray-50 p-4">
                      {productVariants.length > 0 ? (
                        <>
                          <p className="text-sm font-medium text-gray-700 mb-3">Variants / Colors:</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {productVariants.map((variant, idx) => (
                              <div key={idx} className="bg-white rounded-lg border overflow-hidden">
                                <ProductImage 
                                  src={variant.image} 
                                  alt={variant.variant_name} 
                                  className="aspect-square" 
                                />
                                <div className="p-2">
                                  <p className="text-xs text-gray-700 font-medium truncate" title={variant.variant_name}>
                                    {variant.variant_name}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">No variants found for this product</p>
                      )}

                      {/* All Product Images */}
                      {product.images && product.images.length > 1 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm font-medium text-gray-700 mb-3">All Images ({product.images.length}):</p>
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {product.images.map((img: string, idx: number) => (
                              <ProductImage 
                                key={idx} 
                                src={img} 
                                alt={`${product.sku} - ${idx + 1}`} 
                                className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden" 
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Open image in new tab option */}
                      {productVariants.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs text-gray-400">
                            💡 Tip: If images don&apos;t load, right-click and &quot;Open image in new tab&quot; to view directly
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-4" />
          <p>No products found</p>
        </div>
      )}
    </div>
  )
}
