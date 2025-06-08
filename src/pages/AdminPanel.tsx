
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Check, X, Building, Mail, Phone, MapPin, FileText } from 'lucide-react';
import Header from '@/components/Header';

interface PendingVendor {
  id: string;
  name: string;
  email: string;
  business_name: string;
  business_description: string;
  business_address: string;
  business_phone: string;
  business_registration_number: string;
  approval_status: string;
  created_at: string;
}

const AdminPanel = () => {
  const { profile, isAdmin } = useAuth();
  const [pendingVendors, setPendingVendors] = useState<PendingVendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingVendors();
    }
  }, [isAdmin]);

  const fetchPendingVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'vendor')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingVendors(data || []);
    } catch (error) {
      console.error('Error fetching pending vendors:', error);
      toast.error('Failed to load pending vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleVendorApproval = async (vendorId: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approval_status: action })
        .eq('id', vendorId);

      if (error) throw error;

      toast.success(`Vendor ${action} successfully`);
      await fetchPendingVendors();
    } catch (error) {
      console.error('Error updating vendor status:', error);
      toast.error(`Failed to ${action} vendor`);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
            <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Manage vendor approvals and platform settings</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pending Vendor Approvals</span>
                <Badge variant="secondary">{pendingVendors.length} pending</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading pending vendors...</p>
                </div>
              ) : pendingVendors.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No pending vendor approvals</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingVendors.map((vendor) => (
                    <div key={vendor.id} className="border rounded-lg p-6 bg-white">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">{vendor.name}</h3>
                          <div className="flex items-center text-gray-600 mt-1">
                            <Mail className="w-4 h-4 mr-2" />
                            {vendor.email}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {vendor.approval_status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <Building className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-medium">Business Name:</span>
                            <span className="ml-2">{vendor.business_name || 'Not provided'}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-medium">Phone:</span>
                            <span className="ml-2">{vendor.business_phone || 'Not provided'}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-medium">Address:</span>
                            <span className="ml-2">{vendor.business_address || 'Not provided'}</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-gray-500" />
                            <span className="font-medium">Registration #:</span>
                            <span className="ml-2">{vendor.business_registration_number || 'Not provided'}</span>
                          </div>
                        </div>
                      </div>

                      {vendor.business_description && (
                        <div className="mb-6">
                          <h4 className="font-medium mb-2">Business Description:</h4>
                          <p className="text-gray-600 bg-gray-50 p-3 rounded">
                            {vendor.business_description}
                          </p>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <Button
                          onClick={() => handleVendorApproval(vendor.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleVendorApproval(vendor.id, 'rejected')}
                          variant="destructive"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
