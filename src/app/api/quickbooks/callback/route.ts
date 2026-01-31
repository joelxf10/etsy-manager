import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const QB_CLIENT_ID = process.env.QB_CLIENT_ID || 'AB3okThApzM0DIbMCuEasKrE2uhOcmM8Iz0l45l8P8mKSJ2j2I'
const QB_CLIENT_SECRET = process.env.QB_CLIENT_SECRET || '3zi7Auyz6RXoe6xBULuLjsx65myviKQ7KQADGrvi'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const realmId = searchParams.get('realmId')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/admin/quickbooks?error=' + error, request.url))
  }

  if (!code || !realmId) {
    return NextResponse.redirect(new URL('/admin/quickbooks?error=missing_params', request.url))
  }

  try {
    // Exchange code for tokens
    const redirectUri = `${request.nextUrl.origin}/api/quickbooks/callback`
    
    const tokenResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString('base64')
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    })

    const tokens = await tokenResponse.json()

    if (tokens.error) {
      console.error('Token error:', tokens)
      return NextResponse.redirect(new URL('/admin/quickbooks?error=token_error', request.url))
    }

    // Get company info
    const companyResponse = await fetch(
      `https://sandbox-quickbooks.api.intuit.com/v3/company/${realmId}/companyinfo/${realmId}`,
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Accept': 'application/json'
        }
      }
    )

    let companyName = 'Connected Company'
    if (companyResponse.ok) {
      const companyData = await companyResponse.json()
      companyName = companyData.CompanyInfo?.CompanyName || companyName
    }

    // Store in Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Upsert integration record
    await supabase.from('integrations').upsert({
      type: 'quickbooks',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      realm_id: realmId,
      company_name: companyName,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'type'
    })

    return NextResponse.redirect(new URL('/admin/quickbooks?success=true', request.url))
  } catch (err) {
    console.error('OAuth error:', err)
    return NextResponse.redirect(new URL('/admin/quickbooks?error=oauth_failed', request.url))
  }
}
