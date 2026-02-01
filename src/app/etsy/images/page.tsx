'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Image as ImageIcon, AlertTriangle, Check, Search, RefreshCw, Eye, Store, ExternalLink, Filter } from 'lucide-react'
import ProductImage from '@/components/ProductImage'

interface ImageGroup {
  hash: string
  images: {
    id: string
    url: string
    store_name: string
    product_title?: string
    variant_name?: string
    type: 'product' | 'variant'
  }[]
}

export default function ImageDuplicatesPage() {
  const [products, setProducts] = useState<any[]>([])
  const [variants, setVariants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [duplicateGroups, setDuplicateGroups] = useState<ImageGroup[]>([])
  const [storeFilter, setStoreFilter] = useState('')
  const [viewMode, setViewMode] = useState<'duplicates' | 'all'>('duplicates')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: p } = await supabase.from('store_products').select('*')
      const { data: v } = await supabase.from('store_variants').select('*')
      setProducts(p || [])
      setVariants(v || [])
      setLoading(false)
      
      // Auto-scan on load
      if (p || v) {
        scanForDuplicates(p || [], v || [])
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Simple URL-based duplicate detection
  // In production, you'd use perceptual hashing (pHash) for image similarity
  function scanForDuplicates(prods: any[], vars: any[]) {
    setScanning(true)
    
    const imageMap = new Map<string, ImageGroup['images']>()
    
    // Collect all product images
    prods.forEach(p => {
      if (p.main_image) {
        // Normalize URL (remove query params, trailing slashes)
        const normalizedUrl = normalizeUrl(p.main_image)
        const hash = simpleHash(normalizedUrl)
        
        if (!imageMap.has(hash)) {
          imageMap.set(hash, [])
        }
        imageMap.get(hash)!.push({
          id: p.id,
          url: p.main_image,
          store_name: p.store_name,
          product_title: p.title,
          type: 'product'
        })
      }
    })
    
    // Collect all variant images
    vars.forEach(v => {
      if (v.image) {
        const normalizedUrl = normalizeUrl(v.image)
        const hash = simpleHash(normalizedUrl)
        
        if (!imageMap.has(hash)) {
          imageMap.set(hash, [])
        }
        imageMap.get(hash)!.push({
          id: v.id,
          url: v.image,
          store_name: v.store_name,
          variant_name: v.variant_name,
          type: 'variant'
        })
      }
    })
    
    // Filter to only groups with duplicates (2+ images)
    const duplicates: ImageGroup[] = []
    imageMap.forEach((images, hash) => {
      if (images.length > 1) {
        // Check if images are from different stores
        const uniqueStores = new Set(images.map(i => i.store_name))
        if (uniqueStores.size > 1) {
          duplicates.push({ hash, images })
        }
      }
    })
    
    // Sort by number of duplicates (most duplicates first)
    duplicates.sort((a, b) => b.images.length - a.images.length)
    
    setDuplicateGroups(duplicates)
    setScanning(false)
  }

  function normalizeUrl(url: string): string {
    try {
      const u = new URL(url)
      // Remove common tracking params
      u.search = ''
      // Get just the pathname (the actual image file)
      return u.pathname.toLowerCase()
    } catch {
      return url.toLowerCase().replace(/\?.*$/, '')
    }
  }

  function simpleHash(str: string): string {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(36)
  }

  // Get unique store names
  const allStores = [...new Set([
    ...products.map(p => p.store_name),
    ...variants.map(v => v.store_name)
  ])].filter(Boolean).sort()

  // Filter duplicate groups by store
  const filteredGroups = storeFilter
    ? duplicateGroups.filter(g => g.images.some(i => i.store_name === storeFilter))
    : duplicateGroups

  // Stats
  const totalImages = products.filter(p => p.main_image).length + variants.filter(v => v.image).length
  const duplicateImages = duplicateGroups.reduce((sum, g) => sum + g.images.length, 0)
  const affectedStores = new Set(duplicateGroups.flatMap(g => g.images.map(i => i.store_name))).size

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Image Duplicate Detection</h1>
          <p className="text-gray-500">Find images used across multiple stores</p>
        </div>
        <button
          onClick={() => scanForDuplicates(products, variants)}
          disabled={scanning}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Scanning...' : 'Rescan'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalImages}</p>
              <p className="text-xs text-gray-500">Total Images</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{duplicateGroups.length}</p>
              <p className="text-xs text-gray-500">Duplicate Groups</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{duplicateImages}</p>
              <p className="text-xs text-gray-500">Duplicate Images</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{affectedStores}</p>
              <p className="text-xs text-gray-500">Stores Affected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">All Stores</option>
              {allStores.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('duplicates')}
              className={`px-3 py-1.5 rounded text-sm ${viewMode === 'duplicates' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}
            >
              Duplicates Only
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded text-sm ${viewMode === 'all' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}
            >
              All Images
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {viewMode === 'duplicates' ? (
        <div className="space-y-4">
          {filteredGroups.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
              <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Cross-Store Duplicates Found</h3>
              <p className="text-gray-500">All images appear to be unique across different stores.</p>
            </div>
          ) : (
            filteredGroups.map((group, idx) => (
              <div key={group.hash} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-yellow-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium text-yellow-800">
                      Duplicate Group #{idx + 1} - {group.images.length} instances across {new Set(group.images.map(i => i.store_name)).size} stores
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {group.images.map((img, i) => (
                      <div key={`${img.id}-${i}`} className="border rounded-lg overflow-hidden">
                        <div className="aspect-square bg-gray-100 relative">
                          <ProductImage
                            src={img.url}
                            alt={img.variant_name || img.product_title || 'Product'}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-2 bg-gray-50">
                          <p className="text-xs font-medium text-gray-900 truncate">{img.store_name}</p>
                          <p className="text-xs text-gray-500 truncate">{img.variant_name || img.product_title}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded ${img.type === 'product' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {img.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // All Images Grid View
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="font-semibold">All Product Images</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {[
                ...products.filter(p => p.main_image && (!storeFilter || p.store_name === storeFilter)).map(p => ({
                  id: p.id,
                  url: p.main_image,
                  store_name: p.store_name,
                  name: p.title,
                  type: 'product' as const
                })),
                ...variants.filter(v => v.image && (!storeFilter || v.store_name === storeFilter)).map(v => ({
                  id: v.id,
                  url: v.image,
                  store_name: v.store_name,
                  name: v.variant_name,
                  type: 'variant' as const
                }))
              ].slice(0, 100).map((img, i) => (
                <div key={`${img.type}-${img.id}-${i}`} className="group relative">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <ProductImage
                      src={img.url}
                      alt={img.name || 'Image'}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-end p-2">
                    <p className="text-white text-xs truncate">{img.store_name}</p>
                    <p className="text-white/70 text-xs truncate">{img.name}</p>
                  </div>
                </div>
              ))}
            </div>
            {totalImages > 100 && (
              <p className="text-center text-gray-500 mt-4 text-sm">Showing first 100 of {totalImages} images</p>
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
        <h3 className="font-medium text-blue-800 mb-2">How Duplicate Detection Works</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Images are compared by their URL path (normalized)</li>
          <li>• Only cross-store duplicates are flagged (same image in different stores)</li>
          <li>• Same image variants within a store are not considered duplicates</li>
          <li>• For production use, consider implementing perceptual hashing (pHash) for visual similarity detection</li>
        </ul>
      </div>
    </div>
  )
}
