'use client'

import { useEffect, useState } from 'react'
import { createClient, Store, Screenshot } from '@/lib/supabase'
import { Camera, Upload, CheckCircle, AlertCircle, Calendar, X } from 'lucide-react'

export default function EbayScreenshotsPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [screenshots, setScreenshots] = useState<Screenshot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadData, setUploadData] = useState({
    store_id: '',
    active_listings: '',
    total_sales: '',
    orders_count: '',
    notes: ''
  })
  const supabase = createClient()

  useEffect(() => { loadData() }, [selectedDate])

  async function loadData() {
    const { data: storesData } = await supabase
      .from('stores').select('*').eq('platform', 'ebay').eq('is_active', true).order('name')
    setStores(storesData || [])

    const { data: screenshotsData } = await supabase
      .from('screenshots').select('*, store:stores(*)').eq('screenshot_date', selectedDate)
    setScreenshots(screenshotsData || [])
    setLoading(false)
  }

  async function submitScreenshot() {
    if (!uploadData.store_id) return

    const { data: { session } } = await supabase.auth.getSession()
    const { data: user } = await supabase
      .from('users').select('id').eq('email', session?.user?.email).single()

    const { error } = await supabase.from('screenshots').insert({
      store_id: uploadData.store_id,
      uploaded_by: user?.id,
      image_url: 'placeholder', // In real app, upload to storage first
      screenshot_date: selectedDate,
      active_listings: parseInt(uploadData.active_listings) || null,
      total_sales: parseFloat(uploadData.total_sales) || null,
      orders_count: parseInt(uploadData.orders_count) || null,
      notes: uploadData.notes
    })

    if (!error) {
      setShowUploadModal(false)
      setUploadData({ store_id: '', active_listings: '', total_sales: '', orders_count: '', notes: '' })
      loadData()
    }
  }

  const uploadedStoreIds = new Set(screenshots.map(s => s.store_id))
  const missingStores = stores.filter(s => !uploadedStoreIds.has(s.id))
  const completedStores = stores.filter(s => uploadedStoreIds.has(s.id))

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Daily Screenshots</h1>
          <p className="text-gray-500">Track store performance with daily screenshots</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border rounded-lg" />
          </div>
          <button onClick={() => setShowUploadModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            <Upload className="w-5 h-5" /> Upload Screenshot
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Progress for {selectedDate}</h2>
          <span className="text-sm text-gray-500">{completedStores.length} / {stores.length} stores</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-blue-500 h-3 rounded-full transition-all" 
            style={{ width: `${stores.length > 0 ? (completedStores.length / stores.length) * 100 : 0}%` }} />
        </div>
        {missingStores.length > 0 && (
          <p className="text-red-500 text-sm mt-2">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            {missingStores.length} stores missing screenshots
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Missing Screenshots */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h2 className="font-semibold">Missing ({missingStores.length})</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {missingStores.length > 0 ? (
              <div className="divide-y">
                {missingStores.map(store => (
                  <div key={store.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{store.name}</p>
                      <p className="text-sm text-gray-500">{store.owner} • {store.country}</p>
                    </div>
                    <button onClick={() => { setUploadData({ ...uploadData, store_id: store.id }); setShowUploadModal(true); }}
                      className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm">
                      Upload
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-green-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                <p>All stores completed!</p>
              </div>
            )}
          </div>
        </div>

        {/* Completed Screenshots */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-4 border-b flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold">Completed ({completedStores.length})</h2>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {screenshots.length > 0 ? (
              <div className="divide-y">
                {screenshots.map(ss => (
                  <div key={ss.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">{ss.store?.name}</p>
                      <span className="text-xs text-gray-500">{new Date(ss.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-500">Listings</p>
                        <p className="font-medium">{ss.active_listings || '-'}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-500">Sales</p>
                        <p className="font-medium">${ss.total_sales || 0}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded">
                        <p className="text-gray-500">Orders</p>
                        <p className="font-medium">{ss.orders_count || '-'}</p>
                      </div>
                    </div>
                    {ss.notes && <p className="text-sm text-gray-500 mt-2">{ss.notes}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <Camera className="w-12 h-12 mx-auto mb-2" />
                <p>No screenshots yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Upload Screenshot Data</h2>
              <button onClick={() => setShowUploadModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store *</label>
                <select value={uploadData.store_id} onChange={(e) => setUploadData({ ...uploadData, store_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Select store</option>
                  {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Active Listings</label>
                <input type="number" value={uploadData.active_listings} onChange={(e) => setUploadData({ ...uploadData, active_listings: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Sales ($)</label>
                <input type="number" step="0.01" value={uploadData.total_sales} onChange={(e) => setUploadData({ ...uploadData, total_sales: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orders Count</label>
                <input type="number" value={uploadData.orders_count} onChange={(e) => setUploadData({ ...uploadData, orders_count: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={uploadData.notes} onChange={(e) => setUploadData({ ...uploadData, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg" rows={2} />
              </div>
              <button onClick={submitScreenshot} className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
