
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const billCode = url.pathname.split('/').pop()

    if (!billCode) {
      throw new Error('Bill code is required')
    }

    // Get secrets from Supabase
    const userSecretKey = Deno.env.get('TOYYIBPAY_USER_SECRET_KEY')

    if (!userSecretKey) {
      throw new Error('ToyyibPay credentials not configured')
    }

    // Prepare form data for ToyyibPay API
    const formData = new FormData()
    formData.append('billCode', billCode)
    formData.append('billpaymentStatus', '1')

    // Call ToyyibPay API
    const response = await fetch('https://dev.toyyibpay.com/index.php/api/getBillTransactions', {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('ToyyibPay Status Error:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
