
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, Mail, Phone, Globe, MapPin } from 'lucide-react';

interface Organizer {
  name: string;
  description: string;
  logo: string;
  rating: number;
  eventsCount: number;
  yearsActive: number;
  contact: {
    email: string;
    phone: string;
    website: string;
  };
}

interface EventOrganizerTabProps {
  organizer: Organizer;
}

const EventOrganizerTab: React.FC<EventOrganizerTabProps> = ({ organizer }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Event Organizer</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Organizer Logo & Basic Info */}
            <div className="lg:w-1/3">
              <div className="text-center">
                <img
                  src={organizer.logo}
                  alt={organizer.name}
                  className="w-32 h-32 rounded-lg mx-auto mb-4 object-cover border"
                />
                <h3 className="text-xl font-bold mb-2">{organizer.name}</h3>
                <div className="flex items-center justify-center mb-2">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="font-semibold">{organizer.rating}</span>
                  <span className="text-gray-600 ml-1">rating</span>
                </div>
                <div className="flex justify-center space-x-4 text-sm text-gray-600">
                  <div className="text-center">
                    <p className="font-semibold text-lg text-blue-600">{organizer.eventsCount}</p>
                    <p>Events</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg text-blue-600">{organizer.yearsActive}</p>
                    <p>Years Active</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Organizer Details */}
            <div className="lg:w-2/3">
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-3">About the Organizer</h4>
                  <p className="text-gray-700">{organizer.description}</p>
                </div>

                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">{organizer.contact.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">{organizer.contact.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Globe className="w-4 h-4 text-gray-600" />
                      <a 
                        href={`https://${organizer.contact.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {organizer.contact.website}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Verification Badges */}
                <div>
                  <h4 className="font-semibold mb-3">Verification</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      ✓ Verified Organizer
                    </Badge>
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      ✓ Trusted Partner
                    </Badge>
                    <Badge variant="outline" className="text-purple-600 border-purple-600">
                      ✓ Premium Organizer
                    </Badge>
                  </div>
                </div>

                {/* Recent Events or Additional Info */}
                <div>
                  <h4 className="font-semibold mb-3">Organizer Highlights</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">Organizes monthly events</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">Top-rated event organizer</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">Events across Malaysia</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-700">Award-winning events</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventOrganizerTab;
