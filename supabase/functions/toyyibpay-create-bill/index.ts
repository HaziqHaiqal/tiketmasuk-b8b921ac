
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
      billNameLength: billName?.length,
      billAmount,
      billEmail,
      billPhone
    });

    // Get secrets from Supabase
    const userSecretKey = Deno.env.get('TOYYIBPAY_USER_SECRET_KEY')
    const categoryCode = Deno.env.get('TOYYIBPAY_CATEGORY_CODE')

    if (!userSecretKey || !categoryCode) {
      console.error('Missing ToyyibPay credentials')
      throw new Error('ToyyibPay credentials not configured')
    }

    // Validate bill name length (ToyyibPay limit is 30 characters)
    if (billName && billName.length > 30) {
      console.error('Bill name too long:', billName.length, 'characters')
      throw new Error(`Bill name must be 30 characters or less. Current: ${billName.length}`)
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

    console.log('Calling ToyyibPay API with validated data')

    // Call ToyyibPay API
    const response = await fetch('https://dev.toyyibpay.com/index.php/api/createBill', {
      method: 'POST',
      body: formData,
    })

    const responseText = await response.text()
    console.log('ToyyibPay API response:', responseText)
    
    // ToyyibPay returns different formats, try to parse as JSON first
    let result
    try {
      result = JSON.parse(responseText)
      
      // Check if it's an error response
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
        throw new Error('Invalid response from ToyyibPay API: ' + responseText)
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
