
import { supabase } from '@/integrations/supabase/client';

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
  console.log('Calling ToyyibPay create bill function with config:', config);
  
  const { data, error } = await supabase.functions.invoke('toyyibpay-create-bill', {
    body: config,
  });

  console.log('ToyyibPay function response:', { data, error });

  if (error) {
    console.error('ToyyibPay function error:', error);
    throw new Error(`Failed to create ToyyibPay bill: ${error.message}`);
  }

  if (!data || !data.success) {
    console.error('ToyyibPay API error:', data);
    throw new Error(data?.error || 'Failed to create payment');
  }

  return data;
};

export const getBillStatus = async (billCode: string): Promise<any> => {
  console.log('Getting bill status for:', billCode);
  
  const { data, error } = await supabase.functions.invoke('toyyibpay-bill-status', {
    body: { billCode },
  });

  if (error) {
    console.error('Bill status error:', error);
    throw new Error('Failed to get bill status');
  }

  return data;
};

export const generateBillExternalReference = (): string => {
  return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
