
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
    setLoading(true);
    setError(null);

    try {
      const billConfig = {
        billName: `Ticket for ${eventName}`,
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

      const response = await createToyyibPayBill(billConfig);
      
      console.log('ToyyibPay response:', response);
      
      // Redirect to ToyyibPay payment page
      window.location.href = response.billpaymentUrl;
      
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
