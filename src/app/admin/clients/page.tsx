'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Users, Store, Package, DollarSign, ChevronDown, ChevronUp, Globe, BarChart3, Download } from 'lucide-react'
import { downloadCSV } from '@/lib/csv'
import { downloadCSV } from '@/lib/csv'

interface Client {
  name: string
  stores: any[]
  etsyStores: number
  ebayStores: number
  totalOrders: number
  totalRevenue: number
  countries: string[]
}

export default function ClientsPage() {
  const [stores, setStores] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedClient, setExpandedClient] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'name' | 'stores' | 'revenue'>('revenue')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: s } = await supabase.from('stores').select('*')
      const { data: o } = await supabase.from('orders_ledger').select('*').eq('order_status', 'OK')
      setStores(s || [])
      setOrders(o || [])
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clientsMap = new Map<string, Client>()
  
  stores.forEach(store => {
    const ownerName = store.owner || 'Unknown'
    if (!clientsMap.has(ownerName)) {
      clientsMap.set(ownerName, {
        name: ownerName,
        stores: [],
        etsyStores: 0,
        ebayStores: 0,
        totalOrders: 0,
        totalRevenue: 0,
        countries: []
      })
    }
    const client = clientsMap.get(ownerName)!
    client.stores.push(store)
    if (store.platform === 'etsy') client.etsyStores++
    if (store.platform === 'ebay') client.ebayStores++
    if (store.country && !client.countries.includes(store.country)) {
      client.countries.push(store.country)
    }
    const storeOrders = orders.filter(o => o.store_name === store.name)
    client.totalOrders += storeOrders.length
    client.totalRevenue += storeOrders.reduce((sum, o) => sum + ((o.price_item || 0) * (o.qty || 1)), 0)
  })

  const clients = Array.from(clientsMap.values())
  const sortedClients = [...clients].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name)
    if (sortBy === 'stores') return (b.etsyStores + b.ebayStores) - (a.etsyStores + a.ebayStores)
    return b.totalRevenue - a.totalRevenue
  })

  const totalClients = clients.length
  const totalStores = stores.length
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalRevenue, 0)
  const avgStoresPerClient = totalClients > 0 ? (totalStores / totalClients).toFixed(1) : '0'

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients Dashboard</h1>
          <p className="text-gray-500">Overview of store owners and their performance</p>
        </div>
        <button
          onClick={() => downloadCSV('clients', ['Client','Etsy Stores','eBay Stores','Orders','Revenue GBP','Countries'], sortedClients.map(c => [c.name, c.etsyStores, c.ebayStores, c.totalOrders, c.totalRevenue.toFixed(2), c.countries.join('; ')]))}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalClients}</h3>
          <p className="text-gray-500 text-sm">Total Clients</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
            <Store className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalStores}</h3>
          <p className="text-gray-500 text-sm">Total Stores</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{avgStoresPerClient}</h3>
          <p className="text-gray-500 text-sm">Avg Stores/Client</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">£{(totalRevenue/1000).toFixed(1)}k</h3>
          <p className="text-gray-500 text-sm">Total Revenue</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">All Clients ({totalClients})</h2>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-1.5 border rounded-lg text-sm">
            <option value="revenue">Sort by Revenue</option>
            <option value="stores">Sort by Stores</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        <div className="divide-y">
          {sortedClients.map((client) => (
            <div key={client.name}>
              <div 
                className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                onClick={() => setExpandedClient(expandedClient === client.name ? null : client.name)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {client.countries.join(', ') || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm font-bold text-orange-600">{client.etsyStores}</p>
                    <p className="text-xs text-gray-500">Etsy</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-blue-600">{client.ebayStores}</p>
                    <p className="text-xs text-gray-500">eBay</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">{client.totalOrders}</p>
                    <p className="text-xs text-gray-500">Orders</p>
                  </div>
                  <div className="text-center min-w-[80px]">
                    <p className="text-sm font-bold text-green-600">£{client.totalRevenue.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                  {expandedClient === client.name ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              {expandedClient === client.name && (
                <div className="bg-gray-50 px-4 py-3 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Stores ({client.stores.length})</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {client.stores.map(store => {
                      const storeOrders = orders.filter(o => o.store_name === store.name)
                      const storeRevenue = storeOrders.reduce((sum, o) => sum + ((o.price_item || 0) * (o.qty || 1)), 0)
                      return (
                        <div key={store.id} className="bg-white rounded-lg p-3 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded ${store.platform === 'etsy' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                              {store.platform}
                            </span>
                            <span className={`w-2 h-2 rounded-full ${store.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                          </div>
                          <p className="font-medium text-sm text-gray-900 truncate">{store.name}</p>
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <span>{store.country}</span>
                            <span>{storeOrders.length} orders</span>
                            <span className="text-green-600 font-medium">£{storeRevenue.toFixed(2)}</span>
                          </div>
                          {store.niche && <p className="text-xs text-gray-400 mt-1 truncate">{store.niche}</p>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
