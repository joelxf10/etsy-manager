'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Users, Search, Edit, X, Download } from 'lucide-react'
import { downloadCSV } from '@/lib/csv'

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [editing, setEditing] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase.from('users').select('*').order('name')
    setEmployees(data || [])
    setLoading(false)
  }

  async function updateUser(id: string, updates: any) {
    await supabase.from('users').update(updates).eq('id', id)
    setEmployees(employees.map(e => e.id === id ? { ...e, ...updates } : e))
    setEditing(null)
  }

  const filtered = employees.filter(e => {
    if (platformFilter !== 'all' && e.platform !== platformFilter) return false
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8"><div><h1 className="text-2xl font-bold text-gray-900">Employees</h1><p className="text-gray-500">Manage team members</p></div><button onClick={() => downloadCSV('employees', ['Name','Email','Role','Platform','Team','Department','Salary','Joined','Active'], employees.map(e => [e.name, e.email, e.role, e.platform, e.team_name, e.department, e.base_salary, e.joined_date, e.is_active ? 'Yes' : 'No']))} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"><Download className="w-4 h-4" />Export CSV</button></div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{employees.length}</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm border"><p className="text-sm text-gray-500">Etsy</p><p className="text-2xl font-bold text-orange-500">{employees.filter(e => e.platform === 'etsy').length}</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm border"><p className="text-sm text-gray-500">eBay</p><p className="text-2xl font-bold text-blue-500">{employees.filter(e => e.platform === 'ebay').length}</p></div>
        <div className="bg-white rounded-xl p-4 shadow-sm border"><p className="text-sm text-gray-500">Admins</p><p className="text-2xl font-bold text-purple-500">{employees.filter(e => e.role === 'admin').length}</p></div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" /></div>
          <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)} className="px-4 py-2 border rounded-lg"><option value="all">All</option><option value="etsy">Etsy</option><option value="ebay">eBay</option><option value="both">Both</option></select>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Platform</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
          <tbody className="divide-y">{filtered.map(emp => (
            <tr key={emp.id} className="hover:bg-gray-50">
              <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">{emp.name[0]}</div><span className="text-sm font-medium text-gray-900">{emp.name}</span></div></td>
              <td className="px-6 py-4 text-sm text-gray-500">{emp.email}</td>
              <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${emp.platform === 'etsy' ? 'bg-orange-100 text-orange-700' : emp.platform === 'ebay' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{emp.platform}</span></td>
              <td className="px-6 py-4"><span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full capitalize">{emp.role}</span></td>
              <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${emp.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{emp.is_active ? 'Active' : 'Inactive'}</span></td>
              <td className="px-6 py-4"><button onClick={() => setEditing(emp)} className="text-blue-500 hover:text-blue-700"><Edit className="w-4 h-4" /></button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-bold">Edit {editing.name}</h2><button onClick={() => setEditing(null)}><X className="w-5 h-5" /></button></div>
            <div className="space-y-4">
              <select value={editing.platform} onChange={(e) => setEditing({ ...editing, platform: e.target.value })} className="w-full px-3 py-2 border rounded-lg"><option value="etsy">Etsy</option><option value="ebay">eBay</option><option value="both">Both</option></select>
              <select value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} className="w-full px-3 py-2 border rounded-lg"><option value="admin">Admin</option><option value="manager">Manager</option><option value="listing">Listing</option><option value="graphic">Graphic</option><option value="hunter">Hunter</option><option value="csr">CSR</option><option value="hr">HR</option></select>
              <div className="flex items-center gap-2"><input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} /><label className="text-sm">Active</label></div>
              <button onClick={() => updateUser(editing.id, { platform: editing.platform, role: editing.role, is_active: editing.is_active })} className="w-full py-2 bg-blue-500 text-white rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
