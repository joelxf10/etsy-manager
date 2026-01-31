import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { question, context } = await req.json()

    // System prompt for the help assistant
    const systemPrompt = `You are a helpful assistant for an Etsy Multi-Store Management app. 
Your job is to help users understand how to use the app.

The app has these main features:
- Dashboard: Overview of all stores, revenue, profit, and open exceptions
- Orders: Import orders from Etsy CSV, view order status, mark as cancelled/refunded
- Products: Manage products (GP-ID), add variants (color/size), map SKUs to products
- Finance: View PNL (profit and loss), revenue, costs, and fees
- Exceptions: View and resolve orders that couldn't be auto-matched
- Supplier Picklist: List of items ready for supplier to fulfill
- Settings: Add/remove stores, manage team members and their roles

Roles:
- Admin: Full access to everything
- Finance: Can see Dashboard, Finance, and Exceptions only
- Store Manager: Can see Dashboard, Orders, Products (but NOT costs/profit)
- Supplier: Can only see the Supplier Picklist

Key workflows:
1. Add a store in Settings first
2. Add products with GP-IDs and their variants
3. Map store SKUs to products
4. Import orders from Etsy CSV
5. Orders auto-resolve to products/variants
6. Failed resolutions appear in Exceptions
7. Resolved orders appear in Finance for PNL tracking

Be concise and helpful. If you don't know something specific about the app, say so.`

    // Check if Anthropic API key is configured
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey || apiKey === 'your-anthropic-api-key-here') {
      // Return a generic helpful response if no API key
      return NextResponse.json({
        response: `I understand you're asking about: "${question}"

Unfortunately, the AI assistant is not fully configured yet. Here are some general tips:

1. For importing orders: Go to Orders → Import Orders → Paste your Etsy CSV data
2. For adding products: Go to Products → Add Product → Fill in GP ID and details
3. For adding team members: Go to Settings → Add User → Select their role
4. For viewing profit: Go to Finance (requires Admin or Finance role)

If this doesn't answer your question, your request has been logged and an admin will help you soon.`
      })
    }

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `Context: ${context}\n\nUser question: ${question}`
          }
        ]
      })
    })

    if (!response.ok) {
      throw new Error('AI API error')
    }

    const data = await response.json()
    const aiResponse = data.content[0]?.text || 'Sorry, I could not generate a response.'

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
