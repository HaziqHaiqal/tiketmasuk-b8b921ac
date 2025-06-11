
import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, ArrowLeft } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const billCode = searchParams.get('billcode');
  const status = searchParams.get('status_id');

  useEffect(() => {
    // Here you would typically verify the payment status with ToyyibPay
    // and update your database accordingly
    console.log('Payment callback received:', { billCode, status });
  }, [billCode, status]);

  const isSuccess = status === '1'; // ToyyibPay success status

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
              isSuccess ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <CheckCircle className={`w-8 h-8 ${
                isSuccess ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <CardTitle className="text-2xl">
              {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {isSuccess ? (
              <>
                <p className="text-gray-600">
                  Your ticket purchase has been completed successfully. You will receive a confirmation email shortly.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-medium">Bill Code: {billCode}</p>
                  <p className="text-green-700 text-sm mt-1">
                    Keep this reference number for your records.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    Download Ticket
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/browse">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Events
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600">
                  Unfortunately, your payment could not be processed. Please try again.
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">Error Code: {status}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                    <Link to={`/event/${searchParams.get('event_id') || ''}`}>
                      Try Again
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/browse">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Events
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentSuccess;
