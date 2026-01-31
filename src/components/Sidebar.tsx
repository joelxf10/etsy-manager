'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserRole } from '@/lib/supabase'

interface SidebarProps {
  userRole: UserRole
  userName: string
}

const menuItems = [
  { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard', path: '/dashboard' },
  { id: 'orders', icon: 'fa-shopping-cart', label: 'Orders', path: '/dashboard/orders' },
  { id: 'products', icon: 'fa-box', label: 'Products', path: '/dashboard/products' },
  { id: 'finance', icon: 'fa-dollar-sign', label: 'Finance & PNL', path: '/dashboard/finance' },
  { id: 'exceptions', icon: 'fa-exclamation-triangle', label: 'Exceptions', path: '/dashboard/exceptions' },
  { id: 'picklist', icon: 'fa-clipboard-list', label: 'Supplier Picklist', path: '/dashboard/picklist' },
  { id: 'settings', icon: 'fa-cog', label: 'Settings', path: '/dashboard/settings' },
]

const rolePermissions: Record<UserRole, string[]> = {
  admin: ['dashboard', 'orders', 'products', 'finance', 'exceptions', 'picklist', 'settings'],
  finance: ['dashboard', 'finance', 'exceptions'],
  store_manager: ['dashboard', 'orders', 'products'],
  supplier: ['picklist'],
}

export default function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname()
  const allowedPages = rolePermissions[userRole]

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col h-screen fixed left-0 top-0">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <i className="fas fa-store text-emerald-400"></i>
          Etsy Manager
        </h1>
        <p className="text-xs text-gray-400 mt-1">40+ Store Operations</p>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <p className="text-xs text-gray-500 uppercase mb-2">Menu</p>
        {menuItems.map((item) => {
          if (!allowedPages.includes(item.id)) return null

          const isActive = pathname === item.path || 
            (item.id !== 'dashboard' && pathname.startsWith(item.path))

          return (
            <Link
              key={item.id}
              href={item.path}
              className={`sidebar-item ${isActive ? 'active' : ''} rounded px-3 py-2 mb-1 flex items-center justify-between cursor-pointer block`}
            >
              <span>
                <i className={`fas ${item.icon} w-5 mr-3 text-gray-400`}></i>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
            <i className="fas fa-user text-sm"></i>
          </div>
          <div>
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-gray-400 capitalize">{userRole.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
