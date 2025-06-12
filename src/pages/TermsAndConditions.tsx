
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield } from 'lucide-react';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Shield className="w-6 h-6 mr-3" />
              Terms and Conditions
            </CardTitle>
            <p className="text-gray-600">Last updated: June 12, 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h3>
                <p className="text-gray-700">
                  By purchasing tickets through our platform, you agree to be bound by these Terms and Conditions. 
                  If you do not agree to these terms, please do not proceed with your purchase.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">2. Ticket Purchase and Payment</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>All ticket sales are final unless otherwise specified by the event organizer</li>
                  <li>Payment must be made in full at the time of purchase</li>
                  <li>Ticket prices are subject to change without prior notice</li>
                  <li>Processing fees may apply and are non-refundable</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">3. Event Entry Requirements</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Valid government-issued photo ID is required for entry</li>
                  <li>The name on the ticket must match the name on the ID</li>
                  <li>Tickets are non-transferable unless explicitly stated otherwise</li>
                  <li>Entry may be refused if proper identification is not provided</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">4. Refund and Cancellation Policy</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Refunds are only available if the event is cancelled by the organizer</li>
                  <li>In case of event postponement, tickets remain valid for the new date</li>
                  <li>No refunds will be given for failure to attend the event</li>
                  <li>Processing fees are non-refundable in all circumstances</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">5. Event Changes</h3>
                <p className="text-gray-700">
                  Event organizers reserve the right to make changes to the event schedule, venue, 
                  or lineup without prior notice. Such changes do not entitle ticket holders to a refund.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">6. Liability and Risk</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Attendees participate in events at their own risk</li>
                  <li>The platform and event organizers are not liable for personal injury or property damage</li>
                  <li>Attendees are responsible for their own safety and well-being</li>
                  <li>Medical conditions should be disclosed if they may affect participation</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">7. Prohibited Items and Behavior</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Weapons, illegal substances, and dangerous items are strictly prohibited</li>
                  <li>Disruptive behavior may result in ejection without refund</li>
                  <li>Recording devices may be prohibited depending on the event</li>
                  <li>Outside food and beverages may not be permitted</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">8. Contact Information</h3>
                <p className="text-gray-700">
                  For questions regarding these terms, please contact our customer support team 
                  through the contact information provided on our website.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions;
