'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserRole, permissions } from '@/lib/supabase'

interface SidebarProps {
  userRole: UserRole
  userName: string
  unreadExceptions?: number
}

const menuItems = [
  { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard', path: '/dashboard' },
  { id: 'orders', icon: 'fa-shopping-cart', label: 'Orders', path: '/dashboard/orders' },
  { id: 'products', icon: 'fa-box', label: 'Products', path: '/dashboard/products' },
  { id: 'finance', icon: 'fa-dollar-sign', label: 'Finance & PNL', path: '/dashboard/finance' },
  { id: 'exceptions', icon: 'fa-exclamation-triangle', label: 'Exceptions', path: '/dashboard/exceptions' },
  { id: 'picklist', icon: 'fa-clipboard-list', label: 'Supplier Picklist', path: '/dashboard/picklist' },
  { id: 'settings', icon: 'fa-cog', label: 'Settings', path: '/dashboard/settings' },
  { id: 'help-requests', icon: 'fa-life-ring', label: 'Help Requests', path: '/dashboard/help-requests' },
]

export default function Sidebar({ userRole, userName, unreadExceptions = 0 }: SidebarProps) {
  const pathname = usePathname()
  const allowedPages = permissions[userRole].pages

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-purple-500',
    finance: 'bg-blue-500',
    store_manager: 'bg-green-500',
    supplier: 'bg-orange-500',
  }

  const roleLabels: Record<UserRole, string> = {
    admin: 'Admin',
    finance: 'Finance',
    store_manager: 'Store Manager',
    supplier: 'Supplier',
  }

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed left-0 top-0">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <i className="fas fa-store text-emerald-400"></i>
          Etsy Manager
        </h1>
        <p className="text-xs text-gray-400 mt-1">Multi-Store Operations</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <p className="text-xs text-gray-500 uppercase mb-2">Menu</p>
        {menuItems.map((item) => {
          if (!allowedPages.includes(item.id)) return null

          const isActive = pathname === item.path || 
            (item.id !== 'dashboard' && pathname.startsWith(item.path))

          const showBadge = item.id === 'exceptions' && unreadExceptions > 0

          return (
            <Link
              key={item.id}
              href={item.path}
              data-tour={`nav-${item.id}`}
              className={`sidebar-item ${isActive ? 'active' : ''} rounded px-3 py-2 mb-1 flex items-center justify-between cursor-pointer block`}
            >
              <span>
                <i className={`fas ${item.icon} w-5 mr-3 text-gray-400`}></i>
                {item.label}
              </span>
              {showBadge && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadExceptions}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${roleColors[userRole]} flex items-center justify-center`}>
            <span className="text-sm font-medium">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-gray-400">{roleLabels[userRole]}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
