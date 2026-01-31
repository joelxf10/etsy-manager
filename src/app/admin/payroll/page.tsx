'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { DollarSign, Users, Building, Download, Lock } from 'lucide-react'

export default function PayrollPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [teamFilter, setTeamFilter] = useState('')
  const [search, setSearch] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('users').select('*').order('team_name', { ascending: true })
      setEmployees(data || [])
      setLoading(false)
    }
    load()
  }, [supabase])

  const teams = [...new Set(employees.map(e => e.team_name).filter(Boolean))]
  
  const filtered = employees.filter(e => {
    if (teamFilter && e.team_name !== teamFilter) return false
    if (search && !e.name?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const totalPayroll = employees.reduce((sum, e) => sum + (e.base_salary || 0), 0)
  const teamTotals = teams.map(team => ({
    team,
    total: employees.filter(e => e.team_name === team).reduce((sum, e) => sum + (e.base_salary || 0), 0),
    count: employees.filter(e => e.team_name === team).length
  }))

  const formatPKR = (amount: number) => {
    return 'PKR ' + amount.toLocaleString()
  }

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Lock className="w-6 h-6 text-red-500" />
            Payroll Management
          </h1>
          <p className="text-gray-500">Admin & Finance access only</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Download className="w-5 h-5" />
          Export Payroll
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 opacity-80" />
            <span className="text-green-100">Total Monthly Payroll</span>
          </div>
          <div className="text-3xl font-bold">{formatPKR(totalPayroll)}</div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-blue-500" />
            <span className="text-gray-500">Total Employees</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{employees.length}</div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <Building className="w-6 h-6 text-purple-500" />
            <span className="text-gray-500">Teams</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{teams.length}</div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 text-orange-500" />
            <span className="text-gray-500">Avg Salary</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{formatPKR(Math.round(totalPayroll / employees.length))}</div>
        </div>
      </div>

      {/* Team Breakdown */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Team Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {teamTotals.map(t => (
            <div key={t.team} className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">{t.team}</div>
              <div className="text-xl font-bold text-gray-900">{formatPKR(t.total)}</div>
              <div className="text-xs text-gray-400">{t.count} employees</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <input 
            type="text" 
            placeholder="Search employees..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="flex-1 min-w-[200px] px-4 py-2 border rounded-lg" 
          />
          <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">All Teams</option>
            {teams.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Base Salary</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{emp.name}</div>
                    <div className="text-xs text-gray-500">{emp.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{emp.department || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      emp.team_name === 'ETSY' ? 'bg-orange-100 text-orange-700' :
                      emp.team_name === 'EBAY Boys' ? 'bg-blue-100 text-blue-700' :
                      emp.team_name === 'EBAY Girls' ? 'bg-pink-100 text-pink-700' :
                      emp.team_name === 'EBAY Management' ? 'bg-purple-100 text-purple-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {emp.team_name || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 capitalize">{emp.role}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{emp.joined_date || '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {emp.bank_name || '—'}
                    {emp.account_number && <div className="text-xs font-mono text-gray-400">{emp.account_number.slice(-4).padStart(emp.account_number.length, '•')}</div>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-gray-900">{formatPKR(emp.base_salary || 0)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={6} className="px-4 py-3 text-right font-medium text-gray-700">Total ({filtered.length} employees):</td>
                <td className="px-4 py-3 text-right font-bold text-green-600 text-lg">
                  {formatPKR(filtered.reduce((sum, e) => sum + (e.base_salary || 0), 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-700 flex items-center gap-2">
          <Lock className="w-4 h-4" />
          <strong>Confidential:</strong> This page contains sensitive payroll information. Access is restricted to Admin and Finance roles only. Do not share or screenshot.
        </p>
      </div>
    </div>
  )
}
