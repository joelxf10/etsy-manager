import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Types for the database
export type UserRole = 'admin' | 'manager' | 'finance' | 'listing' | 'graphic' | 'hunter' | 'csr' | 'hr' | 'supplier'
export type Platform = 'etsy' | 'ebay' | 'both'
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'disputed'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  platform: Platform
  avatar_url?: string
  is_active: boolean
  created_at: string
}

export interface Store {
  id: string
  name: string
  platform: Platform
  owner?: string
  country?: string
  is_active: boolean
  store_url?: string
  notes?: string
  created_at: string
}

export interface Order {
  id: string
  store_id: string
  platform_order_id?: string
  customer_name?: string
  customer_email?: string
  shipping_address?: string
  shipping_country?: string
  status: OrderStatus
  subtotal?: number
  shipping_cost?: number
  platform_fee?: number
  total?: number
  profit?: number
  notes?: string
  fulfilled_by?: string
  fulfilled_at?: string
  order_date: string
  created_at: string
  store?: Store
}

export interface Screenshot {
  id: string
  store_id: string
  uploaded_by: string
  image_url: string
  screenshot_date: string
  active_listings?: number
  total_sales?: number
  orders_count?: number
  impressions?: number
  notes?: string
  created_at: string
  store?: Store
}

export interface Cost {
  id: string
  category_id?: string
  store_id?: string
  platform?: Platform
  description: string
  amount: number
  currency: string
  is_recurring: boolean
  recurrence_period?: string
  cost_date: string
  created_at: string
  category?: CostCategory
  store?: Store
}

export interface CostCategory {
  id: string
  name: string
  type: string
  description?: string
}
