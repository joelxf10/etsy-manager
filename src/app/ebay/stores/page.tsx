'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Store, Search, Globe, CheckCircle, XCircle } from 'lucide-react'

export default function EbayStoresPage() {
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('stores').select('*').eq('platform', 'ebay').order('name')
      setStores(data || [])
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = stores.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.owner?.toLowerCase().includes(search.toLowerCase()))

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-2xl font-bold text-gray-900">eBay Stores</h1><p className="text-gray-500">{stores.filter(s => s.is_active).length} active stores</p></div>
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Search stores..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(store => (
          <div key={store.id} className="bg-white rounded-xl shadow-sm border p-4 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Store className="w-5 h-5 text-blue-600" /></div>
                <div><h3 className="font-semibold text-gray-900">{store.name}</h3><p className="text-sm text-gray-500">{store.owner}</p></div>
              </div>
              {store.is_active ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500"><Globe className="w-4 h-4" />{store.country || 'Unknown'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
