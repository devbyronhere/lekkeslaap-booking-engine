import { CheckCircle2Icon, XCircleIcon, Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/Stores/useBookingStore';
import { useBookingStatus } from '@/hooks/useBookingStatus';
import { calculateNights, calculatePrice } from '@/lib/utils/calculatePrice';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Separator } from '@/Components/ui/separator';
import { DatePairDisplay } from './DatePairDisplay';
import type { PropertyData } from '@/types/property';

interface StatusStepProps {
  propertyData: PropertyData;
}

export function StatusStep({ propertyData }: StatusStepProps) {
  const { bookingId, checkIn, checkOut, rooms, specialRequests, goToStep, reset } =
    useBookingStore();
  const { status, confirmationId, isPolling } = useBookingStatus(bookingId);
  const { units, property } = propertyData;
  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0;
  const breakdown = calculatePrice(rooms, units, nights, property.tax_rate);

  const handleTryAgain = () => {
    goToStep(3);
  };

  const handleNewBooking = () => {
    reset();
  };

  // Pending state
  if (status === 'pending' || isPolling) {
    return (
      <div className={cn('flex flex-col items-center justify-center space-y-4 py-12')}>
        <Loader2Icon className={cn('h-12 w-12 animate-spin text-primary')} />
        <h2 className={cn('text-xl font-semibold')}>Processing your booking...</h2>
        <p className={cn('text-sm text-muted-foreground')}>
          This may take a moment. Please do not close this page.
        </p>
      </div>
    );
  }

  // Failed state
  if (status === 'failed') {
    return (
      <div className={cn('flex flex-col items-center justify-center space-y-4 py-12')}>
        <XCircleIcon className={cn('h-12 w-12 text-destructive')} />
        <h2 className={cn('text-xl font-semibold')}>Booking failed</h2>
        <p className={cn('text-sm text-muted-foreground')}>
          Something went wrong while processing your booking. Please try again.
        </p>
        <div className={cn('flex gap-3')}>
          <Button variant="outline" size="lg" onClick={handleNewBooking}>
            Start Over
          </Button>
          <Button size="lg" onClick={handleTryAgain}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Confirmed state
  return (
    <div className={cn('space-y-6')}>
      <div className={cn('flex flex-col items-center space-y-4 py-8')}>
        <CheckCircle2Icon className={cn('h-12 w-12 text-green-600')} />
        <h2 className={cn('text-xl font-semibold')}>Booking confirmed!</h2>
        {confirmationId && (
          <p className={cn('text-sm text-muted-foreground')}>
            Confirmation ID:{' '}
            <span className={cn('font-mono font-medium text-foreground')}>
              {confirmationId}
            </span>
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className={cn('space-y-4')}>
          <DatePairDisplay checkIn={checkIn} checkOut={checkOut} />

          <Separator />

          {breakdown.lineItems.map((item) => (
            <div
              key={item.unitName}
              className={cn('flex items-center justify-between text-sm')}
            >
              <span>
                {item.unitName} x {item.quantity}
              </span>
              <span className={cn('font-medium')}>
                {formatCurrency(item.lineTotal)}
              </span>
            </div>
          ))}

          <Separator />

          <div className={cn('flex justify-between text-lg font-semibold')}>
            <span>Total</span>
            <span>{formatCurrency(breakdown.total)}</span>
          </div>

          {specialRequests && (
            <>
              <Separator />
              <div>
                <p className={cn('text-sm text-muted-foreground')}>Special Requests</p>
                <p className={cn('mt-1 text-sm')}>{specialRequests}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className={cn('flex justify-center')}>
        <Button size="lg" onClick={handleNewBooking}>
          Make Another Booking
        </Button>
      </div>
    </div>
  );
}
