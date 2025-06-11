
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
    const { 
      billName, 
      billDescription, 
      billAmount, 
      billReturnUrl, 
      billCallbackUrl, 
      billExternalReferenceNo,
      billTo,
      billEmail,
      billPhone,
      billExpiryDays
    } = await req.json()

    // Get secrets from Supabase
    const userSecretKey = Deno.env.get('TOYYIBPAY_USER_SECRET_KEY')
    const categoryCode = Deno.env.get('TOYYIBPAY_CATEGORY_CODE')

    if (!userSecretKey || !categoryCode) {
      throw new Error('ToyyibPay credentials not configured')
    }

    // Prepare form data for ToyyibPay API
    const formData = new FormData()
    formData.append('userSecretKey', userSecretKey)
    formData.append('categoryCode', categoryCode)
    formData.append('billName', billName)
    formData.append('billDescription', billDescription)
    formData.append('billPriceSetting', '1') // Fixed price
    formData.append('billPayorInfo', '1') // Require payor info
    formData.append('billAmount', billAmount.toString())
    formData.append('billReturnUrl', billReturnUrl)
    formData.append('billCallbackUrl', billCallbackUrl)
    formData.append('billExternalReferenceNo', billExternalReferenceNo)
    formData.append('billTo', billTo)
    formData.append('billEmail', billEmail)
    formData.append('billPhone', billPhone)
    formData.append('billSplitPayment', '0')
    formData.append('billSplitPaymentArgs', '')
    formData.append('billPaymentChannel', '0') // All available channels
    formData.append('billContentEmail', 'Thank you for your purchase!')
    formData.append('billChargeToCustomer', '1')
    formData.append('billExpiryDate', '')
    formData.append('billExpiryDays', billExpiryDays?.toString() || '3')

    // Call ToyyibPay API
    const response = await fetch('https://dev.toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      body: formData,
    })

    const responseText = await response.text()
    
    // ToyyibPay returns different formats, try to parse as JSON first
    let result
    try {
      result = JSON.parse(responseText)
    } catch {
      // If not JSON, check if it's a direct bill code
      if (responseText && responseText.length > 0 && !responseText.includes('<')) {
        result = [{ BillCode: responseText.trim() }]
      } else {
        throw new Error('Invalid response from ToyyibPay API')
      }
    }

    if (result && result[0] && result[0].BillCode) {
      const billCode = result[0].BillCode
      const paymentUrl = `https://dev.toyyibpay.com/${billCode}`
      
      return new Response(
        JSON.stringify({
          billCode,
          billpaymentUrl: paymentUrl,
          success: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      throw new Error('Failed to create bill: ' + responseText)
    }

  } catch (error) {
    console.error('ToyyibPay API Error:', error)
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
