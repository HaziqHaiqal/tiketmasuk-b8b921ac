
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Scan } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface TicketInfo {
  ticket_number: string;
  event: {
    name: string;
    location: string;
    event_date: number;
  };
  profiles: {
    name: string;
    email: string;
  };
  kit_collected: boolean;
  status: string;
}

const QRScanner = () => {
  const [qrData, setQrData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const { profile } = useAuth();

  const handleVerify = async (action: 'verify' | 'collect_kit') => {
    if (!qrData.trim()) {
      toast.error('Please enter QR code data');
      return;
    }

    if (!profile?.id) {
      toast.error('Authentication required');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-ticket', {
        body: {
          qrData: qrData.trim(),
          organizerId: profile.id,
          action
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setTicketInfo(data.ticket);
      toast.success(data.message);

      if (action === 'collect_kit') {
        // Update local state to reflect kit collection
        setTicketInfo(prev => prev ? { ...prev, kit_collected: true } : null);
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error(error.message || 'Failed to verify ticket');
      setTicketInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
    setQrData('');
    setTicketInfo(null);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="w-6 h-6" />
            QR Code Scanner
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              QR Code Data (paste here)
            </label>
            <Textarea
              value={qrData}
              onChange={(e) => setQrData(e.target.value)}
              placeholder="Paste QR code data here..."
              rows={4}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => handleVerify('verify')} 
              disabled={isLoading || !qrData.trim()}
              className="flex-1"
            >
              {isLoading ? 'Verifying...' : 'Verify Ticket'}
            </Button>
            <Button 
              onClick={() => handleVerify('collect_kit')} 
              disabled={isLoading || !qrData.trim() || (ticketInfo && ticketInfo.kit_collected)}
              variant="outline"
              className="flex-1"
            >
              Mark Kit Collected
            </Button>
          </div>

          {qrData && (
            <Button 
              onClick={resetScanner} 
              variant="ghost" 
              className="w-full"
            >
              Reset Scanner
            </Button>
          )}
        </CardContent>
      </Card>

      {ticketInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              Ticket Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Ticket Number</p>
                <p className="font-mono">{ticketInfo.ticket_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <Badge variant={ticketInfo.status === 'active' ? 'default' : 'destructive'}>
                  {ticketInfo.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Event</p>
                <p>{ticketInfo.event.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Date</p>
                <p>{new Date(ticketInfo.event.event_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p>{ticketInfo.event.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Kit Status</p>
                <div className="flex items-center gap-2">
                  {ticketInfo.kit_collected ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Collected</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-red-600">Not Collected</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm font-medium text-gray-500">Participant</p>
              <p>{ticketInfo.profiles.name}</p>
              <p className="text-sm text-gray-600">{ticketInfo.profiles.email}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRScanner;
