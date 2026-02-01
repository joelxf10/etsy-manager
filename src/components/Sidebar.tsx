'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, LayoutDashboard, Package, ClipboardList, DollarSign, Camera, Users, HelpCircle, ChevronLeft, Store, FileText, Palette, CreditCard, Receipt, Link2, Truck, Upload, Image, UserCheck } from 'lucide-react'

export default function Sidebar({ platform }: { platform: 'etsy' | 'ebay' }) {
  const pathname = usePathname()

  const etsyNav = [
    { name: 'Dashboard', href: '/etsy/dashboard', icon: LayoutDashboard },
    { name: 'Stores', href: '/etsy/stores', icon: Store },
    { name: 'Products', href: '/etsy/products', icon: Package },
    { name: 'Orders', href: '/etsy/orders', icon: ClipboardList },
    { name: 'Import Orders', href: '/etsy/orders/import', icon: Upload },
    { name: 'Supplier Picklist', href: '/etsy/supplier', icon: Truck },
    { name: 'Graphics Queue', href: '/etsy/graphics', icon: Palette },
    { name: 'Image Duplicates', href: '/etsy/images', icon: Image },
    { name: 'Finance', href: '/etsy/finance', icon: DollarSign },
    { name: 'Help Requests', href: '/etsy/help', icon: HelpCircle },
  ]

  const ebayNav = [
    { name: 'Dashboard', href: '/ebay/dashboard', icon: LayoutDashboard },
    { name: 'Stores', href: '/ebay/stores', icon: Store },
    { name: 'Orders', href: '/ebay/orders', icon: ClipboardList },
    { name: 'Screenshots', href: '/ebay/screenshots', icon: Camera },
    { name: 'Reports', href: '/ebay/reports', icon: FileText },
    { name: 'Finance', href: '/ebay/finance', icon: DollarSign },
    { name: 'Help Requests', href: '/ebay/help', icon: HelpCircle },
  ]

  const nav = platform === 'etsy' ? etsyNav : ebayNav

  return (
    <div className="w-64 bg-slate-900 min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${platform === 'etsy' ? 'bg-orange-500' : 'bg-blue-500'}`}>
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold">EcomGiga</h1>
            <p className="text-xs text-gray-500 capitalize">{platform} Portal</p>
          </div>
        </div>
      </div>

      {/* Switch Platform - Always visible */}
      <Link href="/select-platform" className="flex items-center gap-2 px-4 py-3 text-gray-400 hover:text-white hover:bg-slate-800 text-sm border-b border-slate-800">
        <ChevronLeft className="w-4 h-4" />Switch Platform
      </Link>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {nav.map((item) => (
          <Link key={item.name} href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${pathname === item.href ? (platform === 'etsy' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400') : 'text-gray-400 hover:text-white hover:bg-slate-800'}`}>
            <item.icon className="w-5 h-5" />{item.name}
          </Link>
        ))}
      </nav>

      {/* Admin Section - Always visible */}
      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-gray-600 uppercase mb-2">Admin</p>
        <Link href="/admin/employees" className={`flex items-center gap-3 px-3 py-2 rounded-lg ${pathname === '/admin/employees' ? 'bg-slate-700 text-white' : 'text-gray-400 hover:text-white hover:bg-slate-800'}`}>
          <Users className="w-5 h-5" />Employees
        </Link>
        <Link href="/admin/payroll" className={`flex items-center gap-3 px-3 py-2 rounded-lg ${pathname === '/admin/payroll' ? 'bg-slate-700 text-white' : 'text-gray-400 hover:text-white hover:bg-slate-800'}`}>
          <CreditCard className="w-5 h-5" />Payroll
        </Link>
        <Link href="/admin/expenses" className={`flex items-center gap-3 px-3 py-2 rounded-lg ${pathname === '/admin/expenses' ? 'bg-slate-700 text-white' : 'text-gray-400 hover:text-white hover:bg-slate-800'}`}>
          <Receipt className="w-5 h-5" />Expenses
        </Link>
        <Link href="/admin/quickbooks" className={`flex items-center gap-3 px-3 py-2 rounded-lg ${pathname === '/admin/quickbooks' ? 'bg-slate-700 text-white' : 'text-gray-400 hover:text-white hover:bg-slate-800'}`}>
          <Link2 className="w-5 h-5" />QuickBooks
        </Link>
        <Link href="/admin/reports" className={`flex items-center gap-3 px-3 py-2 rounded-lg ${pathname === '/admin/reports' ? 'bg-slate-700 text-white' : 'text-gray-400 hover:text-white hover:bg-slate-800'}`}>
          <FileText className="w-5 h-5" />Reports
        </Link>
        <Link href="/admin/clients" className={`flex items-center gap-3 px-3 py-2 rounded-lg ${pathname === '/admin/clients' ? 'bg-slate-700 text-white' : 'text-gray-400 hover:text-white hover:bg-slate-800'}`}>
          <UserCheck className="w-5 h-5" />Clients
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">J</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">Joel Francis</p>
            <p className="text-gray-500 text-xs">Admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}
