import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Role definitions
export type UserRole = 'admin' | 'finance' | 'store_manager' | 'supplier'

// Permission matrix - what each role can access
export const permissions: Record<UserRole, {
  pages: string[]
  canSeeCosts: boolean
  canSeeProfit: boolean
  canEditProducts: boolean
  canEditOrders: boolean
  canManageUsers: boolean
  canManageStores: boolean
}> = {
  admin: {
    pages: ['dashboard', 'orders', 'products', 'finance', 'exceptions', 'picklist', 'settings', 'help-requests'],
    canSeeCosts: true,
    canSeeProfit: true,
    canEditProducts: true,
    canEditOrders: true,
    canManageUsers: true,
    canManageStores: true,
  },
  finance: {
    pages: ['dashboard', 'finance', 'exceptions'],
    canSeeCosts: true,
    canSeeProfit: true,
    canEditProducts: false,
    canEditOrders: false,
    canManageUsers: false,
    canManageStores: false,
  },
  store_manager: {
    pages: ['dashboard', 'orders', 'products'],
    canSeeCosts: false,
    canSeeProfit: false,
    canEditProducts: true,
    canEditOrders: true,
    canManageUsers: false,
    canManageStores: false,
  },
  supplier: {
    pages: ['picklist'],
    canSeeCosts: true,
    canSeeProfit: false,
    canEditProducts: false,
    canEditOrders: false,
    canManageUsers: false,
    canManageStores: false,
  },
}

// Database types
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  created_at: string
}

export interface Store {
  id: string
  name: string
  code: string
  owner: string | null
  status: 'active' | 'inactive'
  created_at: string
}

export interface Product {
  id: string
  gp_id: string
  name: string | null
  canonical_1688_link: string | null
  status: 'active' | 'inactive'
  notes: string | null
  created_at: string
}

export interface Variant {
  id: string
  var_id: string
  product_id: string
  etsy_color: string | null
  etsy_size: string | null
  supplier_variation_name: string | null
  supplier_size_name: string | null
  last_cost_usd: number | null
  last_shipping_usd: number | null
  last_updated: string | null
  created_at: string
}

export interface StoreSku {
  id: string
  store_id: string
  product_id: string
  store_sku: string
  created_at: string
}

export interface Order {
  id: string
  order_number: string
  order_line_id: string
  platform: string
  store_id: string
  store_sku: string
  etsy_order_id: string
  etsy_color: string | null
  etsy_size: string | null
  qty: number
  price_item: number
  currency: string
  resolved_gp_id: string | null
  resolved_var_id: string | null
  resolved_supplier_variation: string | null
  resolved_cost_usd: number | null
  resolved_shipping_usd: number | null
  resolve_status: 'OK' | 'Needs Fix' | null
  order_status: 'OK' | 'Cancelled' | 'Refunded'
  order_date: string
  created_at: string
}

export interface Exception {
  id: string
  order_id: string | null
  order_number: string
  store_name: string
  store_sku: string
  issue: string
  action_owner: string | null
  fix_type: string | null
  resolved: boolean
  resolved_at: string | null
  resolver: string | null
  created_at: string
}

export interface HelpRequest {
  id: string
  user_id: string
  user_email: string
  question: string
  page: string
  ai_response: string | null
  resolved: boolean
  admin_notes: string | null
  created_at: string
}

// Helper functions
export const checkPermission = (role: UserRole, page: string): boolean => {
  return permissions[role].pages.includes(page)
}

export const canSeeCosts = (role: UserRole): boolean => {
  return permissions[role].canSeeCosts
}

export const canSeeProfit = (role: UserRole): boolean => {
  return permissions[role].canSeeProfit
}
