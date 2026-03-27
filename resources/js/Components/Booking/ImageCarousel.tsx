import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/Components/ui/carousel';

interface ImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export function ImageCarousel({ images, alt, className }: ImageCarouselProps) {
  if (images.length === 0) return null;

  return (
    <Carousel className={cn('group relative', className)} opts={{ loop: true }}>
      <CarouselContent>
        {images.map((src, i) => (
          <CarouselItem key={i}>
            <img
              src={src}
              alt={`${alt} - photo ${i + 1} of ${images.length}`}
              className={cn('h-40 w-full object-cover')}
              loading="lazy"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      {images.length > 1 && (
        <>
          <CarouselPrevious
            className={cn(
              'absolute left-2 h-7 w-7 border-0 bg-black/40 text-white hover:bg-black/60 hover:text-white opacity-0 transition-opacity group-hover:opacity-100'
            )}
          />
          <CarouselNext
            className={cn(
              'absolute right-2 h-7 w-7 border-0 bg-black/40 text-white hover:bg-black/60 hover:text-white opacity-0 transition-opacity group-hover:opacity-100'
            )}
          />
        </>
      )}
    </Carousel>
  );
}
