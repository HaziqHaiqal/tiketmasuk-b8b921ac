
import React from 'react';
import Header from '@/components/Header';
import QRScanner from '@/components/QRScanner';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const QRScannerPage = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.role !== 'vendor' || profile.approval_status !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">
              This feature is only available to approved vendors.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">QR Code Scanner</h1>
          <p className="text-gray-600 mt-2">
            Scan tickets to verify entry and mark kit collection
          </p>
        </div>
        <QRScanner />
      </div>
    </div>
  );
};

export default QRScannerPage;
