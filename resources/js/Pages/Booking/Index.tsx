import { Head, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { BookingWizard } from '@/Components/Booking/BookingWizard';
import type { PropertyData } from '@/types/property';
import type { PageProps } from '@/types';

interface BookingPageProps extends PageProps {
  propertyData: PropertyData;
}

export default function BookingIndex() {
  const { propertyData, auth } = usePage<BookingPageProps>().props;
  const heroImage = propertyData.property.pictures[0];

  return (
    <>
      <Head title={`Book - ${propertyData.property.name}`} />

      <div className={cn('min-h-screen bg-background')}>
        {/* Property header */}
        <header className={cn('relative')}>
          {heroImage && (
            <div className={cn('h-48 w-full overflow-hidden sm:h-64')}>
              <img
                src={heroImage}
                alt={propertyData.property.name}
                className={cn('h-full w-full object-cover')}
              />
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-t from-black/60 to-transparent'
                )}
              />
            </div>
          )}
          <div
            className={cn(
              'relative mx-auto max-w-3xl px-4 py-6',
              heroImage && '-mt-16'
            )}
          >
            <h1
              className={cn(
                'text-2xl font-bold sm:text-3xl',
                heroImage ? 'text-white' : 'text-foreground'
              )}
            >
              {propertyData.property.name}
            </h1>
          </div>
        </header>

        {/* Booking wizard */}
        <main className={cn('mx-auto max-w-3xl px-4 py-8')}>
          <BookingWizard
            propertyData={propertyData}
            auth={{ user: auth.user ?? null }}
          />
        </main>
      </div>
    </>
  );
}
