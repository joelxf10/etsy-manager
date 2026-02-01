'use client'
import { useState } from 'react'
import { Truck, Calculator, Globe, Package, Download } from 'lucide-react'
import { downloadCSV } from '@/lib/csv'

// 4PX Standard rates (CNY converted to USD at 6.2)
const rates4PX: Record<string, { ranges: { min: number; max: number; feePerKg: number; regFee: number }[] }> = {
  US: {
    ranges: [
      { min: 0, max: 100, feePerKg: 85, regFee: 17.5 },
      { min: 101, max: 200, feePerKg: 80, regFee: 17.5 },
      { min: 201, max: 700, feePerKg: 80, regFee: 16 },
      { min: 701, max: 1000, feePerKg: 71, regFee: 9 },
      { min: 1001, max: 3000, feePerKg: 71, regFee: 9 },
    ]
  }
}

// Yunexpress rates (CNY converted to USD at 6.5)
const ratesYunexpress: { code: string; country: string; feePerKg: number; regFee: number; weightLimit: string }[] = [
  { code: 'GB', country: 'United Kingdom', feePerKg: 45, regFee: 16, weightLimit: '0-5kg' },
  { code: 'US', country: 'United States', feePerKg: 104, regFee: 24, weightLimit: '0-0.1kg' },
  { code: 'US', country: 'United States', feePerKg: 98, regFee: 22, weightLimit: '0.2-0.45kg' },
  { code: 'US', country: 'United States', feePerKg: 94, regFee: 20, weightLimit: '0.45-0.7kg' },
  { code: 'US', country: 'United States', feePerKg: 93, regFee: 13, weightLimit: '0.7-5kg' },
  { code: 'FR', country: 'France', feePerKg: 65, regFee: 23, weightLimit: '0-5kg' },
  { code: 'DE', country: 'Germany', feePerKg: 60, regFee: 22, weightLimit: '0-5kg' },
  { code: 'IT', country: 'Italy', feePerKg: 65, regFee: 25, weightLimit: '0-5kg' },
  { code: 'CA', country: 'Canada', feePerKg: 59, regFee: 23, weightLimit: '0-5kg' },
  { code: 'AU', country: 'Australia', feePerKg: 23, regFee: 27, weightLimit: '0-5kg Zone 1' },
  { code: 'AU', country: 'Australia', feePerKg: 23, regFee: 38, weightLimit: '0-5kg Zone 2' },
  { code: 'AU', country: 'Australia', feePerKg: 28, regFee: 76, weightLimit: '0-5kg Zone 3' },
  { code: 'AU', country: 'Australia', feePerKg: 35, regFee: 53, weightLimit: '0-0.5kg Zone 4' },
  { code: 'AU', country: 'Australia', feePerKg: 35, regFee: 95, weightLimit: '0.5-1kg Zone 4' },
  { code: 'AU', country: 'Australia', feePerKg: 43, regFee: 120, weightLimit: '1-3kg' },
]

const HANDLING_FEE = 1 // USD
const CNY_TO_USD_4PX = 6.2
const CNY_TO_USD_YUN = 6.5

function calc4PX(weightG: number, country: string): number | null {
  const countryRates = rates4PX[country]
  if (!countryRates) return null
  const range = countryRates.ranges.find(r => weightG >= r.min && weightG <= r.max)
  if (!range) return null
  const shipping = (range.feePerKg / 1000 * weightG + range.regFee) / CNY_TO_USD_4PX
  return shipping + HANDLING_FEE
}

function calcYunexpress(weightG: number, countryCode: string): { fee: number; limit: string }[] {
  const applicable = ratesYunexpress.filter(r => r.code === countryCode)
  return applicable.map(r => {
    const shipping = (r.feePerKg / 1000 * weightG + r.regFee) / CNY_TO_USD_YUN
    return { fee: shipping + HANDLING_FEE, limit: r.weightLimit }
  })
}

const countries = [
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
]

export default function ShippingCalculatorPage() {
  const [weight, setWeight] = useState<number>(180)
  const [country, setCountry] = useState('GB')
  const [history, setHistory] = useState<{ weight: number; country: string; provider: string; fee: string }[]>([])

  const fourPXResult = calc4PX(weight, country)
  const yunResults = calcYunexpress(weight, country)

  function addToHistory(provider: string, fee: string) {
    setHistory(prev => [{ weight, country, provider, fee }, ...prev].slice(0, 50))
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shipping Calculator</h1>
          <p className="text-gray-500">Estimate shipping costs via 4PX & Yunexpress</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={() => downloadCSV('shipping_calculations', ['Weight (g)', 'Country', 'Provider', 'Fee (USD)'], history.map(h => [h.weight, h.country, h.provider, h.fee]))}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
          >
            <Download className="w-4 h-4" />Export History
          </button>
        )}
      </div>

      {/* Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="w-5 h-5 text-orange-500" />
            <h2 className="font-semibold">Input</h2>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Weight (grams)</label>
            <input
              type="number"
              value={weight}
              onChange={e => setWeight(Number(e.target.value))}
              className="w-full px-4 py-3 border rounded-lg text-lg font-mono"
              min={1}
              max={5000}
            />
            <div className="flex gap-2 mt-2">
              {[100, 180, 250, 500, 750, 1000].map(w => (
                <button key={w} onClick={() => setWeight(w)} className={`px-3 py-1 text-xs rounded-full ${weight === w ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{w}g</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
            <select value={country} onChange={e => setCountry(e.target.value)} className="w-full px-4 py-3 border rounded-lg">
              {countries.map(c => (
                <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
        </div>

        {/* 4PX Results */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold">4PX Standard</h2>
            <span className="text-xs text-gray-400 ml-auto">Rate ÷ 6.2</span>
          </div>

          {fourPXResult !== null ? (
            <div className="text-center py-6">
              <p className="text-4xl font-bold text-blue-600">${fourPXResult.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-2">USD (incl. $1 handling)</p>
              <p className="text-xs text-gray-400 mt-1">{weight}g to {country}</p>
              <button
                onClick={() => addToHistory('4PX', fourPXResult.toFixed(2))}
                className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100"
              >Save to History</button>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">4PX rates only available for US</p>
              <p className="text-xs mt-1">Weight range: 0–3000g</p>
            </div>
          )}
        </div>

        {/* Yunexpress Results */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-5 h-5 text-purple-500" />
            <h2 className="font-semibold">Yunexpress</h2>
            <span className="text-xs text-gray-400 ml-auto">Rate ÷ 6.5</span>
          </div>

          {yunResults.length > 0 ? (
            <div className="space-y-3">
              {yunResults.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div>
                    <p className="text-lg font-bold text-purple-600">${r.fee.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{r.limit}</p>
                  </div>
                  <button
                    onClick={() => addToHistory(`Yunexpress (${r.limit})`, r.fee.toFixed(2))}
                    className="text-xs text-purple-600 hover:underline"
                  >Save</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">No Yunexpress rates for {country}</p>
            </div>
          )}
        </div>
      </div>

      {/* Full Rate Table */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            Yunexpress Full Rate Table
          </h2>
          <button
            onClick={() => downloadCSV('yunexpress_rates', ['Country','Code','Fee/kg (CNY)','Register Fee (CNY)','Weight Limit','Est. Cost 180g (USD)'], ratesYunexpress.map(r => [r.country, r.code, r.feePerKg, r.regFee, r.weightLimit, ((r.feePerKg / 1000 * 180 + r.regFee) / CNY_TO_USD_YUN + HANDLING_FEE).toFixed(2)]))}
            className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <Download className="w-3 h-3" />Export Rates
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee/kg (CNY)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Register Fee (CNY)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Handling (USD)</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight Limit</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Est. 180g (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ratesYunexpress.map((r, i) => {
                const est = (r.feePerKg / 1000 * 180 + r.regFee) / CNY_TO_USD_YUN + HANDLING_FEE
                return (
                  <tr key={i} className={`hover:bg-gray-50 ${r.code === country ? 'bg-purple-50' : ''}`}>
                    <td className="px-4 py-3 font-medium">{r.country}</td>
                    <td className="px-4 py-3">{r.code}</td>
                    <td className="px-4 py-3">{r.feePerKg}</td>
                    <td className="px-4 py-3">{r.regFee}</td>
                    <td className="px-4 py-3">${HANDLING_FEE}</td>
                    <td className="px-4 py-3 text-xs">{r.weightLimit}</td>
                    <td className="px-4 py-3 font-medium text-purple-600">${est.toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Calculation History */}
      {history.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Calculation History</h2>
            <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:underline">Clear</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">#</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Weight</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Country</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Provider</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Fee (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((h, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                    <td className="px-4 py-2">{h.weight}g</td>
                    <td className="px-4 py-2">{h.country}</td>
                    <td className="px-4 py-2">{h.provider}</td>
                    <td className="px-4 py-2 font-medium text-green-600">${h.fee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Formula Info */}
      <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
        <h3 className="font-medium text-blue-800 mb-2">How Shipping Costs Are Calculated</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• <strong>4PX:</strong> (Fee/kg ÷ 1000 × weight + Register Fee) ÷ 6.2 + $1 handling</p>
          <p>• <strong>Yunexpress:</strong> (Fee/kg ÷ 1000 × weight + Register Fee) ÷ 6.5 + $1 handling</p>
          <p>• Rates sourced from Zohaib shipping fee spreadsheet</p>
        </div>
      </div>
    </div>
  )
}
