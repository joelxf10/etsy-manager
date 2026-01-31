'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface PNLRow {
  id: string
  order_number: string
  order_date: string
  store_name: string
  store_sku: string
  var_id: string
  qty: number
  price_item: number
  currency: string
  cost_usd: number
  shipping_usd: number
  sale_usd: number
  total_cost_usd: number
  etsy_fees_usd: number
  profit_usd: number
}

export default function FinancePage() {
  const [pnlData, setPnlData] = useState<PNLRow[]>([])
  const [fxRates, setFxRates] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('30d')

  useEffect(() => {
    loadData()
  }, [dateRange])

  const loadData = async () => {
    // Load FX rates
    const { data: ratesData } = await supabase.from('fx_rates').select('*')
    const rates: Record<string, number> = {}
    ratesData?.forEach(r => { rates[r.currency] = r.rate_to_usd })
    setFxRates(rates)

    // Load stores
    const { data: storesData } = await supabase.from('stores').select('id, name')
    const storeMap: Record<string, string> = {}
    storesData?.forEach(s => { storeMap[s.id] = s.name })

    // Load resolved orders
    let query = supabase
      .from('orders')
      .select('*')
      .eq('order_status', 'OK')
      .eq('resolve_status', 'OK')
      .order('order_date', { ascending: false })

    if (dateRange === '7d') {
      const date = new Date()
      date.setDate(date.getDate() - 7)
      query = query.gte('order_date', date.toISOString().split('T')[0])
    } else if (dateRange === '30d') {
      const date = new Date()
      date.setDate(date.getDate() - 30)
      query = query.gte('order_date', date.toISOString().split('T')[0])
    }

    const { data: ordersData } = await query

    if (ordersData) {
      const pnl = ordersData.map(order => {
        const fxRate = rates[order.currency] || 1
        const saleUsd = order.qty * order.price_item * fxRate
        const costUsd = order.resolved_cost_usd || 0
        const shippingUsd = order.resolved_shipping_usd || 0
        const totalCostUsd = order.qty * (costUsd + shippingUsd)
        const etsyFeesUsd = saleUsd * 0.12 // Approximate Etsy fees at 12%
        const profitUsd = saleUsd - totalCostUsd - etsyFeesUsd

        return {
          id: order.id,
          order_number: order.order_number,
          order_date: order.order_date,
          store_name: storeMap[order.store_id] || '-',
          store_sku: order.store_sku,
          var_id: order.resolved_var_id || '-',
          qty: order.qty,
          price_item: order.price_item,
          currency: order.currency,
          cost_usd: costUsd,
          shipping_usd: shippingUsd,
          sale_usd: saleUsd,
          total_cost_usd: totalCostUsd,
          etsy_fees_usd: etsyFeesUsd,
          profit_usd: profitUsd,
        }
      })
      setPnlData(pnl)
    }

    setLoading(false)
  }

  const totalRevenue = pnlData.reduce((sum, row) => sum + row.sale_usd, 0)
  const totalCost = pnlData.reduce((sum, row) => sum + row.total_cost_usd, 0)
  const totalFees = pnlData.reduce((sum, row) => sum + row.etsy_fees_usd, 0)
  const totalProfit = pnlData.reduce((sum, row) => sum + row.profit_usd, 0)
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>)}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Finance & PNL</h2>
          <p className="text-sm text-gray-500">{pnlData.length} resolved orders</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1 rounded-lg text-sm ${
                dateRange === range ? 'bg-emerald-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {range === '7d' && 'Last 7 Days'}
              {range === '30d' && 'Last 30 Days'}
              {range === 'all' && 'All Time'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6" data-tour="finance-summary">
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-800">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">Total COGS</p>
            <p className="text-2xl font-bold text-red-600">${totalCost.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">Etsy Fees (~12%)</p>
            <p className="text-2xl font-bold text-orange-600">${totalFees.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">Net Profit</p>
            <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              ${totalProfit.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border">
            <p className="text-sm text-gray-500">Profit Margin</p>
            <p className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {profitMargin.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* FX Rates */}
        <div className="bg-white rounded-xl border p-4 mb-6">
          <h3 className="font-semibold mb-3">Exchange Rates (to USD)</h3>
          <div className="flex gap-6">
            {Object.entries(fxRates).map(([currency, rate]) => (
              <div key={currency} className="text-sm">
                <span className="font-medium">{currency}:</span>{' '}
                <span className="text-gray-600">{rate.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* PNL Table */}
        <div className="bg-white rounded-xl border overflow-hidden" data-tour="finance-table">
          <div className="px-4 py-3 border-b">
            <h3 className="font-semibold">PNL Ledger</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b bg-gray-50">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Store</th>
                  <th className="px-4 py-3">VAR ID</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Sale (USD)</th>
                  <th className="px-4 py-3">Cost</th>
                  <th className="px-4 py-3">Shipping</th>
                  <th className="px-4 py-3">Fees</th>
                  <th className="px-4 py-3">Profit</th>
                </tr>
              </thead>
              <tbody>
                {pnlData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      No resolved orders found. Orders need both Order Status = OK and Resolve Status = OK.
                    </td>
                  </tr>
                ) : (
                  pnlData.map(row => (
                    <tr key={row.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono">#{row.order_number}</td>
                      <td className="px-4 py-3">{row.order_date}</td>
                      <td className="px-4 py-3">{row.store_name.split(' - ')[0]}</td>
                      <td className="px-4 py-3 font-mono text-xs text-emerald-600">{row.var_id}</td>
                      <td className="px-4 py-3">{row.qty}</td>
                      <td className="px-4 py-3">${row.sale_usd.toFixed(2)}</td>
                      <td className="px-4 py-3 text-red-600">${(row.cost_usd * row.qty).toFixed(2)}</td>
                      <td className="px-4 py-3 text-red-600">${(row.shipping_usd * row.qty).toFixed(2)}</td>
                      <td className="px-4 py-3 text-orange-600">${row.etsy_fees_usd.toFixed(2)}</td>
                      <td className={`px-4 py-3 font-semibold ${row.profit_usd >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        ${row.profit_usd.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
