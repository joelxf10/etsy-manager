'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Search, Download, FileSpreadsheet, BarChart3, Users, Store, Package, DollarSign, MessageSquare, Loader2, RefreshCw } from 'lucide-react'

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [stores, setStores] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState('overview')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: o } = await supabase.from('orders_ledger').select('*').order('order_date', { ascending: false })
      const { data: s } = await supabase.from('stores').select('*')
      const { data: e } = await supabase.from('users').select('*')
      const { data: exp } = await supabase.from('company_expenses').select('*').order('expense_date', { ascending: false })
      setOrders(o || [])
      setStores(s || [])
      setEmployees(e || [])
      setExpenses(exp || [])
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Calculate summary stats
  const etsyStores = stores.filter(s => s.platform === 'etsy')
  const ebayStores = stores.filter(s => s.platform === 'ebay')
  const activeEmployees = employees.filter(e => e.is_active)
  const etsyOrders = orders.filter(o => o.platform === 'ETSY')
  const okOrders = etsyOrders.filter(o => o.order_status === 'OK')
  const totalRevenue = okOrders.reduce((sum, o) => sum + ((o.price_item || 0) * (o.qty || 1)), 0)
  const totalSalaries = activeEmployees.reduce((sum, e) => sum + (e.base_salary || 0), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  // Pre-built report generators
  function generateReport(type: string) {
    let data: any[] = []
    let headers: string[] = []
    let filename = ''

    switch (type) {
      case 'orders':
        headers = ['Date', 'Order#', 'Store', 'SKU', 'Color', 'Size', 'Qty', 'Price', 'Status']
        data = orders.map(o => [
          o.order_date, o.order_number, o.store_name, o.store_sku,
          o.etsy_color, o.etsy_size, o.qty, o.price_item, o.order_status
        ])
        filename = 'orders_export'
        break
      case 'stores':
        headers = ['Name', 'Platform', 'Owner', 'Country', 'DPO Type', 'Niche', 'Team', 'A/B Group', 'Active']
        data = stores.map(s => [
          s.name, s.platform, s.owner, s.country, s.dpo_type,
          s.niche, s.team, s.ab_group, s.is_active ? 'Yes' : 'No'
        ])
        filename = 'stores_export'
        break
      case 'employees':
        headers = ['Name', 'Email', 'Role', 'Platform', 'Team', 'Department', 'Salary (PKR)', 'Joined', 'Active']
        data = employees.map(e => [
          e.name, e.email, e.role, e.platform, e.team_name,
          e.department, e.base_salary, e.joined_date, e.is_active ? 'Yes' : 'No'
        ])
        filename = 'employees_export'
        break
      case 'expenses':
        headers = ['Date', 'Category', 'Description', 'Amount (PKR)', 'Month']
        data = expenses.map(e => [
          e.expense_date, e.category, e.description, e.amount, e.month_year
        ])
        filename = 'expenses_export'
        break
      case 'revenue':
        const storeRevenue = stores.map(s => {
          const storeOrders = okOrders.filter(o => o.store_name === s.name)
          const rev = storeOrders.reduce((sum, o) => sum + ((o.price_item || 0) * (o.qty || 1)), 0)
          return [s.name, s.platform, s.country, storeOrders.length, rev]
        }).filter(r => r[4] > 0)
        headers = ['Store', 'Platform', 'Country', 'Orders', 'Revenue (GBP)']
        data = storeRevenue
        filename = 'revenue_by_store'
        break
    }

    return { headers, data, filename }
  }

  function downloadCSV(type: string) {
    const { headers, data, filename } = generateReport(type)
    const csv = [headers.join(','), ...data.map(row => row.map((cell: any) => 
      typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
    ).join(','))].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // AI Query Handler (simulated - in production would call OpenAI/Claude API)
  async function handleAiQuery() {
    if (!aiQuery.trim()) return
    setAiLoading(true)
    
    // Simulate AI processing - in production, call actual AI API
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const queryLower = aiQuery.toLowerCase()
    let response = ''
    
    if (queryLower.includes('revenue') || queryLower.includes('sales')) {
      response = `📊 **Revenue Summary**\n\n`
      response += `• Total Revenue: £${totalRevenue.toFixed(2)}\n`
      response += `• Total Orders: ${okOrders.length}\n`
      response += `• Average Order Value: £${okOrders.length > 0 ? (totalRevenue / okOrders.length).toFixed(2) : '0.00'}\n\n`
      
      const topStores = stores
        .map(s => ({ name: s.name, rev: okOrders.filter(o => o.store_name === s.name).reduce((sum, o) => sum + ((o.price_item || 0) * (o.qty || 1)), 0) }))
        .filter(s => s.rev > 0)
        .sort((a, b) => b.rev - a.rev)
        .slice(0, 5)
      
      response += `**Top 5 Stores:**\n`
      topStores.forEach((s, i) => response += `${i + 1}. ${s.name}: £${s.rev.toFixed(2)}\n`)
    }
    else if (queryLower.includes('employee') || queryLower.includes('staff') || queryLower.includes('team')) {
      response = `👥 **Employee Summary**\n\n`
      response += `• Total Active Employees: ${activeEmployees.length}\n`
      response += `• Total Monthly Salaries: ₨${totalSalaries.toLocaleString()}\n\n`
      
      const byTeam: Record<string, number> = {}
      activeEmployees.forEach(e => {
        const team = e.team_name || 'Unassigned'
        byTeam[team] = (byTeam[team] || 0) + 1
      })
      
      response += `**By Team:**\n`
      Object.entries(byTeam).sort((a, b) => b[1] - a[1]).forEach(([team, count]) => {
        response += `• ${team}: ${count} employees\n`
      })
    }
    else if (queryLower.includes('expense') || queryLower.includes('cost') || queryLower.includes('spending')) {
      response = `💰 **Expense Summary**\n\n`
      response += `• Total Expenses: ₨${totalExpenses.toLocaleString()}\n\n`
      
      const byCategory: Record<string, number> = {}
      expenses.forEach(e => {
        const cat = e.category || 'Other'
        byCategory[cat] = (byCategory[cat] || 0) + (e.amount || 0)
      })
      
      response += `**By Category:**\n`
      Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([cat, amount]) => {
        response += `• ${cat}: ₨${amount.toLocaleString()}\n`
      })
    }
    else if (queryLower.includes('store') || queryLower.includes('shop')) {
      response = `🏪 **Store Summary**\n\n`
      response += `• Total Etsy Stores: ${etsyStores.length} (${etsyStores.filter(s => s.is_active).length} active)\n`
      response += `• Total eBay Stores: ${ebayStores.length} (${ebayStores.filter(s => s.is_active).length} active)\n\n`
      
      const byCountry: Record<string, number> = {}
      stores.forEach(s => {
        const country = s.country || 'Unknown'
        byCountry[country] = (byCountry[country] || 0) + 1
      })
      
      response += `**By Country:**\n`
      Object.entries(byCountry).sort((a, b) => b[1] - a[1]).forEach(([country, count]) => {
        response += `• ${country}: ${count} stores\n`
      })
    }
    else {
      response = `I can help you analyze your business data. Try asking about:\n\n`
      response += `• **Revenue/Sales** - Get revenue breakdown and top stores\n`
      response += `• **Employees/Staff/Team** - Team breakdown and salaries\n`
      response += `• **Expenses/Costs** - Expense categories and totals\n`
      response += `• **Stores/Shops** - Store counts by platform and country\n`
    }
    
    setAiResponse(response)
    setAiLoading(false)
  }

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div></div>

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Reports</h1>
        <p className="text-gray-500">Query data, generate reports, and export to CSV</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stores.length}</p>
              <p className="text-xs text-gray-500">Total Stores</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeEmployees.length}</p>
              <p className="text-xs text-gray-500">Employees</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-xs text-gray-500">Total Orders</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">£{(totalRevenue/1000).toFixed(1)}k</p>
              <p className="text-xs text-gray-500">Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Query Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-5 h-5" />
          <h2 className="font-semibold">AI Data Assistant</h2>
        </div>
        <p className="text-blue-100 text-sm mb-4">Ask questions about your business data in plain English</p>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={aiQuery}
            onChange={(e) => setAiQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiQuery()}
            placeholder="e.g., Show me revenue by store, How many employees in each team?"
            className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
          <button
            onClick={handleAiQuery}
            disabled={aiLoading}
            className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50 flex items-center gap-2"
          >
            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Ask
          </button>
        </div>

        {aiResponse && (
          <div className="mt-4 p-4 bg-white/10 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm font-mono">{aiResponse}</pre>
          </div>
        )}
      </div>

      {/* Export Reports */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="p-4 border-b">
          <h2 className="font-semibold flex items-center gap-2">
            <Download className="w-4 h-4 text-gray-500" />
            Export Reports
          </h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button
              onClick={() => downloadCSV('orders')}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FileSpreadsheet className="w-8 h-8 text-green-600" />
              <span className="text-sm font-medium">Orders</span>
              <span className="text-xs text-gray-500">{orders.length} rows</span>
            </button>
            <button
              onClick={() => downloadCSV('stores')}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FileSpreadsheet className="w-8 h-8 text-orange-600" />
              <span className="text-sm font-medium">Stores</span>
              <span className="text-xs text-gray-500">{stores.length} rows</span>
            </button>
            <button
              onClick={() => downloadCSV('employees')}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FileSpreadsheet className="w-8 h-8 text-blue-600" />
              <span className="text-sm font-medium">Employees</span>
              <span className="text-xs text-gray-500">{employees.length} rows</span>
            </button>
            <button
              onClick={() => downloadCSV('expenses')}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FileSpreadsheet className="w-8 h-8 text-red-600" />
              <span className="text-sm font-medium">Expenses</span>
              <span className="text-xs text-gray-500">{expenses.length} rows</span>
            </button>
            <button
              onClick={() => downloadCSV('revenue')}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FileSpreadsheet className="w-8 h-8 text-purple-600" />
              <span className="text-sm font-medium">Revenue</span>
              <span className="text-xs text-gray-500">By store</span>
            </button>
          </div>
        </div>
      </div>

      {/* Data Preview */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-500" />
            Data Preview
          </h2>
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm"
          >
            <option value="overview">Overview Stats</option>
            <option value="orders">Recent Orders</option>
            <option value="stores">Store List</option>
            <option value="employees">Employee List</option>
            <option value="expenses">Recent Expenses</option>
          </select>
        </div>

        <div className="p-4">
          {selectedReport === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-3">Etsy Performance</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Active Stores:</span><span className="font-medium">{etsyStores.filter(s => s.is_active).length}</span></div>
                  <div className="flex justify-between"><span>Total Orders:</span><span className="font-medium">{etsyOrders.length}</span></div>
                  <div className="flex justify-between"><span>Completed:</span><span className="font-medium text-green-600">{okOrders.length}</span></div>
                  <div className="flex justify-between"><span>Revenue:</span><span className="font-medium text-green-600">£{totalRevenue.toFixed(2)}</span></div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-3">Team Overview</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Total Staff:</span><span className="font-medium">{activeEmployees.length}</span></div>
                  <div className="flex justify-between"><span>ETSY Team:</span><span className="font-medium">{activeEmployees.filter(e => e.team_name === 'ETSY').length}</span></div>
                  <div className="flex justify-between"><span>EBAY Team:</span><span className="font-medium">{activeEmployees.filter(e => e.team_name?.includes('EBAY')).length}</span></div>
                  <div className="flex justify-between"><span>Monthly Payroll:</span><span className="font-medium">₨{totalSalaries.toLocaleString()}</span></div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-700 mb-3">Expenses</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Total Entries:</span><span className="font-medium">{expenses.length}</span></div>
                  <div className="flex justify-between"><span>Total Amount:</span><span className="font-medium text-red-600">₨{totalExpenses.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Categories:</span><span className="font-medium">{[...new Set(expenses.map(e => e.category))].length}</span></div>
                </div>
              </div>
            </div>
          )}

          {selectedReport === 'orders' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Order #</th>
                    <th className="px-3 py-2 text-left">Store</th>
                    <th className="px-3 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-left">Price</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.slice(0, 10).map(o => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">{o.order_date}</td>
                      <td className="px-3 py-2 font-mono">{o.order_number}</td>
                      <td className="px-3 py-2 truncate max-w-[150px]">{o.store_name}</td>
                      <td className="px-3 py-2">{o.etsy_color} / {o.etsy_size}</td>
                      <td className="px-3 py-2">£{o.price_item}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${o.order_status === 'OK' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                          {o.order_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedReport === 'stores' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Platform</th>
                    <th className="px-3 py-2 text-left">Owner</th>
                    <th className="px-3 py-2 text-left">Country</th>
                    <th className="px-3 py-2 text-left">DPO</th>
                    <th className="px-3 py-2 text-left">Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {stores.slice(0, 10).map(s => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{s.name}</td>
                      <td className="px-3 py-2 capitalize">{s.platform}</td>
                      <td className="px-3 py-2">{s.owner}</td>
                      <td className="px-3 py-2">{s.country}</td>
                      <td className="px-3 py-2 text-xs">{s.dpo_type || '-'}</td>
                      <td className="px-3 py-2">{s.is_active ? '✓' : '✗'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedReport === 'employees' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Role</th>
                    <th className="px-3 py-2 text-left">Team</th>
                    <th className="px-3 py-2 text-left">Department</th>
                    <th className="px-3 py-2 text-left">Salary</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {employees.filter(e => e.is_active).slice(0, 10).map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{e.name}</td>
                      <td className="px-3 py-2 capitalize">{e.role}</td>
                      <td className="px-3 py-2">{e.team_name || '-'}</td>
                      <td className="px-3 py-2 text-xs">{e.department || '-'}</td>
                      <td className="px-3 py-2">₨{(e.base_salary || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedReport === 'expenses' && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-left">Description</th>
                    <th className="px-3 py-2 text-left">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {expenses.slice(0, 10).map(e => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">{e.expense_date}</td>
                      <td className="px-3 py-2">{e.category}</td>
                      <td className="px-3 py-2">{e.description}</td>
                      <td className="px-3 py-2 text-red-600">₨{(e.amount || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
