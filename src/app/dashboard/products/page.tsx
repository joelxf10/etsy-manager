'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface Product {
  id: string
  gp_id: string
  name: string | null
  canonical_1688_link: string | null
  status: string
  notes: string | null
  variants?: Variant[]
}

interface Variant {
  id: string
  var_id: string
  etsy_color: string | null
  etsy_size: string | null
  supplier_variation_name: string | null
  last_cost_usd: number | null
  last_shipping_usd: number | null
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddVariant, setShowAddVariant] = useState<string | null>(null)
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null)
  
  const [newProduct, setNewProduct] = useState({ gp_id: '', name: '', link: '', notes: '' })
  const [newVariant, setNewVariant] = useState({ 
    etsy_color: '', etsy_size: '', supplier_variation: '', cost: '', shipping: '' 
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .order('gp_id', { ascending: true })

    const { data: variantsData } = await supabase
      .from('variants')
      .select('*')

    if (productsData) {
      const productsWithVariants = productsData.map(p => ({
        ...p,
        variants: variantsData?.filter(v => v.product_id === p.id) || []
      }))
      setProducts(productsWithVariants)
    }
    setLoading(false)
  }

  const generateGpId = () => {
    const maxNum = products.reduce((max, p) => {
      const num = parseInt(p.gp_id.replace('GP-', ''))
      return num > max ? num : max
    }, 0)
    return `GP-${String(maxNum + 1).padStart(6, '0')}`
  }

  const handleAddProduct = async () => {
    if (!newProduct.gp_id) {
      newProduct.gp_id = generateGpId()
    }

    const { error } = await supabase.from('products').insert({
      gp_id: newProduct.gp_id,
      name: newProduct.name || null,
      canonical_1688_link: newProduct.link || null,
      notes: newProduct.notes || null,
      status: 'active'
    })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setShowAddProduct(false)
      setNewProduct({ gp_id: '', name: '', link: '', notes: '' })
      loadProducts()
    }
  }

  const handleAddVariant = async (productId: string, gpId: string) => {
    const existingVariants = products.find(p => p.id === productId)?.variants || []
    const varNum = existingVariants.length + 1
    const varId = `${gpId}-V${String(varNum).padStart(2, '0')}`

    const { error } = await supabase.from('variants').insert({
      var_id: varId,
      product_id: productId,
      etsy_color: newVariant.etsy_color || null,
      etsy_size: newVariant.etsy_size || null,
      supplier_variation_name: newVariant.supplier_variation || null,
      last_cost_usd: newVariant.cost ? parseFloat(newVariant.cost) : null,
      last_shipping_usd: newVariant.shipping ? parseFloat(newVariant.shipping) : null,
    })

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setShowAddVariant(null)
      setNewVariant({ etsy_color: '', etsy_size: '', supplier_variation: '', cost: '', shipping: '' })
      loadProducts()
    }
  }

  const updateVariantCost = async (variantId: string, cost: number, shipping: number) => {
    await supabase.from('variants').update({
      last_cost_usd: cost,
      last_shipping_usd: shipping,
      last_updated: new Date().toISOString()
    }).eq('id', variantId)
    loadProducts()
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm('Delete this product and all its variants?')) return
    await supabase.from('products').delete().eq('id', productId)
    loadProducts()
  }

  const deleteVariant = async (variantId: string) => {
    if (!confirm('Delete this variant?')) return
    await supabase.from('variants').delete().eq('id', variantId)
    loadProducts()
  }

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
          <h2 className="text-xl font-semibold text-gray-800">Products & Variants</h2>
          <p className="text-sm text-gray-500">{products.length} products</p>
        </div>
        <button
          onClick={() => {
            setNewProduct({ ...newProduct, gp_id: generateGpId() })
            setShowAddProduct(true)
          }}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-600 flex items-center gap-2"
        >
          <i className="fas fa-plus"></i> Add Product
        </button>
      </div>

      <div className="p-6">
        {/* Add Product Modal */}
        {showAddProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GP ID</label>
                  <input
                    value={newProduct.gp_id}
                    onChange={(e) => setNewProduct({ ...newProduct, gp_id: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="GP-000001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Maternity Dress"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">1688 Link (optional)</label>
                  <input
                    value={newProduct.link}
                    onChange={(e) => setNewProduct({ ...newProduct, link: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="https://detail.1688.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <input
                    value={newProduct.notes}
                    onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                    placeholder="Image-based sourcing"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowAddProduct(false)}
                  className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products List */}
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
              <i className="fas fa-box text-4xl mb-4 text-gray-300"></i>
              <p>No products yet. Add your first product.</p>
            </div>
          ) : (
            products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border overflow-hidden">
                <div 
                  className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                >
                  <div className="flex items-center gap-4">
                    <i className={`fas fa-chevron-${expandedProduct === product.id ? 'down' : 'right'} text-gray-400 w-4`}></i>
                    <span className="font-mono text-emerald-600 font-medium">{product.gp_id}</span>
                    <span className="font-medium">{product.name || 'Unnamed Product'}</span>
                    <span className="text-sm text-gray-400">({product.variants?.length || 0} variants)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.canonical_1688_link && (
                      <a
                        href={product.canonical_1688_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-500 text-sm hover:underline"
                      >
                        <i className="fas fa-external-link-alt mr-1"></i>1688
                      </a>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteProduct(product.id) }}
                      className="text-gray-400 hover:text-red-500 ml-2"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                {expandedProduct === product.id && (
                  <div className="border-t bg-gray-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm text-gray-700">Variants</h4>
                      <button
                        onClick={() => setShowAddVariant(product.id)}
                        className="text-sm text-emerald-600 hover:underline"
                      >
                        <i className="fas fa-plus mr-1"></i>Add Variant
                      </button>
                    </div>

                    {/* Add Variant Form */}
                    {showAddVariant === product.id && (
                      <div className="bg-white border rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-5 gap-3">
                          <input
                            value={newVariant.etsy_color}
                            onChange={(e) => setNewVariant({ ...newVariant, etsy_color: e.target.value })}
                            placeholder="Etsy Color"
                            className="border rounded px-2 py-1 text-sm"
                          />
                          <input
                            value={newVariant.etsy_size}
                            onChange={(e) => setNewVariant({ ...newVariant, etsy_size: e.target.value })}
                            placeholder="Etsy Size"
                            className="border rounded px-2 py-1 text-sm"
                          />
                          <input
                            value={newVariant.supplier_variation}
                            onChange={(e) => setNewVariant({ ...newVariant, supplier_variation: e.target.value })}
                            placeholder="Supplier Variation"
                            className="border rounded px-2 py-1 text-sm"
                          />
                          <input
                            value={newVariant.cost}
                            onChange={(e) => setNewVariant({ ...newVariant, cost: e.target.value })}
                            placeholder="Cost USD"
                            type="number"
                            step="0.01"
                            className="border rounded px-2 py-1 text-sm"
                          />
                          <input
                            value={newVariant.shipping}
                            onChange={(e) => setNewVariant({ ...newVariant, shipping: e.target.value })}
                            placeholder="Shipping USD"
                            type="number"
                            step="0.01"
                            className="border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                          <button
                            onClick={() => setShowAddVariant(null)}
                            className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleAddVariant(product.id, product.gp_id)}
                            className="px-3 py-1 text-sm bg-emerald-500 text-white rounded hover:bg-emerald-600"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Variants Table */}
                    {product.variants && product.variants.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500">
                            <th className="pb-2">VAR ID</th>
                            <th className="pb-2">Etsy Color</th>
                            <th className="pb-2">Etsy Size</th>
                            <th className="pb-2">Supplier Variation</th>
                            <th className="pb-2">Cost USD</th>
                            <th className="pb-2">Shipping USD</th>
                            <th className="pb-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {product.variants.map((variant) => (
                            <tr key={variant.id} className="border-t">
                              <td className="py-2 font-mono text-xs">{variant.var_id}</td>
                              <td className="py-2">{variant.etsy_color || '-'}</td>
                              <td className="py-2">{variant.etsy_size || '-'}</td>
                              <td className="py-2">{variant.supplier_variation_name || '-'}</td>
                              <td className="py-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  defaultValue={variant.last_cost_usd || ''}
                                  onBlur={(e) => updateVariantCost(
                                    variant.id,
                                    parseFloat(e.target.value) || 0,
                                    variant.last_shipping_usd || 0
                                  )}
                                  className="w-20 border rounded px-2 py-1 text-xs"
                                  placeholder="0.00"
                                />
                              </td>
                              <td className="py-2">
                                <input
                                  type="number"
                                  step="0.01"
                                  defaultValue={variant.last_shipping_usd || ''}
                                  onBlur={(e) => updateVariantCost(
                                    variant.id,
                                    variant.last_cost_usd || 0,
                                    parseFloat(e.target.value) || 0
                                  )}
                                  className="w-20 border rounded px-2 py-1 text-xs"
                                  placeholder="0.00"
                                />
                              </td>
                              <td className="py-2">
                                <button
                                  onClick={() => deleteVariant(variant.id)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <i className="fas fa-times"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-sm text-gray-400">No variants yet</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
