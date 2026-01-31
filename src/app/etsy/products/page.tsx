'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Package, Search, Plus, X, ExternalLink } from 'lucide-react'

export default function EtsyProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newProduct, setNewProduct] = useState({ store_id: '', title: '', description: '', base_price: '', supplier_url: '', supplier_price: '' })
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    const { data: s } = await supabase.from('stores').select('*').eq('platform', 'etsy').order('name')
    const { data: p } = await supabase.from('products').select('*, store:stores(*)').order('created_at', { ascending: false })
    setStores(s || [])
    setProducts(p?.filter((x: any) => x.store?.platform === 'etsy') || [])
    setLoading(false)
  }

  async function addProduct() {
    if (!newProduct.store_id || !newProduct.title) return
    await supabase.from('products').insert({
      store_id: newProduct.store_id,
      title: newProduct.title,
      description: newProduct.description,
      base_price: parseFloat(newProduct.base_price) || 0,
      supplier_url: newProduct.supplier_url,
      supplier_price: parseFloat(newProduct.supplier_price) || 0
    })
    setShowAdd(false)
    setNewProduct({ store_id: '', title: '', description: '', base_price: '', supplier_url: '', supplier_price: '' })
    load()
  }

  const filtered = products.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()) || p.store?.name.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div><h1 className="text-2xl font-bold text-gray-900">Products</h1><p className="text-gray-500">{products.length} products</p></div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"><Plus className="w-5 h-5" />Add Product</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {filtered.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-orange-600" /></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{product.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{product.store?.name}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">${product.base_price || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">${product.supplier_price || 0}</td>
                  <td className="px-6 py-4 text-sm font-medium text-green-600">${((product.base_price || 0) - (product.supplier_price || 0)).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    {product.supplier_url ? (
                      <a href={product.supplier_url} target="_blank" className="text-blue-500 hover:underline flex items-center gap-1 text-sm"><ExternalLink className="w-4 h-4" />Link</a>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-gray-400"><Package className="w-12 h-12 mx-auto mb-4 text-gray-300" /><p>No products yet</p></div>
        )}
      </div>
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold">Add Product</h2><button onClick={() => setShowAdd(false)}><X className="w-5 h-5" /></button></div>
            <div className="space-y-4">
              <select value={newProduct.store_id} onChange={(e) => setNewProduct({ ...newProduct, store_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                <option value="">Select store</option>
                {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input type="text" placeholder="Product title" value={newProduct.title} onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              <textarea placeholder="Description" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" rows={2} />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Sell price" value={newProduct.base_price} onChange={(e) => setNewProduct({ ...newProduct, base_price: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                <input type="number" placeholder="Cost price" value={newProduct.supplier_price} onChange={(e) => setNewProduct({ ...newProduct, supplier_price: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <input type="text" placeholder="Supplier URL" value={newProduct.supplier_url} onChange={(e) => setNewProduct({ ...newProduct, supplier_url: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              <button onClick={addProduct} className="w-full py-2 bg-orange-500 text-white rounded-lg">Add Product</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
