
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Star } from 'lucide-react';

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  image: string;
  category: string;
  attendees: number;
  rating: number;
  vendor: string;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  title,
  description,
  date,
  location,
  price,
  image,
  category,
  attendees,
  rating,
  vendor
}) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <Link to={`/event/${id}`}>
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Badge className="absolute top-3 left-3 bg-blue-600">
            {category}
          </Badge>
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center">
            <Star className="w-3 h-3 text-yellow-500 mr-1" />
            <span className="text-xs font-medium">{rating}</span>
          </div>
        </div>
      </Link>
      
      <CardContent className="p-4">
        <Link to={`/event/${id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">{title}</h3>
        </Link>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2" />
            {new Date(date).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="w-4 h-4 mr-2" />
            {location}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2" />
            {attendees} attending
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-blue-600">
              ${price}
            </div>
            <div className="text-xs text-gray-500">by {vendor}</div>
          </div>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
            <Link to={`/event/${id}`}>
              Get Tickets
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
