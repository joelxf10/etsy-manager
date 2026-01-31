'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Receipt, TrendingUp, Calendar, Filter } from 'lucide-react'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [monthFilter, setMonthFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('company_expenses').select('*').order('expense_date', { ascending: false })
      setExpenses(data || [])
      setLoading(false)
    }
    load()
  }, [supabase])

  const months = [...new Set(expenses.map(e => e.month_year).filter(Boolean))].sort().reverse()
  const categories = [...new Set(expenses.map(e => e.category).filter(Boolean))].sort()
  
  const filtered = expenses.filter(e => {
    if (monthFilter && e.month_year !== monthFilter) return false
    if (categoryFilter && e.category !== categoryFilter) return false
    return true
  })

  const totalFiltered = filtered.reduce((sum, e) => sum + (e.amount || 0), 0)
  
  // Category breakdown for filtered data
  const categoryTotals = categories.map(cat => ({
    category: cat,
    total: filtered.filter(e => e.category === cat).reduce((sum, e) => sum + (e.amount || 0), 0),
    count: filtered.filter(e => e.category === cat).length
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

  const formatPKR = (amount: number) => {
    return 'PKR ' + amount.toLocaleString()
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Kitchen': 'bg-yellow-100 text-yellow-700',
      'Bills': 'bg-blue-100 text-blue-700',
      'Rent': 'bg-purple-100 text-purple-700',
      'Utilities': 'bg-green-100 text-green-700',
      'Internet': 'bg-cyan-100 text-cyan-700',
      'Committee': 'bg-red-100 text-red-700',
      'PFF': 'bg-orange-100 text-orange-700',
      'IT': 'bg-indigo-100 text-indigo-700',
      'Transport': 'bg-teal-100 text-teal-700',
      'Daily Expense': 'bg-gray-100 text-gray-700',
      'Medical': 'bg-pink-100 text-pink-700'
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="p-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Expenses</h1>
          <p className="text-gray-500">Track and manage company spending</p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Receipt className="w-8 h-8 opacity-80" />
            <span className="text-red-100">Total Expenses (Filtered)</span>
          </div>
          <div className="text-3xl font-bold">{formatPKR(totalFiltered)}</div>
          <div className="text-red-200 text-sm mt-1">{filtered.length} transactions</div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            <span className="text-gray-500">Months Tracked</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{months.length}</div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <span className="text-gray-500">Categories</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{categories.length}</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Category Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categoryTotals.map(c => (
            <div key={c.category} className={`rounded-lg p-3 ${getCategoryColor(c.category)}`}>
              <div className="text-xs font-medium opacity-80">{c.category}</div>
              <div className="text-lg font-bold">{formatPKR(c.total)}</div>
              <div className="text-xs opacity-60">{c.count} items</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <Filter className="w-5 h-5 text-gray-400" />
          <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">All Months</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {(monthFilter || categoryFilter) && (
            <button onClick={() => { setMonthFilter(''); setCategoryFilter(''); }} className="text-sm text-orange-600 hover:underline">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(expense => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{expense.expense_date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(expense.category)}`}>
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{expense.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{expense.month_year}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{formatPKR(expense.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right font-medium text-gray-700">Total:</td>
                <td className="px-4 py-3 text-right font-bold text-red-600 text-lg">{formatPKR(totalFiltered)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">No expenses found for selected filters</div>
      )}
    </div>
  )
}
