import { Head, Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Button } from '@/Components/ui/button';
import { BookingWizard } from '@/Components/Booking/BookingWizard';
import type { PropertyData } from '@/types/property';
import type { PageProps } from '@/types';

interface BookingPageProps extends PageProps {
  propertyData: PropertyData;
}

export default function BookingIndex() {
  const { propertyData, auth } = usePage<BookingPageProps>().props;
  const heroImage = propertyData.property.pictures[0];
  const currentUser = auth.user ?? null;

  const authButtons = currentUser ? (
    <Link href={route('logout')} method="post" as="button">
      <Button size="default" className={cn('bg-white text-brand-orange hover:bg-white/90')}>
        Sign Out
      </Button>
    </Link>
  ) : (
    <div className={cn('flex items-center gap-2')}>
      <Link href={route('register')}>
        <Button size="default" className={cn('bg-white text-brand-orange hover:bg-white/90')}>
          Sign Up
        </Button>
      </Link>
      <Link href={route('login')}>
        <Button size="default" className={cn('bg-brand-orange text-white hover:bg-brand-orange/90')}>
          Sign In
        </Button>
      </Link>
    </div>
  );

  return (
    <>
      <Head title={`Book - ${propertyData.property.name}`} />

      <div className={cn('min-h-screen bg-background')}>
        {/* Property header */}
        <header className={cn('relative')}>
          {heroImage ? (
            <div className={cn('relative h-48 w-full overflow-hidden sm:h-64')}>
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
              <div className={cn('absolute top-0 right-0 p-4 z-10')}>
                {authButtons}
              </div>
              <div className={cn('absolute bottom-0 left-0 right-0 mx-auto max-w-3xl px-4 pb-6')}>
                <h1 className={cn('text-2xl font-bold text-white sm:text-3xl')}>
                  {propertyData.property.name}
                </h1>
              </div>
            </div>
          ) : (
            <div className={cn('relative mx-auto max-w-3xl px-4 py-6')}>
              <h1 className={cn('text-2xl font-bold text-foreground sm:text-3xl')}>
                {propertyData.property.name}
              </h1>
              <div className={cn('absolute top-0 right-0 p-4')}>
                {authButtons}
              </div>
            </div>
          )}
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
