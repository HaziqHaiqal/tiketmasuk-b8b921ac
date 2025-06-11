
import React from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import EventBanner from './EventBanner';
import { Skeleton } from '@/components/ui/skeleton';

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
            <EventBanner
              id={event.id}
              title={event.title}
              description={event.description || ''}
              date={event.date}
              location={event.location}
              price={event.price}
              image={event.image || '/placeholder.svg'}
              category={event.category}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
};

export default EventCarousel;
