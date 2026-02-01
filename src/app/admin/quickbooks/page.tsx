'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Link2, CheckCircle, XCircle, RefreshCw, DollarSign, FileText, ArrowRight, Settings, AlertTriangle } from 'lucide-react'

export default function QuickBooksPage() {
  const [connected, setConnected] = useState(false)
  const [loading, setLoading] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<any>(null)
  const supabase = createClient()

  // QuickBooks OAuth credentials (from your setup)
  const QB_CLIENT_ID = 'AB3okThApzM0DIbMCuEasKrE2uhOcmM8Iz0l45l8P8mKSJ2j2I'
  const QB_REDIRECT_URI = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/quickbooks/callback`
    : 'http://localhost:3000/api/quickbooks/callback'

  useEffect(() => {
    checkConnection()
  }, [])

  async function checkConnection() {
    // Check if we have a stored QB connection
    const { data } = await supabase
      .from('integrations')
      .select('*')
      .eq('type', 'quickbooks')
      .single()
    
    if (data && data.access_token) {
      setConnected(true)
      setCompanyName(data.company_name)
      setLastSync(data.last_sync)
    }
  }

  function connectQuickBooks() {
    // Build OAuth URL
    const scope = 'com.intuit.quickbooks.accounting'
    const state = Math.random().toString(36).substring(7)
    
    // Store state for verification
    localStorage.setItem('qb_state', state)
    
    const authUrl = `https://appcenter.intuit.com/connect/oauth2?` +
      `client_id=${QB_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(QB_REDIRECT_URI)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(scope)}` +
      `&state=${state}`
    
    window.location.href = authUrl
  }

  async function disconnectQuickBooks() {
    if (!confirm('Are you sure you want to disconnect QuickBooks?')) return
    
    setLoading(true)
    await supabase
      .from('integrations')
      .delete()
      .eq('type', 'quickbooks')
    
    setConnected(false)
    setCompanyName(null)
    setLastSync(null)
    setLoading(false)
  }

  async function syncNow() {
    setLoading(true)
    setSyncStatus({ status: 'syncing', message: 'Syncing orders to QuickBooks...' })
    
    try {
      const response = await fetch('/api/quickbooks/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSyncStatus({ 
          status: 'success', 
          message: `Synced ${result.invoicesCreated} invoices, ${result.expensesSynced} expenses` 
        })
        setLastSync(new Date().toISOString())
      } else {
        setSyncStatus({ status: 'error', message: result.error })
      }
    } catch (error) {
      setSyncStatus({ status: 'error', message: 'Sync failed. Please try again.' })
    }
    
    setLoading(false)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">QuickBooks Integration</h1>
        <p className="text-gray-500">Connect your QuickBooks account to sync orders and expenses</p>
      </div>

      {/* Connection Status Card */}
      <div className={`rounded-xl p-6 mb-6 ${connected ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50 border-2 border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${connected ? 'bg-green-100' : 'bg-gray-200'}`}>
              <img src="https://www.vectorlogo.zone/logos/intikibooks/intikibooks-icon.svg" alt="QuickBooks" className="w-10 h-10" onError={(e) => { e.currentTarget.style.display = 'none' }} />
              <DollarSign className={`w-8 h-8 ${connected ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">QuickBooks Online</h2>
              {connected ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Connected to {companyName || 'Your Company'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <XCircle className="w-5 h-5" />
                  <span>Not connected</span>
                </div>
              )}
            </div>
          </div>
          
          {connected ? (
            <div className="flex gap-3">
              <button 
                onClick={syncNow} 
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Sync Now
              </button>
              <button 
                onClick={disconnectQuickBooks}
                className="px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button 
              onClick={connectQuickBooks}
              className="flex items-center gap-2 px-6 py-3 bg-[#2CA01C] text-white rounded-lg hover:bg-[#248817] font-medium"
            >
              <Link2 className="w-5 h-5" />
              Connect to QuickBooks
            </button>
          )}
        </div>
        
        {lastSync && (
          <p className="text-sm text-gray-500 mt-4">Last synced: {new Date(lastSync).toLocaleString()}</p>
        )}
      </div>

      {/* Sync Status */}
      {syncStatus && (
        <div className={`rounded-lg p-4 mb-6 ${
          syncStatus.status === 'success' ? 'bg-green-100 text-green-700' :
          syncStatus.status === 'error' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          <p className="font-medium">{syncStatus.message}</p>
        </div>
      )}

      {/* What Gets Synced */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Orders → Invoices</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Automatically create QuickBooks invoices from your Etsy and eBay orders.
          </p>
          <ul className="text-sm text-gray-500 space-y-2">
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Order details & line items</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Customer information</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Multi-currency support (GBP, USD, EUR)</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Platform fees tracked</li>
          </ul>
        </div>
        
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Expenses → Bills</h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Sync company expenses from your ledger to QuickBooks as bills.
          </p>
          <ul className="text-sm text-gray-500 space-y-2">
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Kitchen & office expenses</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Utilities & bills</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Rent & subscriptions</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Categorized for tax</li>
          </ul>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-5 h-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Sync Configuration</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sync Frequency</label>
            <select className="w-full px-4 py-2 border rounded-lg" disabled={!connected}>
              <option value="manual">Manual only</option>
              <option value="daily">Daily (recommended)</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Income Account</label>
            <select className="w-full px-4 py-2 border rounded-lg" disabled={!connected}>
              <option value="sales">Sales Revenue</option>
              <option value="ecommerce">E-commerce Income</option>
            </select>
          </div>
        </div>
      </div>

      {/* API Credentials Info */}
      <div className="bg-gray-50 rounded-xl border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">API Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Client ID:</span>
            <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs">AB3okT...J2j2I</code>
          </div>
          <div>
            <span className="text-gray-500">Redirect URI:</span>
            <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs">/api/quickbooks/callback</code>
          </div>
          <div>
            <span className="text-gray-500">Environment:</span>
            <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">Sandbox</span>
          </div>
          <div>
            <span className="text-gray-500">Scope:</span>
            <code className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs">com.intuit.quickbooks.accounting</code>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <strong>Note:</strong> To go live, update Client ID/Secret in environment variables and change to production endpoint.
          </p>
        </div>
      </div>
    </div>
  )
}
