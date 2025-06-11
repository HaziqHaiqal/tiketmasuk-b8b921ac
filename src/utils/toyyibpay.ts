interface ToyyibPayConfig {
  categoryCode: string;
  billName: string;
  billDescription: string;
  billAmount: number;
  billReturnUrl: string;
  billCallbackUrl: string;
  billExternalReferenceNo: string;
  billTo: string;
  billEmail: string;
  billPhone: string;
  billSplitPayment?: number;
  billSplitPaymentArgs?: string;
  billPaymentChannel?: string;
  billContentEmail?: string;
  billChargeToCustomer?: number;
  billExpiryDate?: string;
  billExpiryDays?: number;
}

interface ToyyibPayResponse {
  billCode: string;
  billpaymentUrl: string;
}

export const createToyyibPayBill = async (config: ToyyibPayConfig): Promise<ToyyibPayResponse> => {
  // This would be implemented as a Supabase Edge Function to keep API key secure
  const response = await fetch('/api/toyyibpay/create-bill', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error('Failed to create ToyyibPay bill');
  }

  return response.json();
};

export const getBillStatus = async (billCode: string): Promise<any> => {
  // This would also be implemented as a Supabase Edge Function
  const response = await fetch(`/api/toyyibpay/bill-status/${billCode}`);
  
  if (!response.ok) {
    throw new Error('Failed to get bill status');
  }

  return response.json();
};

export const generateBillExternalReference = (): string => {
  return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
