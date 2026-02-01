'use client'
import { useState } from 'react'
import { Palette, AlertCircle } from 'lucide-react'

export default function EtsyGraphicsPage() {
  const [filter, setFilter] = useState('all')

  const queueItems = [
    { id: 1, sku: 'GD1-ADAMOVS02-0002', store: 'ADAM-OV-IT-S02', status: 'approved', gdStage: 'Approved', seoStage: 'Approved' },
    { id: 2, sku: 'GD1SHAMASPTNASEERS01-0001', store: 'SHAMAS-PT-NASEER-S01', status: 'listed', gdStage: 'Approved', seoStage: 'Approved' },
    { id: 3, sku: 'GD1-N-P1019', store: 'NEASHA-USA-S01', status: 'pending', gdStage: 'Pending', seoStage: 'Pending' },
    { id: 4, sku: 'GD1-JOEL-LS-0045', store: 'Joel-LS-UK-S03', status: 'approved', gdStage: 'Approved', seoStage: 'Pending' },
    { id: 5, sku: 'GD1-RAZA-UK-0012', store: 'RAZA-N-B-UK-S01', status: 'pending', gdStage: 'Pending', seoStage: 'Pending' },
  ]

  const filtered = filter === 'all' ? queueItems : queueItems.filter(i => i.status === filter)

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-2xl font-bold text-gray-900">Graphics Queue</h1><p className="text-gray-500">Track graphic design workflow</p></div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500" />
          <div><p className="text-blue-700 font-medium">Google Sheets Integration Coming Soon</p><p className="text-blue-600 text-sm">This will sync with your GD sheets</p></div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{queueItems.length}</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm border"><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold text-yellow-500">{queueItems.filter(i => i.status === 'pending').length}</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm border"><p className="text-sm text-gray-500">Approved</p><p className="text-2xl font-bold text-green-500">{queueItems.filter(i => i.status === 'approved').length}</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm border"><p className="text-sm text-gray-500">Listed</p><p className="text-2xl font-bold text-purple-500">{queueItems.filter(i => i.status === 'listed').length}</p></div>
      </div>
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'approved', 'listed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg capitalize ${filter === f ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border'}`}>{f}</button>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GD Stage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SEO Stage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-mono text-gray-900">{item.sku}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.store}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${item.gdStage === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.gdStage}</span></td>
                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${item.seoStage === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.seoStage}</span></td>
                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${item.status === 'listed' ? 'bg-purple-100 text-purple-700' : item.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
