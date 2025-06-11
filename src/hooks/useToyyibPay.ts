
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
        categoryCode: process.env.TOYYIBPAY_CATEGORY_CODE || '',
        billName: `Ticket for ${eventName}`,
        billDescription: `Event ticket purchase for ${eventName}`,
        billAmount: totalAmount * 100, // ToyyibPay expects amount in cents
        billReturnUrl: `${window.location.origin}/payment/success`,
        billCallbackUrl: `${window.location.origin}/api/payment/callback`,
        billExternalReferenceNo: generateBillExternalReference(),
        billTo: 'Customer',
        billEmail: customerEmail,
        billPhone: customerPhone,
        billExpiryDays: 1, // 1 day expiry
      };

      const response = await createToyyibPayBill(billConfig);
      
      // Redirect to ToyyibPay payment page
      window.location.href = response.billpaymentUrl;
      
      return response;
    } catch (err) {
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
