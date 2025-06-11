
import { useState } from 'react';
import { createToyyibPayBill, generateBillExternalReference } from '@/utils/toyyibpay';

interface UseToyyibPayProps {
  eventId: string;
  eventName: string;
  totalAmount: number;
  customerEmail: string;
  customerPhone: string;
}

export const useToyyibPay = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async ({
    eventId,
    eventName,
    totalAmount,
    customerEmail,
    customerPhone,
  }: UseToyyibPayProps) => {
    console.log('Starting payment creation process...');
    setLoading(true);
    setError(null);

    try {
      // Truncate event name to fit ToyyibPay's 30-character limit for billName
      // "Ticket: " is 8 characters, so we have 22 characters left for the event name
      const maxEventNameLength = 22;
      const truncatedEventName = eventName.length > maxEventNameLength 
        ? eventName.substring(0, maxEventNameLength - 3) + '...' 
        : eventName;
      
      const billConfig = {
        billName: `Ticket: ${truncatedEventName}`, // Will be max 30 chars
        billDescription: `Event ticket purchase for ${eventName}`,
        billAmount: Math.round(totalAmount * 100), // Convert to cents
        billReturnUrl: `${window.location.origin}/payment/success`,
        billCallbackUrl: `${window.location.origin}/api/payment/callback`,
        billExternalReferenceNo: generateBillExternalReference(),
        billTo: 'Customer',
        billEmail: customerEmail,
        billPhone: customerPhone,
        billExpiryDays: 1,
      };

      console.log('Creating ToyyibPay bill with config:', billConfig);
      console.log('Bill name length:', billConfig.billName.length);

      const response = await createToyyibPayBill(billConfig);
      
      console.log('ToyyibPay response received:', response);
      
      if (response.billpaymentUrl) {
        console.log('Redirecting to payment URL:', response.billpaymentUrl);
        // Redirect to ToyyibPay payment page
        window.location.href = response.billpaymentUrl;
      } else {
        throw new Error('No payment URL received from ToyyibPay');
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
