
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock } from 'lucide-react';

const PrivacyPolicy = () => {
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
              <Lock className="w-6 h-6 mr-3" />
              Privacy Policy
            </CardTitle>
            <p className="text-gray-600">Last updated: June 12, 2025</p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6">
              <section>
                <h3 className="text-xl font-semibold mb-3">1. Information We Collect</h3>
                <p className="text-gray-700 mb-3">We collect the following types of information:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Personal Information:</strong> Name, email address, phone number, date of birth</li>
                  <li><strong>Identification:</strong> IC/Passport number for verification purposes</li>
                  <li><strong>Address Information:</strong> Country, state, address, and postcode</li>
                  <li><strong>Payment Information:</strong> Payment details processed securely through our payment partners</li>
                  <li><strong>Event Preferences:</strong> Product selections and event-related choices</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">2. How We Use Your Information</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Process ticket purchases and event registrations</li>
                  <li>Verify identity for event entry and security purposes</li>
                  <li>Send important event updates and notifications</li>
                  <li>Provide customer support and respond to inquiries</li>
                  <li>Improve our services and user experience</li>
                  <li>Comply with legal and regulatory requirements</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">3. Information Sharing</h3>
                <p className="text-gray-700 mb-3">We may share your information with:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li><strong>Event Organizers:</strong> Necessary attendee information for event management</li>
                  <li><strong>Payment Processors:</strong> Secure payment processing partners</li>
                  <li><strong>Service Providers:</strong> Third-party vendors who assist in our operations</li>
                  <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
                </ul>
                <p className="text-gray-700 mt-3">
                  We do not sell your personal information to third parties for marketing purposes.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">4. Data Security</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>We use industry-standard encryption to protect your data</li>
                  <li>Payment information is processed through secure, PCI-compliant systems</li>
                  <li>Access to personal information is restricted to authorized personnel only</li>
                  <li>Regular security assessments and updates are conducted</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">5. Data Retention</h3>
                <p className="text-gray-700">
                  We retain your personal information for as long as necessary to provide our services 
                  and comply with legal obligations. Event-related information may be kept for 
                  record-keeping and security purposes for up to 7 years after the event.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">6. Your Rights</h3>
                <p className="text-gray-700 mb-3">You have the right to:</p>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate or incomplete information</li>
                  <li>Request deletion of your personal information (subject to legal requirements)</li>
                  <li>Object to processing of your personal information</li>
                  <li>Request data portability</li>
                </ul>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">7. Cookies and Tracking</h3>
                <p className="text-gray-700">
                  We use cookies and similar technologies to improve your browsing experience, 
                  analyze site traffic, and personalize content. You can control cookie preferences 
                  through your browser settings.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">8. International Data Transfers</h3>
                <p className="text-gray-700">
                  Your information may be transferred to and processed in countries other than your 
                  country of residence. We ensure appropriate safeguards are in place to protect 
                  your information during such transfers.
                </p>
              </section>

              <section>
                <h3 className="text-xl font-semibold mb-3">9. Contact Us</h3>
                <p className="text-gray-700">
                  If you have any questions about this Privacy Policy or wish to exercise your rights, 
                  please contact our Data Protection Officer through the contact information provided 
                  on our website.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
