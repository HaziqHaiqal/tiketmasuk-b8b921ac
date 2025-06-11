
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

    console.log('Received bill creation request:', {
      billName,
      billAmount,
      billEmail,
      billPhone
    });

    // Get secrets from Supabase
    const userSecretKey = Deno.env.get('TOYYIBPAY_USER_SECRET_KEY')
    const categoryCode = Deno.env.get('TOYYIBPAY_CATEGORY_CODE')

    if (!userSecretKey || !categoryCode) {
      console.error('Missing ToyyibPay credentials')
      return new Response(
        JSON.stringify({
          error: 'ToyyibPay credentials not configured. Please check TOYYIBPAY_USER_SECRET_KEY and TOYYIBPAY_CATEGORY_CODE in Supabase secrets.',
          success: false
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Validate and sanitize inputs
    if (!billName || billName.length > 30) {
      throw new Error(`Bill name must be 1-30 characters. Current: ${billName?.length || 0}`)
    }

    // Clean phone number - remove all non-digits except leading +
    const cleanPhone = billPhone.replace(/[^\d+]/g, '')
    
    // Prepare form data for ToyyibPay API
    const formData = new FormData()
    formData.append('userSecretKey', userSecretKey)
    formData.append('categoryCode', categoryCode)
    formData.append('billName', billName)
    formData.append('billDescription', billDescription || 'Event ticket purchase')
    formData.append('billPriceSetting', '1') // Fixed price
    formData.append('billPayorInfo', '1') // Require payor info
    formData.append('billAmount', billAmount.toString())
    formData.append('billReturnUrl', billReturnUrl)
    formData.append('billCallbackUrl', billCallbackUrl)
    formData.append('billExternalReferenceNo', billExternalReferenceNo)
    formData.append('billTo', billTo || 'Customer')
    formData.append('billEmail', billEmail)
    formData.append('billPhone', cleanPhone)
    formData.append('billSplitPayment', '0')
    formData.append('billSplitPaymentArgs', '')
    formData.append('billPaymentChannel', '0') // All available channels
    formData.append('billContentEmail', 'Thank you for your purchase!')
    formData.append('billChargeToCustomer', '1')
    formData.append('billExpiryDate', '')
    formData.append('billExpiryDays', billExpiryDays?.toString() || '3')

    console.log('Calling ToyyibPay API...')

    // Call ToyyibPay API
    const response = await fetch('https://dev.toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      body: formData,
    })

    const responseText = await response.text()
    console.log('ToyyibPay API raw response:', responseText)
    
    // Check for common error responses
    if (responseText.includes('disallowed characters')) {
      throw new Error('Invalid characters in request data. Please check URLs and input fields.')
    }
    
    if (responseText.includes('[KEY-DID-NOT-EXIST') || responseText.includes('USER-IS-NOT-ACTIVE')) {
      throw new Error('Invalid ToyyibPay API credentials. Please verify TOYYIBPAY_USER_SECRET_KEY and TOYYIBPAY_CATEGORY_CODE.')
    }
    
    // Try to parse response
    let result
    try {
      result = JSON.parse(responseText)
      
      if (result && result.status === 'error') {
        console.error('ToyyibPay API error:', result)
        throw new Error(`ToyyibPay API error: ${result.msg}`)
      }
    } catch (parseError) {
      // If not JSON, check if it's a direct bill code
      if (responseText && responseText.length > 0 && !responseText.includes('<') && !responseText.includes('error')) {
        result = [{ BillCode: responseText.trim() }]
      } else {
        console.error('Invalid response from ToyyibPay API:', responseText)
        throw new Error('Invalid response from ToyyibPay API. Please check your API credentials and configuration.')
      }
    }

    if (result && result[0] && result[0].BillCode) {
      const billCode = result[0].BillCode
      const paymentUrl = `https://dev.toyyibpay.com/${billCode}`
      
      console.log('Successfully created bill:', billCode)
      
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
      console.error('No bill code in response:', result)
      throw new Error('Failed to create bill: No bill code returned')
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
