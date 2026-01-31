'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, UserRole } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<UserRole>('admin')
  const [userName, setUserName] = useState('User')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/')
        return
      }

      setUser(session.user)
      
      // Get user profile with role
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setUserRole(profile.role)
        setUserName(profile.name || session.user.email?.split('@')[0] || 'User')
      } else {
        // Create default profile for new users
        const { error } = await supabase.from('users').insert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.email?.split('@')[0],
          role: 'admin', // First user is admin
        })
        if (!error) {
          setUserRole('admin')
          setUserName(session.user.email?.split('@')[0] || 'User')
        }
      }

      setLoading(false)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-emerald-500 mb-4"></i>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole={userRole} userName={userName} />
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  )
}
