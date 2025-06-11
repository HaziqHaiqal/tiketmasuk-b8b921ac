
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useEventImages } from '@/hooks/useEventImages';
import { Skeleton } from '@/components/ui/skeleton';
import { Images } from 'lucide-react';

interface EventImageGalleryProps {
  eventId: string;
}

const EventImageGallery: React.FC<EventImageGalleryProps> = ({ eventId }) => {
  const { data: images, isLoading } = useEventImages(eventId);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Images className="w-5 h-5 mr-2" />
            Event Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!images || images.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Images className="w-5 h-5 mr-2" />
            Event Gallery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Images className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No images available for this event</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Images className="w-5 h-5 mr-2" />
            Event Gallery
          </div>
          <Badge variant="secondary">{images.length} images</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image) => (
            <Dialog key={image.id}>
              <DialogTrigger asChild>
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={image.image_url}
                      alt={image.description}
                      className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{image.description}</p>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <div className="space-y-4">
                  <img
                    src={image.image_url}
                    alt={image.description}
                    className="w-full max-h-96 object-contain rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{image.description}</h3>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventImageGallery;
