
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface PromotedEvent {
  event_id: string;
  event_name: string;
  event_description: string;
  event_date: number;
  event_location: string;
  event_price: number;
  event_image: string | null;
  promotion_expires_at: string;
}

interface PromotedEventsCarouselProps {
  events: PromotedEvent[];
  loading: boolean;
}

const PromotedEventsCarousel: React.FC<PromotedEventsCarouselProps> = ({ events, loading }) => {
  if (loading) {
    return (
      <div className="w-full">
        <Skeleton className="h-64 md:h-80 lg:h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="w-full h-64 md:h-80 lg:h-96 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Star className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg font-medium">No promoted events available</p>
          <p className="text-gray-500 text-sm">Vendors can promote their events here</p>
        </div>
      </div>
    );
  }

  return (
    <Carousel className="w-full" opts={{ align: "start", loop: true }}>
      <CarouselContent>
        {events.map((event) => (
          <CarouselItem key={event.event_id}>
            <Link to={`/event/${event.event_id}`} className="block">
              <Card className="relative overflow-hidden h-64 md:h-80 lg:h-96 group">
                <div className="absolute inset-0">
                  <img
                    src={event.event_image || '/placeholder.svg'}
                    alt={event.event_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                </div>
                
                <Badge className="absolute top-4 left-4 bg-yellow-500 text-black font-semibold">
                  ⭐ PROMOTED
                </Badge>
                
                <CardContent className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 line-clamp-2">
                    {event.event_name}
                  </h2>
                  <p className="text-sm md:text-base mb-4 line-clamp-2 opacity-90">
                    {event.event_description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.event_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.event_location}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg md:text-xl font-bold">
                        From RM {event.event_price}
                      </div>
                      <div className="text-xs opacity-75">per person</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
};

export default PromotedEventsCarousel;
