
interface ToyyibPayConfig {
  billName: string;
  billDescription: string;
  billAmount: number;
  billReturnUrl: string;
  billCallbackUrl: string;
  billExternalReferenceNo: string;
  billTo: string;
  billEmail: string;
  billPhone: string;
  billExpiryDays?: number;
}

interface ToyyibPayResponse {
  billCode: string;
  billpaymentUrl: string;
  success: boolean;
}

export const createToyyibPayBill = async (config: ToyyibPayConfig): Promise<ToyyibPayResponse> => {
  const response = await fetch('/functions/v1/toyyibpay-create-bill', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create ToyyibPay bill: ${errorText}`);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to create payment');
  }

  return result;
};

export const getBillStatus = async (billCode: string): Promise<any> => {
  const response = await fetch(`/functions/v1/toyyibpay-bill-status/${billCode}`, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to get bill status');
  }

  return response.json();
};

export const generateBillExternalReference = (): string => {
  return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
