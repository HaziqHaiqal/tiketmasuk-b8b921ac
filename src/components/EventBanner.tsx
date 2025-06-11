
import React from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';

interface EventBannerProps {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  image: string;
  category: string;
}

const EventBanner: React.FC<EventBannerProps> = ({
  id,
  title,
  description,
  date,
  location,
  price,
  image,
  category
}) => {
  return (
    <Link to={`/event/${id}`} className="block relative group">
      <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg">
        <img
          src={image || '/placeholder.svg'}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        <Badge className="absolute top-4 left-4 bg-blue-600">
          {category}
        </Badge>
        
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 line-clamp-2">
            {title}
          </h2>
          <p className="text-sm md:text-base mb-3 line-clamp-2 opacity-90">
            {description}
          </p>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-2" />
                {location}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg md:text-xl font-bold">
                From RM {price}
              </div>
              <div className="text-xs opacity-75">per person</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default EventBanner;
