'use client'

import { useEffect, useState } from 'react'
import { createClient, User } from '@/lib/supabase'
import { Users, Plus, Search, Edit, X, Shield } from 'lucide-react'
import Sidebar from '@/components/Sidebar'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const { data } = await supabase.from('users').select('*').order('name')
    setEmployees(data || [])
    setLoading(false)
  }

  async function updateUser(userId: string, updates: Partial<User>) {
    const { error } = await supabase.from('users').update(updates).eq('id', userId)
    if (!error) {
      setEmployees(employees.map(e => e.id === userId ? { ...e, ...updates } : e))
      setEditingUser(null)
    }
  }

  const filtered = employees.filter(e => {
    if (platformFilter !== 'all' && e.platform !== platformFilter) return false
    if (roleFilter !== 'all' && e.role !== roleFilter) return false
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      return e.name.toLowerCase().includes(s) || e.email.toLowerCase().includes(s)
    }
    return true
  })

  const counts = {
    total: employees.length,
    etsy: employees.filter(e => e.platform === 'etsy').length,
    ebay: employees.filter(e => e.platform === 'ebay').length,
    admin: employees.filter(e => e.role === 'admin').length,
  }

  if (loading) return <div className="flex min-h-screen"><Sidebar platform="etsy" /><div className="flex-1 p-8 flex justify-center items-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div></div>

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar platform="etsy" />
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
            <p className="text-gray-500">Manage team members and permissions</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900">{counts.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">Etsy Team</p>
            <p className="text-2xl font-bold text-orange-500">{counts.etsy}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">eBay Team</p>
            <p className="text-2xl font-bold text-blue-500">{counts.ebay}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border">
            <p className="text-sm text-gray-500">Admins</p>
            <p className="text-2xl font-bold text-purple-500">{counts.admin}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search employees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg" />
            </div>
            <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Platforms</option>
              <option value="etsy">Etsy</option>
              <option value="ebay">eBay</option>
              <option value="both">Both</option>
            </select>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="listing">Listing</option>
              <option value="graphic">Graphic</option>
              <option value="hunter">Hunter</option>
              <option value="csr">CSR</option>
              <option value="hr">HR</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">{emp.name[0]}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{emp.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{emp.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      emp.platform === 'etsy' ? 'bg-orange-100 text-orange-700' :
                      emp.platform === 'ebay' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>{emp.platform}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full capitalize">{emp.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${emp.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {emp.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => setEditingUser(emp)} className="text-blue-500 hover:text-blue-700">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Edit {editingUser.name}</h2>
                <button onClick={() => setEditingUser(null)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <select value={editingUser.platform} onChange={(e) => setEditingUser({ ...editingUser, platform: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg">
                    <option value="etsy">Etsy</option>
                    <option value="ebay">eBay</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select value={editingUser.role} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg">
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="finance">Finance</option>
                    <option value="listing">Listing</option>
                    <option value="graphic">Graphic</option>
                    <option value="hunter">Hunter</option>
                    <option value="csr">CSR</option>
                    <option value="hr">HR</option>
                    <option value="supplier">Supplier</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={editingUser.is_active} onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })} />
                  <label className="text-sm">Active</label>
                </div>
                <button onClick={() => updateUser(editingUser.id, { platform: editingUser.platform, role: editingUser.role, is_active: editingUser.is_active })}
                  className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
