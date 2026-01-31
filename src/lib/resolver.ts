import { supabase } from './supabase'

interface ResolveResult {
  success: boolean
  resolved_gp_id?: string
  resolved_var_id?: string
  resolved_supplier_variation?: string
  resolved_cost_usd?: number
  resolved_shipping_usd?: number
  error?: string
}

// Normalize string for matching (lowercase, trim)
const norm = (s: string | null | undefined): string => {
  return (s || '').toString().trim().toLowerCase()
}

// Resolve a single order - find matching product and variant
export async function resolveOrder(
  storeId: string,
  storeSku: string,
  etsyColor: string | null,
  etsySize: string | null
): Promise<ResolveResult> {
  try {
    // Step 1: Find GP_ID from store SKU
    const { data: skuMapping } = await supabase
      .from('store_skus')
      .select('product_id, products(gp_id)')
      .eq('store_id', storeId)
      .eq('store_sku', storeSku)
      .single()

    if (!skuMapping) {
      return { success: false, error: 'SKU not mapped' }
    }

    const gpId = (skuMapping as any).products?.gp_id
    if (!gpId) {
      return { success: false, error: 'Product not found for SKU' }
    }

    // Step 2: Find matching variant
    const { data: variants } = await supabase
      .from('variants')
      .select('*')
      .eq('product_id', skuMapping.product_id)

    if (!variants || variants.length === 0) {
      return { success: false, error: 'No variants found for product' }
    }

    // Try exact match first (GP_ID + color + size)
    let match = variants.find(v => 
      norm(v.etsy_color) === norm(etsyColor) && 
      norm(v.etsy_size) === norm(etsySize)
    )

    // Fallback: match by color only (for products without size variations)
    if (!match && etsyColor) {
      match = variants.find(v => 
        norm(v.etsy_color) === norm(etsyColor) && 
        (!v.etsy_size || norm(v.etsy_size) === 'one size')
      )
    }

    // Fallback: match by size only (for products without color variations)
    if (!match && etsySize) {
      match = variants.find(v => 
        norm(v.etsy_size) === norm(etsySize) && 
        (!v.etsy_color || v.etsy_color === '')
      )
    }

    // Fallback: default/one-size variant
    if (!match) {
      match = variants.find(v => 
        (!v.etsy_color || v.etsy_color === '' || norm(v.etsy_color) === 'default') &&
        (!v.etsy_size || norm(v.etsy_size) === 'one size' || norm(v.etsy_size) === 'default')
      )
    }

    if (!match) {
      return { 
        success: false, 
        error: `Variant not found: ${etsyColor || 'no color'} / ${etsySize || 'no size'}` 
      }
    }

    return {
      success: true,
      resolved_gp_id: gpId,
      resolved_var_id: match.var_id,
      resolved_supplier_variation: match.supplier_variation_name,
      resolved_cost_usd: match.last_cost_usd,
      resolved_shipping_usd: match.last_shipping_usd,
    }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// Resolve all pending orders
export async function resolveAllOrders(): Promise<{ resolved: number; failed: number }> {
  const { data: pendingOrders } = await supabase
    .from('orders')
    .select('*')
    .is('resolve_status', null)
    .eq('order_status', 'OK')

  if (!pendingOrders) return { resolved: 0, failed: 0 }

  let resolved = 0
  let failed = 0

  for (const order of pendingOrders) {
    const result = await resolveOrder(
      order.store_id,
      order.store_sku,
      order.etsy_color,
      order.etsy_size
    )

    if (result.success) {
      await supabase
        .from('orders')
        .update({
          resolved_gp_id: result.resolved_gp_id,
          resolved_var_id: result.resolved_var_id,
          resolved_supplier_variation: result.resolved_supplier_variation,
          resolved_cost_usd: result.resolved_cost_usd,
          resolved_shipping_usd: result.resolved_shipping_usd,
          resolve_status: 'OK',
        })
        .eq('id', order.id)
      resolved++
    } else {
      await supabase
        .from('orders')
        .update({ resolve_status: 'Needs Fix' })
        .eq('id', order.id)

      // Create exception
      const { data: store } = await supabase
        .from('stores')
        .select('name')
        .eq('id', order.store_id)
        .single()

      await supabase.from('exceptions').insert({
        order_id: order.id,
        order_number: order.order_number,
        store_name: store?.name || 'Unknown',
        store_sku: order.store_sku,
        issue: result.error || 'Unknown error',
        fix_type: result.error?.includes('SKU') ? 'Add SKU Mapping' : 'Add Variant',
      })

      failed++
    }
  }

  return { resolved, failed }
}
