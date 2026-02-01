'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Store, Search, Globe, CheckCircle, XCircle, X, Save, Trash2, ExternalLink } from 'lucide-react'

export default function EtsyStoresPage() {
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dpoFilter, setDpoFilter] = useState('')
  const [teamFilter, setTeamFilter] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const [selectedStore, setSelectedStore] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase.from('stores').select('*').eq('platform', 'etsy').order('name')
    setStores(data || [])
    setLoading(false)
  }

  async function saveStore() {
    if (!selectedStore) return
    setSaving(true)
    
    const { error } = await supabase
      .from('stores')
      .update({
        name: selectedStore.name,
        owner: selectedStore.owner,
        niche: selectedStore.niche,
        suggestion: selectedStore.suggestion,
        dpo_type: selectedStore.dpo_type,
        ab_group: selectedStore.ab_group,
        team: selectedStore.team,
        country: selectedStore.country,
        is_active: selectedStore.is_active,
        etsy_url: selectedStore.etsy_url,
        notes: selectedStore.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', selectedStore.id)
    
    if (!error) {
      setStores(stores.map(s => s.id === selectedStore.id ? selectedStore : s))
      setSelectedStore(null)
    }
    setSaving(false)
  }

  async function toggleActive(store: any, e: React.MouseEvent) {
    e.stopPropagation()
    const newStatus = !store.is_active
    await supabase.from('stores').update({ is_active: newStatus }).eq('id', store.id)
    setStores(stores.map(s => s.id === store.id ? { ...s, is_active: newStatus } : s))
  }

  const filtered = stores.filter(s => {
    const matchSearch = s.name?.toLowerCase().includes(search.toLowerCase()) || 
                       s.owner?.toLowerCase().includes(search.toLowerCase()) || 
                       s.niche?.toLowerCase().includes(search.toLowerCase())
    const matchDpo = !dpoFilter || s.dpo_type === dpoFilter
    const matchTeam = !teamFilter || s.team === teamFilter
    const matchGroup = !groupFilter || s.ab_group === groupFilter
    return matchSearch && matchDpo && matchTeam && matchGroup
  })

  const getTodayGroup = () => {
    const day = new Date().getDay()
    return (day === 0 || day === 2 || day === 4 || day === 6) ? 'A' : 'B'
  }

  const getDpoBadge = (dpo: string) => {
    if (dpo === '1 DPO') return 'bg-green-100 text-green-700'
    if (dpo === '14 DPO New') return 'bg-purple-100 text-purple-700'
    return 'bg-blue-100 text-blue-700'
  }

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Etsy Stores</h1>
          <p className="text-gray-500">{stores.filter(s => s.is_active).length} active of {stores.length} stores • Click a store to edit</p>
        </div>
        <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-medium">
          Today: Group {getTodayGroup()} ({new Date().toLocaleDateString('en-US', { weekday: 'short' })})
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search stores, owners, niches..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
          </div>
          <select value={dpoFilter} onChange={(e) => setDpoFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">All DPO Types</option>
            <option value="1 DPO">1 DPO</option>
            <option value="14 DPO OLD">14 DPO OLD</option>
            <option value="14 DPO New">14 DPO New</option>
          </select>
          <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">All Teams</option>
            <option value="GD - 01EG">GD - 01EG</option>
            <option value="GD - 02EG">GD - 02EG</option>
          </select>
          <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">All Groups</option>
            <option value="A">Group A</option>
            <option value="B">Group B</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stores.filter(s => s.dpo_type === '1 DPO').length}</div>
          <div className="text-sm text-gray-500">1 DPO Stores</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stores.filter(s => s.dpo_type === '14 DPO New').length}</div>
          <div className="text-sm text-gray-500">14 DPO New</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{stores.filter(s => s.ab_group === getTodayGroup() && s.is_active).length}</div>
          <div className="text-sm text-gray-500">Active Today (Group {getTodayGroup()})</div>
        </div>
        <div className="bg-white rounded-lg border p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stores.filter(s => !s.is_active).length}</div>
          <div className="text-sm text-gray-500">Inactive</div>
        </div>
      </div>

      {/* Store Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(store => (
          <div 
            key={store.id} 
            onClick={() => setSelectedStore({ ...store })}
            className={`bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition cursor-pointer ${store.ab_group === getTodayGroup() ? 'ring-2 ring-orange-300' : ''}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><Store className="w-5 h-5 text-orange-600" /></div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{store.name}</h3>
                  <p className="text-xs text-gray-500">{store.owner}</p>
                </div>
              </div>
              <button 
                onClick={(e) => toggleActive(store, e)}
                className="hover:scale-110 transition"
              >
                {store.is_active ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
              </button>
            </div>
            
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getDpoBadge(store.dpo_type)}`}>{store.dpo_type || '14 DPO OLD'}</span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${store.ab_group === 'A' ? 'bg-amber-100 text-amber-700' : 'bg-cyan-100 text-cyan-700'}`}>Group {store.ab_group || 'A'}</span>
              {store.team && <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">{store.team}</span>}
            </div>

            {/* Niche */}
            {store.niche && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">📦 {store.niche}</p>
            )}

            {/* Suggestion */}
            {store.suggestion && (
              <p className="text-xs text-orange-600 bg-orange-50 rounded p-2">💡 {store.suggestion}</p>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2 pt-2 border-t"><Globe className="w-3 h-3" />{store.country || 'UK'}</div>
          </div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">No stores match your filters</div>
      )}

      {/* Edit Modal */}
      {selectedStore && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Edit Store</h2>
                  <p className="text-sm text-gray-500">{selectedStore.name}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStore(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                  <input 
                    type="text" 
                    value={selectedStore.name || ''} 
                    onChange={(e) => setSelectedStore({ ...selectedStore, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                  <input 
                    type="text" 
                    value={selectedStore.owner || ''} 
                    onChange={(e) => setSelectedStore({ ...selectedStore, owner: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              {/* DPO, Group, Team */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">DPO Type</label>
                  <select 
                    value={selectedStore.dpo_type || ''} 
                    onChange={(e) => setSelectedStore({ ...selectedStore, dpo_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="1 DPO">1 DPO</option>
                    <option value="14 DPO New">14 DPO New</option>
                    <option value="14 DPO OLD">14 DPO OLD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">A/B Group</label>
                  <select 
                    value={selectedStore.ab_group || 'A'} 
                    onChange={(e) => setSelectedStore({ ...selectedStore, ab_group: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="A">Group A</option>
                    <option value="B">Group B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                  <select 
                    value={selectedStore.team || ''} 
                    onChange={(e) => setSelectedStore({ ...selectedStore, team: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="GD - 01EG">GD - 01EG</option>
                    <option value="GD - 02EG">GD - 02EG</option>
                  </select>
                </div>
              </div>

              {/* Country & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <select 
                    value={selectedStore.country || 'UK'} 
                    onChange={(e) => setSelectedStore({ ...selectedStore, country: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="UK">UK</option>
                    <option value="USA">USA</option>
                    <option value="Italy">Italy</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                    <option value="Australia">Australia</option>
                    <option value="Canada">Canada</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={selectedStore.is_active === true}
                        onChange={() => setSelectedStore({ ...selectedStore, is_active: true })}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={selectedStore.is_active === false}
                        onChange={() => setSelectedStore({ ...selectedStore, is_active: false })}
                        className="w-4 h-4 text-red-600"
                      />
                      <span className="text-sm text-gray-700">Inactive</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Niche */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niche / Products</label>
                <input 
                  type="text" 
                  value={selectedStore.niche || ''} 
                  onChange={(e) => setSelectedStore({ ...selectedStore, niche: e.target.value })}
                  placeholder="e.g., Lingerie, Wedding Dresses, Pokemon Cards..."
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Suggestion */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suggestion / Notes</label>
                <textarea 
                  value={selectedStore.suggestion || ''} 
                  onChange={(e) => setSelectedStore({ ...selectedStore, suggestion: e.target.value })}
                  placeholder="Any suggestions or things to research..."
                  rows={2}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Etsy URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Etsy Store URL</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={selectedStore.etsy_url || ''} 
                    onChange={(e) => setSelectedStore({ ...selectedStore, etsy_url: e.target.value })}
                    placeholder="https://www.etsy.com/shop/..."
                    className="flex-1 px-3 py-2 border rounded-lg"
                  />
                  {selectedStore.etsy_url && (
                    <a 
                      href={selectedStore.etsy_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Internal Notes</label>
                <textarea 
                  value={selectedStore.notes || ''} 
                  onChange={(e) => setSelectedStore({ ...selectedStore, notes: e.target.value })}
                  placeholder="Private notes about this store..."
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t sticky bottom-0 bg-white">
              <button 
                onClick={() => setSelectedStore(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={saveStore}
                disabled={saving}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
