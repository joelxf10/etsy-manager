'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase, UserRole, permissions } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import HelpButton from '@/components/HelpButton'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<UserRole>('store_manager')
  const [userName, setUserName] = useState('User')
  const [userId, setUserId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [unreadExceptions, setUnreadExceptions] = useState(0)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/')
        return
      }

      setUser(session.user)
      setUserId(session.user.id)
      setUserEmail(session.user.email || '')
      
      // Get user profile with role
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profile) {
        setUserRole(profile.role as UserRole)
        setUserName(profile.name || session.user.email?.split('@')[0] || 'User')
      } else {
        // Create default profile for new users
        const { error } = await supabase.from('users').insert({
          id: session.user.id,
          email: session.user.email,
          name: session.user.email?.split('@')[0],
          role: 'admin',
        })
        if (!error) {
          setUserRole('admin')
          setUserName(session.user.email?.split('@')[0] || 'User')
        }
      }

      // Get unread exceptions count
      const { count } = await supabase
        .from('exceptions')
        .select('*', { count: 'exact', head: true })
        .eq('resolved', false)

      setUnreadExceptions(count || 0)
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

  // Check permission for current page
  useEffect(() => {
    if (!loading && userRole) {
      const currentPage = pathname.split('/')[2] || 'dashboard'
      if (!permissions[userRole].pages.includes(currentPage)) {
        // Redirect to first allowed page
        const firstAllowed = permissions[userRole].pages[0]
        router.push(`/dashboard${firstAllowed === 'dashboard' ? '' : '/' + firstAllowed}`)
      }
    }
  }, [loading, userRole, pathname, router])

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

  const currentPage = pathname.split('/')[2] || 'dashboard'

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        userRole={userRole} 
        userName={userName} 
        unreadExceptions={unreadExceptions}
      />
      <div className="flex-1 ml-64">
        {children}
      </div>
      <HelpButton 
        userId={userId}
        userEmail={userEmail}
        currentPage={currentPage}
      />
    </div>
  )
}
