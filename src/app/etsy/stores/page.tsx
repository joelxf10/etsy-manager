'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Store, Search, Globe, CheckCircle, XCircle, Filter } from 'lucide-react'

export default function EtsyStoresPage() {
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dpoFilter, setDpoFilter] = useState('')
  const [teamFilter, setTeamFilter] = useState('')
  const [groupFilter, setGroupFilter] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('stores').select('*').eq('platform', 'etsy').order('name')
      setStores(data || [])
      setLoading(false)
    }
    load()
  }, [supabase])

  const filtered = stores.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.owner?.toLowerCase().includes(search.toLowerCase()) || s.niche?.toLowerCase().includes(search.toLowerCase())
    const matchDpo = !dpoFilter || s.dpo_type === dpoFilter
    const matchTeam = !teamFilter || s.team === teamFilter
    const matchGroup = !groupFilter || s.ab_group === groupFilter
    return matchSearch && matchDpo && matchTeam && matchGroup
  })

  // Get today's A/B group
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
          <p className="text-gray-500">{stores.filter(s => s.is_active).length} active of {stores.length} stores</p>
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
          <div key={store.id} className={`bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition ${store.ab_group === getTodayGroup() ? 'ring-2 ring-orange-300' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><Store className="w-5 h-5 text-orange-600" /></div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{store.name}</h3>
                  <p className="text-xs text-gray-500">{store.owner}</p>
                </div>
              </div>
              {store.is_active ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
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
    </div>
  )
}
