
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string;
  price: number;
  image: string | null;
  category: string;
}

interface EventCarouselProps {
  events: Event[];
  loading: boolean;
}

const EventCarousel: React.FC<EventCarouselProps> = ({ events, loading }) => {
  if (loading) {
    return (
      <div className="w-full">
        <Skeleton className="h-64 md:h-80 lg:h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="w-full h-64 md:h-80 lg:h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-600">No featured events available</p>
      </div>
    );
  }

  return (
    <Carousel className="w-full" opts={{ align: "start", loop: true }}>
      <CarouselContent>
        {events.map((event) => (
          <CarouselItem key={event.id}>
            <Link to={`/event/${event.id}`} className="block relative group">
              <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg">
                <img
                  src={event.image || '/placeholder.svg'}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <Badge className="absolute top-4 left-4 bg-blue-600">
                  {event.category}
                </Badge>
                
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 line-clamp-2">
                    {event.title}
                  </h2>
                  <p className="text-sm md:text-base mb-3 line-clamp-2 opacity-90">
                    {event.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg md:text-xl font-bold">
                        From RM {event.price}
                      </div>
                      <div className="text-xs opacity-75">per person</div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
};

export default EventCarousel;
