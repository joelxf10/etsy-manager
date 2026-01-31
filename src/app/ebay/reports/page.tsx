'use client'

import { useState } from 'react'
import { FileText, AlertCircle, ExternalLink, Users, Package, Target } from 'lucide-react'

export default function EbayReportsPage() {
  const [dateRange, setDateRange] = useState('today')

  const ordersReports = [
    { user: 'Abdul Samad', account: 'PAUL', processed: 12, leftLoss: 2, roi: '85%', date: 'Today' },
    { user: 'Shaiza Shah', account: 'AYESHA', processed: 8, leftLoss: 1, roi: '92%', date: 'Today' },
    { user: 'Muhammad Mujtaba', account: 'JEREMY', processed: 15, leftLoss: 0, roi: '100%', date: 'Today' },
  ]

  const listingReports = [
    { user: 'Amna Siddique', account: 'KASHIF-3', targetSale: 500, saleGenerated: 420, activeListings: 145, date: 'Today' },
    { user: 'Syed Shahzaib', account: 'TARIQ', targetSale: 400, saleGenerated: 380, activeListings: 120, date: 'Today' },
  ]

  const huntingReports = [
    { user: 'Abdul Ahad', hunted: 50, shortlisted: 20, sentToListing: 15, approved: 12, date: 'Today' },
  ]

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Reports</h1>
          <p className="text-gray-500">Daily reports from Discord bot</p>
        </div>
        <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-4 py-2 border rounded-lg">
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="week">This Week</option>
        </select>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-blue-700 font-medium">Google Sheets Integration</p>
            <p className="text-blue-600 text-sm">Data syncs from your Ops Reporting sheet</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold">Orders Team</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">{ordersReports.length}</p>
          <p className="text-sm text-gray-500">Reports submitted</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold">Listing Team</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{listingReports.length}</p>
          <p className="text-sm text-gray-500">Reports submitted</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold">Hunting Team</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">{huntingReports.length}</p>
          <p className="text-sm text-gray-500">Reports submitted</p>
        </div>
      </div>

      {/* Orders Reports */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="p-4 border-b bg-purple-50">
          <h2 className="font-semibold text-purple-900">Orders Team Reports</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processed</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Left/Loss</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROI</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {ordersReports.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{r.user}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{r.account}</td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">{r.processed}</td>
                <td className="px-4 py-3 text-sm text-red-500">{r.leftLoss}</td>
                <td className="px-4 py-3 text-sm font-medium">{r.roi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Listing Reports */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="p-4 border-b bg-green-50">
          <h2 className="font-semibold text-green-900">Listing Team Reports</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Generated</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Listings</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {listingReports.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{r.user}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{r.account}</td>
                <td className="px-4 py-3 text-sm">${r.targetSale}</td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">${r.saleGenerated}</td>
                <td className="px-4 py-3 text-sm">{r.activeListings}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hunting Reports */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b bg-orange-50">
          <h2 className="font-semibold text-orange-900">Hunting Team Reports</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hunted</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Shortlisted</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {huntingReports.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{r.user}</td>
                <td className="px-4 py-3 text-sm">{r.hunted}</td>
                <td className="px-4 py-3 text-sm">{r.shortlisted}</td>
                <td className="px-4 py-3 text-sm">{r.sentToListing}</td>
                <td className="px-4 py-3 text-sm font-medium text-green-600">{r.approved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
