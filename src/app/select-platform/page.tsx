'use client'

import { useEffect, useState } from 'react'
import { createClient, User } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Store, LogOut, Shield } from 'lucide-react'

export default function SelectPlatformPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/')
        return
      }

      // Get user profile
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('email', session.user.email)
        .single()

      if (data) {
        setUser(data)
        
        // Auto-redirect based on platform if not admin
        if (data.platform === 'etsy') {
          router.push('/etsy/dashboard')
          return
        } else if (data.platform === 'ebay') {
          router.push('/ebay/dashboard')
          return
        }
        // If 'both' or admin, show selector
      }
      
      setLoading(false)
    }

    loadUser()
  }, [router, supabase])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">EcomGiga</span>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 text-white/80">
              <Shield className="w-4 h-4" />
              <span className="text-sm capitalize">{user.role}</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/60 hover:text-white transition"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Platform Selector */}
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.name}</h1>
          <p className="text-gray-400 mb-12">Select a platform to continue</p>

          <div className="flex gap-6">
            {/* Etsy Card */}
            <button
              onClick={() => router.push('/etsy/dashboard')}
              className="group w-64 p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 hover:border-orange-500/50 hover:bg-white/15 transition-all"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Etsy</h2>
              <p className="text-gray-400 text-sm">36 Active Stores</p>
              <p className="text-gray-500 text-xs mt-1">Graphics • Listings • Orders</p>
            </button>

            {/* eBay Card */}
            <button
              onClick={() => router.push('/ebay/dashboard')}
              className="group w-64 p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 hover:border-blue-500/50 hover:bg-white/15 transition-all"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">eBay</h2>
              <p className="text-gray-400 text-sm">42 Active Stores</p>
              <p className="text-gray-500 text-xs mt-1">Orders • Reports • Screenshots</p>
            </button>
          </div>

          {/* Admin Links */}
          {user?.role === 'admin' && (
            <div className="mt-12 flex justify-center gap-4">
              <button
                onClick={() => router.push('/admin/costs')}
                className="px-6 py-2 bg-white/10 text-white/80 rounded-lg hover:bg-white/20 transition text-sm"
              >
                Costs Tracker
              </button>
              <button
                onClick={() => router.push('/admin/employees')}
                className="px-6 py-2 bg-white/10 text-white/80 rounded-lg hover:bg-white/20 transition text-sm"
              >
                Manage Employees
              </button>
              <button
                onClick={() => router.push('/admin/reports')}
                className="px-6 py-2 bg-white/10 text-white/80 rounded-lg hover:bg-white/20 transition text-sm"
              >
                Reports
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
