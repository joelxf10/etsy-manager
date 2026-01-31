'use client'

import { useEffect, useState } from 'react'
import { createClient, Cost, CostCategory, Store } from '@/lib/supabase'
import { DollarSign, Plus, TrendingUp, Building, Store as StoreIcon, X, Calendar } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

export default function CostsPage() {
  const [costs, setCosts] = useState<Cost[]>([])
  const [categories, setCategories] = useState<CostCategory[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [newCost, setNewCost] = useState({
    category_id: '', store_id: '', platform: '', description: '',
    amount: '', currency: 'USD', is_recurring: false, recurrence_period: '', cost_date: new Date().toISOString().split('T')[0]
  })
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data: categoriesData } = await supabase.from('cost_categories').select('*').order('name')
    setCategories(categoriesData || [])

    const { data: storesData } = await supabase.from('stores').select('*').eq('is_active', true).order('name')
    setStores(storesData || [])

    const { data: costsData } = await supabase.from('costs').select('*, category:cost_categories(*), store:stores(*)')
      .order('cost_date', { ascending: false })
    setCosts(costsData || [])
    setLoading(false)
  }

  async function addCost() {
    if (!newCost.description || !newCost.amount) return
    const { error } = await supabase.from('costs').insert({
      category_id: newCost.category_id || null,
      store_id: newCost.store_id || null,
      platform: newCost.platform || null,
      description: newCost.description,
      amount: parseFloat(newCost.amount),
      currency: newCost.currency,
      is_recurring: newCost.is_recurring,
      recurrence_period: newCost.is_recurring ? newCost.recurrence_period : null,
      cost_date: newCost.cost_date
    })
    if (!error) {
      setShowAddModal(false)
      setNewCost({ category_id: '', store_id: '', platform: '', description: '', amount: '', currency: 'USD', is_recurring: false, recurrence_period: '', cost_date: new Date().toISOString().split('T')[0] })
      loadData()
    }
  }

  const companyWideCosts = costs.filter(c => !c.store_id && !c.platform)
  const perStoreCosts = costs.filter(c => c.store_id)
  const perPlatformCosts = costs.filter(c => c.platform && !c.store_id)

  const totalCompanyWide = companyWideCosts.reduce((sum, c) => sum + c.amount, 0)
  const totalPerStore = perStoreCosts.reduce((sum, c) => sum + c.amount, 0)
  const totalPerPlatform = perPlatformCosts.reduce((sum, c) => sum + c.amount, 0)
  const totalAll = totalCompanyWide + totalPerStore + totalPerPlatform

  const filteredCosts = filter === 'all' ? costs :
    filter === 'company' ? companyWideCosts :
    filter === 'store' ? perStoreCosts : perPlatformCosts

  if (loading) return <div className="flex min-h-screen"><Sidebar platform="etsy" /><div className="flex-1 p-8 flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div></div>

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar platform="etsy" />
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Costs Tracker</h1>
            <p className="text-gray-500">Track company-wide and per-store costs</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <Plus className="w-5 h-5" /> Add Cost
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm text-gray-500">Total Costs</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">${totalAll.toFixed(2)}</h3>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-500">Company-Wide</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">${totalCompanyWide.toFixed(2)}</h3>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <StoreIcon className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-sm text-gray-500">Per-Store</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">${totalPerStore.toFixed(2)}</h3>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm text-gray-500">Per-Platform</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">${totalPerPlatform.toFixed(2)}</h3>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[{ k: 'all', l: 'All Costs' }, { k: 'company', l: 'Company-Wide' }, { k: 'store', l: 'Per-Store' }, { k: 'platform', l: 'Per-Platform' }].map(f => (
            <button key={f.k} onClick={() => setFilter(f.k)}
              className={`px-4 py-2 rounded-lg ${filter === f.k ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {f.l}
            </button>
          ))}
        </div>

        {/* Costs Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store/Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recurring</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCosts.map(cost => (
                <tr key={cost.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500">{cost.cost_date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{cost.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{cost.category?.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{cost.store?.name || cost.platform || 'Company-wide'}</td>
                  <td className="px-6 py-4 text-sm">
                    {cost.is_recurring ? <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{cost.recurrence_period}</span> : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">${cost.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Cost Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Add Cost</h2>
                <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <input type="text" value={newCost.description} onChange={(e) => setNewCost({ ...newCost, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                  <input type="number" step="0.01" value={newCost.amount} onChange={(e) => setNewCost({ ...newCost, amount: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={newCost.cost_date} onChange={(e) => setNewCost({ ...newCost, cost_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={newCost.category_id} onChange={(e) => setNewCost({ ...newCost, category_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store (optional)</label>
                  <select value={newCost.store_id} onChange={(e) => setNewCost({ ...newCost, store_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg">
                    <option value="">Company-wide</option>
                    {stores.map(s => <option key={s.id} value={s.id}>{s.name} ({s.platform})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform (if not store-specific)</label>
                  <select value={newCost.platform} onChange={(e) => setNewCost({ ...newCost, platform: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg" disabled={!!newCost.store_id}>
                    <option value="">N/A</option>
                    <option value="etsy">Etsy</option>
                    <option value="ebay">eBay</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={newCost.is_recurring} onChange={(e) => setNewCost({ ...newCost, is_recurring: e.target.checked })}
                    className="w-4 h-4" />
                  <label className="text-sm text-gray-700">Recurring cost</label>
                </div>
                {newCost.is_recurring && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recurrence</label>
                    <select value={newCost.recurrence_period} onChange={(e) => setNewCost({ ...newCost, recurrence_period: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg">
                      <option value="">Select period</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                )}
                <button onClick={addCost} className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Add Cost
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
