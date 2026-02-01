'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, ArrowRight, Download } from 'lucide-react'
import * as XLSX from 'xlsx'

interface ParsedOrder {
  sale_date: string
  item_name: string
  buyer: string
  quantity: number
  price: number
  item_total: number
  currency: string
  transaction_id: string
  listing_id: string
  order_id: string
  sku: string
  variations: string
  color?: string
  size?: string
  ship_name: string
  ship_address1: string
  ship_address2?: string
  ship_city: string
  ship_state: string
  ship_zipcode: string
  ship_country: string
  date_paid?: string
  date_shipped?: string
  coupon_code?: string
  discount_amount?: number
  // Matching info
  matched_store?: string
  matched_product?: string
  status: 'valid' | 'warning' | 'error'
  issues: string[]
}

export default function OrdersImportPage() {
  const [stores, setStores] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [existingOrders, setExistingOrders] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [parsedOrders, setParsedOrders] = useState<ParsedOrder[]>([])
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{ success: number; failed: number; skipped: number } | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [selectedStore, setSelectedStore] = useState<string>('')
  const supabase = createClient()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [])

  async function load() {
    const { data: s } = await supabase.from('stores').select('*').eq('platform', 'etsy')
    const { data: p } = await supabase.from('store_products').select('*')
    const { data: o } = await supabase.from('store_orders').select('order_number')
    
    setStores(s || [])
    setProducts(p || [])
    setExistingOrders(new Set((o || []).map((x: any) => x.order_number)))
    setLoading(false)
  }

  // Parse variations string like "Size:M,Colour:Pink" or "Size:M,Types:Full Set"
  function parseVariations(variations: string): { color?: string; size?: string } {
    const result: { color?: string; size?: string } = {}
    if (!variations) return result
    
    const parts = variations.split(',')
    for (const part of parts) {
      const [key, value] = part.split(':').map(s => s.trim())
      const keyLower = key?.toLowerCase()
      if (keyLower === 'size') result.size = value
      if (keyLower === 'colour' || keyLower === 'color' || keyLower === 'types' || keyLower === 'type' || keyLower === 'style') {
        result.color = value
      }
    }
    return result
  }

  // Parse date in various formats
  function parseDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString().split('T')[0]
    
    // Handle "01/15/26" format
    if (/^\d{2}\/\d{2}\/\d{2}$/.test(dateStr)) {
      const [month, day, year] = dateStr.split('/')
      return `20${year}-${month}-${day}`
    }
    
    // Handle "2026-12-01 00:00:00" format
    if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
      return dateStr.split(' ')[0]
    }
    
    // Handle "01/15/2026" format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      const [month, day, year] = dateStr.split('/')
      return `${year}-${month}-${day}`
    }
    
    // Try standard Date parsing
    try {
      const d = new Date(dateStr)
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0]
      }
    } catch {}
    
    return new Date().toISOString().split('T')[0]
  }

  // Match SKU to store and product
  function matchOrder(order: ParsedOrder): ParsedOrder {
    const issues: string[] = []
    let status: 'valid' | 'warning' | 'error' = 'valid'
    
    // Try to match store by SKU prefix or selected store
    let matchedStore: string | undefined
    let matchedProduct: string | undefined
    
    if (order.sku) {
      // SKU format like "UMERNBSS01-0001" - extract store code
      const skuPrefix = order.sku.split('-')[0]
      const store = stores.find(s => 
        s.name?.toUpperCase().includes(skuPrefix?.toUpperCase()) ||
        s.sku_prefix?.toUpperCase() === skuPrefix?.toUpperCase()
      )
      if (store) {
        matchedStore = store.name
      }
      
      // Try to match product
      const product = products.find(p => p.sku === order.sku)
      if (product) {
        matchedProduct = product.title?.substring(0, 50)
      }
    }
    
    // Use selected store if no match found
    if (!matchedStore && selectedStore) {
      matchedStore = selectedStore
      issues.push('Store assigned manually')
      status = 'warning'
    }
    
    if (!matchedStore) {
      issues.push('Could not match to a store')
      status = 'error'
    }
    
    // Check for duplicate
    if (existingOrders.has(order.order_id)) {
      issues.push('Order already exists')
      status = 'warning'
    }
    
    return {
      ...order,
      matched_store: matchedStore,
      matched_product: matchedProduct,
      status,
      issues
    }
  }

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json(sheet) as any[]
        
        const parsed: ParsedOrder[] = json.map(row => {
          const variations = parseVariations(row['Variations'] || '')
          
          const order: ParsedOrder = {
            sale_date: parseDate(row['Sale Date'] || ''),
            item_name: row['Item Name'] || '',
            buyer: row['Buyer'] || '',
            quantity: parseInt(row['Quantity']) || 1,
            price: parseFloat(row['Price']) || 0,
            item_total: parseFloat(row['Item Total']) || 0,
            currency: row['Currency'] || 'GBP',
            transaction_id: String(row['Transaction ID'] || ''),
            listing_id: String(row['Listing ID'] || ''),
            order_id: String(row['Order ID'] || ''),
            sku: row['SKU'] || '',
            variations: row['Variations'] || '',
            color: variations.color,
            size: variations.size,
            ship_name: row['Ship Name'] || '',
            ship_address1: row['Ship Address1'] || '',
            ship_address2: row['Ship Address2'] || undefined,
            ship_city: row['Ship City'] || '',
            ship_state: row['Ship State'] || '',
            ship_zipcode: String(row['Ship Zipcode'] || ''),
            ship_country: row['Ship Country'] || '',
            date_paid: row['Date Paid'] ? parseDate(row['Date Paid']) : undefined,
            date_shipped: row['Date Shipped'] ? parseDate(row['Date Shipped']) : undefined,
            coupon_code: row['Coupon Code'] || undefined,
            discount_amount: parseFloat(row['Discount Amount']) || undefined,
            status: 'valid',
            issues: []
          }
          
          return matchOrder(order)
        })
        
        setParsedOrders(parsed)
        setImportResult(null)
      } catch (err) {
        console.error('Parse error:', err)
        alert('Failed to parse file. Please ensure it is a valid Etsy export.')
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stores, products, selectedStore])

  async function importOrders() {
    setImporting(true)
    let success = 0
    let failed = 0
    let skipped = 0
    
    for (const order of parsedOrders) {
      // Skip duplicates and errors
      if (existingOrders.has(order.order_id)) {
        skipped++
        continue
      }
      
      if (order.status === 'error') {
        failed++
        continue
      }
      
      try {
        const { error } = await supabase.from('store_orders').insert({
          order_number: order.order_id,
          store_name: order.matched_store,
          sku: order.sku,
          color: order.color,
          size: order.size,
          quantity: order.quantity,
          buyer_name: order.ship_name,
          address: order.ship_address1 + (order.ship_address2 ? ', ' + order.ship_address2 : ''),
          city: order.ship_city,
          state: order.ship_state,
          postcode: order.ship_zipcode,
          country: order.ship_country,
          order_date: order.sale_date,
          product_cost: order.item_total,
          status: order.date_shipped ? 'SHIPPED' : 'PREPARE',
          etsy_transaction_id: order.transaction_id,
          etsy_listing_id: order.listing_id,
          currency: order.currency,
          created_at: new Date().toISOString()
        })
        
        if (error) {
          console.error('Insert error:', error)
          failed++
        } else {
          success++
          existingOrders.add(order.order_id)
        }
      } catch (err) {
        console.error('Import error:', err)
        failed++
      }
    }
    
    setImportResult({ success, failed, skipped })
    setImporting(false)
    
    // Refresh existing orders
    const { data: o } = await supabase.from('store_orders').select('order_number')
    setExistingOrders(new Set((o || []).map((x: any) => x.order_number)))
  }

  function clearData() {
    setParsedOrders([])
    setImportResult(null)
  }

  // Re-match when store selection changes
  useEffect(() => {
    if (parsedOrders.length > 0) {
      setParsedOrders(parsedOrders.map(o => matchOrder(o)))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStore])

  const validCount = parsedOrders.filter(o => o.status === 'valid').length
  const warningCount = parsedOrders.filter(o => o.status === 'warning').length
  const errorCount = parsedOrders.filter(o => o.status === 'error').length
  const duplicateCount = parsedOrders.filter(o => existingOrders.has(o.order_id)).length

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Import Orders</h1>
        <p className="text-gray-500">Upload Etsy Sold Orders export (.xlsx or .csv)</p>
      </div>

      {/* Store Selection */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Default Store (for orders that can't be matched by SKU)
        </label>
        <select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border rounded-lg"
        >
          <option value="">-- Auto-detect from SKU --</option>
          {stores.map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Upload Zone */}
      {parsedOrders.length === 0 ? (
        <div 
          className={`bg-white rounded-xl shadow-sm border-2 border-dashed p-12 text-center transition-colors ${
            dragActive ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className={`w-16 h-16 mx-auto mb-4 ${dragActive ? 'text-orange-500' : 'text-gray-400'}`} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Drop your Etsy export file here</h3>
          <p className="text-gray-500 mb-4">or click to browse</p>
          
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 cursor-pointer"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Choose File
          </label>
          
          <div className="mt-6 text-sm text-gray-400">
            <p>Supported: Etsy Sold Orders export (.xlsx)</p>
            <p>Go to Etsy → Shop Manager → Settings → Options → Download Data → Sold Order Items</p>
          </div>
        </div>
      ) : (
        <>
          {/* Summary Bar */}
          <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{parsedOrders.length}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{validCount}</p>
                  <p className="text-xs text-gray-500">Ready</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
                  <p className="text-xs text-gray-500">Warnings</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{errorCount}</p>
                  <p className="text-xs text-gray-500">Errors</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{duplicateCount}</p>
                  <p className="text-xs text-gray-500">Duplicates</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={clearData}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Clear
                </button>
                <button
                  onClick={importOrders}
                  disabled={importing || validCount + warningCount === 0}
                  className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {importing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-5 h-5" />
                      Import {validCount + warningCount - duplicateCount} Orders
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Import Result */}
          {importResult && (
            <div className={`rounded-xl p-4 mb-6 ${
              importResult.failed > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
            }`}>
              <div className="flex items-center gap-3">
                <CheckCircle className={`w-6 h-6 ${importResult.failed > 0 ? 'text-yellow-500' : 'text-green-500'}`} />
                <div>
                  <p className="font-medium text-gray-900">Import Complete</p>
                  <p className="text-sm text-gray-600">
                    {importResult.success} imported • {importResult.skipped} skipped (duplicates) • {importResult.failed} failed
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preview Table */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variation</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ship To</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {parsedOrders.map((order, idx) => {
                    const isDuplicate = existingOrders.has(order.order_id)
                    
                    return (
                      <tr key={idx} className={`${
                        isDuplicate ? 'bg-blue-50 opacity-60' :
                        order.status === 'error' ? 'bg-red-50' :
                        order.status === 'warning' ? 'bg-yellow-50' : ''
                      }`}>
                        <td className="px-4 py-3">
                          {isDuplicate ? (
                            <span className="flex items-center gap-1 text-blue-600">
                              <AlertCircle className="w-4 h-4" /> Exists
                            </span>
                          ) : order.status === 'valid' ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" /> OK
                            </span>
                          ) : order.status === 'warning' ? (
                            <span className="flex items-center gap-1 text-yellow-600">
                              <AlertCircle className="w-4 h-4" /> Warn
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600">
                              <X className="w-4 h-4" /> Error
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono">{order.order_id}</td>
                        <td className="px-4 py-3">{order.sale_date}</td>
                        <td className="px-4 py-3">
                          {order.matched_store ? (
                            <span className="px-2 py-1 bg-gray-100 rounded text-xs">{order.matched_store}</span>
                          ) : (
                            <span className="text-red-500">No match</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{order.sku}</td>
                        <td className="px-4 py-3">
                          {order.color && <span className="block">{order.color}</span>}
                          {order.size && <span className="text-gray-500">{order.size}</span>}
                        </td>
                        <td className="px-4 py-3">{order.quantity}</td>
                        <td className="px-4 py-3">
                          {order.currency === 'GBP' ? '£' : '$'}{order.item_total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="block">{order.ship_name}</span>
                          <span className="text-xs text-gray-500">{order.ship_city}, {order.ship_country}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {order.issues.map((issue, i) => (
                            <span key={i} className="block">{issue}</span>
                          ))}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
