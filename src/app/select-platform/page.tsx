'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ShoppingBag, Store, LogOut, Shield } from 'lucide-react'

export default function SelectPlatformPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/'); return }
      const { data } = await supabase.from('users').select('*').eq('email', session.user.email).single()
      if (data) {
        setUser(data)
        if (data.platform === 'etsy') { router.push('/etsy/dashboard'); return }
        if (data.platform === 'ebay') { router.push('/ebay/dashboard'); return }
      }
      setLoading(false)
    }
    loadUser()
  }, [router, supabase])

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div></div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">EcomGiga</span>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/') }} className="text-white/60 hover:text-white">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user?.name}</h1>
          <p className="text-gray-400 mb-12">Select a platform to continue</p>
          <div className="flex gap-6">
            <button onClick={() => router.push('/etsy/dashboard')} className="group w-64 p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 hover:border-orange-500/50 hover:bg-white/15 transition-all">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Store className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Etsy</h2>
              <p className="text-gray-400 text-sm">36 Active Stores</p>
            </button>
            <button onClick={() => router.push('/ebay/dashboard')} className="group w-64 p-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 hover:border-blue-500/50 hover:bg-white/15 transition-all">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">eBay</h2>
              <p className="text-gray-400 text-sm">42 Active Stores</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
