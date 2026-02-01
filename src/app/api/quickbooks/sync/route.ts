import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const QB_CLIENT_ID = process.env.QB_CLIENT_ID || 'AB3okThApzM0DIbMCuEasKrE2uhOcmM8Iz0l45l8P8mKSJ2j2I'
const QB_CLIENT_SECRET = process.env.QB_CLIENT_SECRET || '3zi7Auyz6RXoe6xBULuLjsx65myviKQ7KQADGrvi'

async function refreshTokenIfNeeded(supabase: any, integration: any) {
  const expiresAt = new Date(integration.expires_at)
  const now = new Date()
  
  // Refresh if expires in less than 5 minutes
  if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    const tokenResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: integration.refresh_token
      })
    })

    const tokens = await tokenResponse.json()
    
    if (!tokens.error) {
      await supabase.from('integrations').update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || integration.refresh_token,
        expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }).eq('type', 'quickbooks')
      
      return tokens.access_token
    }
  }
  
  return integration.access_token
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get QB integration
    const { data: integration } = await supabase
      .from('integrations')
      .select('*')
      .eq('type', 'quickbooks')
      .single()

    if (!integration) {
      return NextResponse.json({ success: false, error: 'QuickBooks not connected' }, { status: 400 })
    }

    // Refresh token if needed
    const accessToken = await refreshTokenIfNeeded(supabase, integration)
    const realmId = integration.realm_id
    const baseUrl = `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}`

    // Get orders to sync (OK status, not yet synced)
    const { data: orders } = await supabase
      .from('orders_ledger')
      .select('*')
      .eq('resolve_status', 'OK')
      .eq('order_status', 'OK')
      .is('qb_invoice_id', null)
      .limit(50)

    let invoicesCreated = 0

    // Create invoices for orders
    for (const order of orders || []) {
      try {
        // Create a simple invoice
        const invoice = {
          Line: [{
            Amount: order.price_item * (order.qty || 1),
            DetailType: 'SalesItemLineDetail',
            SalesItemLineDetail: {
              ItemRef: { value: '1', name: 'Sales' }, // Default item
              Qty: order.qty || 1,
              UnitPrice: order.price_item
            },
            Description: `${order.store_name} - ${order.store_sku} - ${order.etsy_color || ''} ${order.etsy_size || ''}`
          }],
          CustomerRef: { value: '1' }, // Default customer - in production, create/find customer
          DocNumber: order.order_number,
          TxnDate: order.order_date,
          CurrencyRef: { value: order.currency || 'GBP' }
        }

        const response = await fetch(`${baseUrl}/invoice`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(invoice)
        })

        if (response.ok) {
          const result = await response.json()
          // Mark as synced
          await supabase
            .from('orders_ledger')
            .update({ qb_invoice_id: result.Invoice.Id })
            .eq('id', order.id)
          
          invoicesCreated++
        }
      } catch (err) {
        console.error('Error creating invoice for order:', order.order_number, err)
      }
    }

    // Get expenses to sync
    const { data: expenses } = await supabase
      .from('company_expenses')
      .select('*')
      .is('qb_bill_id', null)
      .limit(50)

    let expensesSynced = 0

    // Create bills for expenses
    for (const expense of expenses || []) {
      try {
        const bill = {
          Line: [{
            Amount: expense.amount,
            DetailType: 'AccountBasedExpenseLineDetail',
            AccountBasedExpenseLineDetail: {
              AccountRef: { value: '1' } // Default expense account
            },
            Description: `${expense.category}: ${expense.description}`
          }],
          VendorRef: { value: '1' }, // Default vendor
          TxnDate: expense.expense_date,
          CurrencyRef: { value: expense.currency || 'PKR' }
        }

        const response = await fetch(`${baseUrl}/bill`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(bill)
        })

        if (response.ok) {
          const result = await response.json()
          await supabase
            .from('company_expenses')
            .update({ qb_bill_id: result.Bill.Id })
            .eq('id', expense.id)
          
          expensesSynced++
        }
      } catch (err) {
        console.error('Error creating bill for expense:', expense.id, err)
      }
    }

    // Update last sync time
    await supabase
      .from('integrations')
      .update({ last_sync: new Date().toISOString() })
      .eq('type', 'quickbooks')

    return NextResponse.json({
      success: true,
      invoicesCreated,
      expensesSynced,
      message: `Synced ${invoicesCreated} invoices and ${expensesSynced} expenses`
    })

  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.json({ success: false, error: 'Sync failed' }, { status: 500 })
  }
}
