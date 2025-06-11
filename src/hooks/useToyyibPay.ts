
import { useState } from 'react';
import { createToyyibPayBill, generateBillExternalReference } from '@/utils/toyyibpay';

interface UseToyyibPayProps {
  eventId: string;
  eventName: string;
  totalAmount: number;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  quantity?: number;
}

export const useToyyibPay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async ({
    eventId,
    eventName,
    totalAmount,
    customerFirstName,
    customerLastName,
    customerEmail,
    customerPhone,
    customerAddress = '',
    quantity = 1,
  }: UseToyyibPayProps) => {
    console.log('Starting payment creation process...');
    setLoading(true);
    setError(null);

    try {
      // Create a simple, URL-safe bill name
      const safeBillName = `Ticket-${eventId.slice(0, 8)}`;
      
      // Ensure URLs are properly encoded and don't contain special characters
      const baseUrl = window.location.origin;
      const successParams = new URLSearchParams({
        event_id: eventId,
        quantity: quantity.toString(),
        total_amount: totalAmount.toString(),
        customer_first_name: customerFirstName,
        customer_last_name: customerLastName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_address: customerAddress
      });
      
      const returnUrl = `${baseUrl}/payment/success?${successParams.toString()}`;
      const callbackUrl = returnUrl; // Use same URL for both
      
      const billConfig = {
        billName: safeBillName, // Simple, safe name
        billDescription: `Event ticket for ${eventName.substring(0, 50)}`, // Limit description length
        billAmount: Math.round(totalAmount * 100), // Convert to cents
        billReturnUrl: returnUrl,
        billCallbackUrl: callbackUrl,
        billExternalReferenceNo: generateBillExternalReference(),
        billTo: `${customerFirstName} ${customerLastName}`.substring(0, 30), // Limit length
        billEmail: customerEmail,
        billPhone: customerPhone.replace(/[^\d+]/g, ''), // Remove non-numeric chars except +
        billExpiryDays: 1,
      };

      console.log('Creating ToyyibPay bill with config:', billConfig);

      const response = await createToyyibPayBill(billConfig);
      
      console.log('ToyyibPay response received:', response);
      
      if (response.billpaymentUrl && !response.billpaymentUrl.includes('[KEY-DID-NOT-EXIST')) {
        console.log('Redirecting to payment URL:', response.billpaymentUrl);
        // Redirect to ToyyibPay payment page
        window.location.href = response.billpaymentUrl;
      } else {
        throw new Error('Invalid ToyyibPay configuration - please check API credentials');
      }
      
      return response;
    } catch (err) {
      console.error('Payment creation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment creation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPayment,
    loading,
    error,
  };
};
