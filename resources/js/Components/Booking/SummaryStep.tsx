import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { InfoIcon, LogInIcon, Loader2Icon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBookingStore } from '@/Stores/useBookingStore';
import { calculateNights, calculatePrice } from '@/lib/utils/calculatePrice';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { Separator } from '@/Components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/Components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/Components/ui/tooltip';
import type { PropertyData } from '@/types/property';
import type { User } from '@/types';

const MAX_SPECIAL_REQUESTS_LENGTH = 500;

interface SummaryStepProps {
  propertyData: PropertyData;
  auth: { user: User | null };
}

export function SummaryStep({ propertyData, auth }: SummaryStepProps) {
  const {
    checkIn,
    checkOut,
    rooms,
    specialRequests,
    setSpecialRequests,
    setBookingId,
    prevStep,
    goToStep,
  } = useBookingStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { units, property } = propertyData;
  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0;
  const breakdown = calculatePrice(rooms, units, nights, property.tax_rate);
  const isAuthenticated = !!auth.user;

  const handleConfirm = () => {
    if (!checkIn || !checkOut || !isAuthenticated) return;

    setIsSubmitting(true);
    setError(null);

    router.post(
      '/bookings',
      {
        checkIn,
        checkOut,
        rooms: rooms.map((r) => ({
          unitId: r.unitId,
          quantity: r.quantity,
          guests: r.guests,
        })),
        specialRequests,
        submitted_total: breakdown.total,
      },
      {
        onSuccess: (page) => {
          // The booking ID should be in the response flash or props
          const bookingId = (page.props as Record<string, unknown>).bookingId as number | undefined;
          if (bookingId) {
            setBookingId(bookingId);
          }
          goToStep(5);
        },
        onError: (errors) => {
          setIsSubmitting(false);
          // 422 validation errors
          const messages = Object.values(errors);
          setError(messages.join('. '));
        },
        onFinish: () => {
          setIsSubmitting(false);
        },
      }
    );
  };

  return (
    <div className={cn('space-y-6')}>
      <h2 className={cn('text-xl font-semibold')}>Review your booking</h2>

      <Card>
        <CardHeader>
          <CardTitle>Booking Details</CardTitle>
        </CardHeader>
        <CardContent className={cn('space-y-4')}>
          {/* Dates */}
          <div className={cn('grid grid-cols-2 gap-4')}>
            <div>
              <p className={cn('text-sm text-muted-foreground')}>Check-in</p>
              <p className={cn('font-medium')}>
                {checkIn ? format(new Date(checkIn), 'PPP') : '-'}
              </p>
            </div>
            <div>
              <p className={cn('text-sm text-muted-foreground')}>Check-out</p>
              <p className={cn('font-medium')}>
                {checkOut ? format(new Date(checkOut), 'PPP') : '-'}
              </p>
            </div>
          </div>
          <p className={cn('text-sm text-muted-foreground')}>
            {nights} {nights === 1 ? 'night' : 'nights'}
          </p>

          <Separator />

          {/* Room breakdown */}
          <div className={cn('space-y-3')}>
            <p className={cn('font-medium')}>Rooms</p>
            {breakdown.lineItems.map((item) => (
              <div
                key={item.unitName}
                className={cn('flex items-center justify-between text-sm')}
              >
                <div>
                  <p className={cn('font-medium')}>{item.unitName}</p>
                  <p className={cn('text-muted-foreground')}>
                    {item.quantity} {item.quantity === 1 ? 'room' : 'rooms'}
                    {item.pricingModel === 'per_person' &&
                      `, ${item.guests} ${item.guests === 1 ? 'guest' : 'guests'} each`}
                    {' x '}
                    {item.nights} {item.nights === 1 ? 'night' : 'nights'}
                  </p>
                </div>
                <p className={cn('font-medium')}>{formatCurrency(item.lineTotal)}</p>
              </div>
            ))}
          </div>

          <Separator />

          {/* Price totals */}
          <div className={cn('space-y-1')}>
            <div className={cn('flex justify-between text-sm')}>
              <span className={cn('text-muted-foreground')}>Subtotal</span>
              <span>{formatCurrency(breakdown.subtotal)}</span>
            </div>
            <div className={cn('flex justify-between text-sm')}>
              <span className={cn('text-muted-foreground')}>
                VAT ({(breakdown.taxRate * 100).toFixed(0)}%)
              </span>
              <span>{formatCurrency(breakdown.taxAmount)}</span>
            </div>
            <Separator />
            <div className={cn('flex items-center justify-between text-lg font-semibold')}>
              <span>Total</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={cn('flex cursor-help items-center gap-1')}>
                      {formatCurrency(breakdown.total)}
                      <InfoIcon className={cn('h-4 w-4 text-muted-foreground')} />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    Includes 15% VAT ({formatCurrency(breakdown.taxAmount)})
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special requests */}
      <div className={cn('space-y-2')}>
        <Label htmlFor="specialRequests">
          Special requests (optional)
        </Label>
        <Textarea
          id="specialRequests"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value.slice(0, MAX_SPECIAL_REQUESTS_LENGTH))}
          placeholder="Any special requirements or requests..."
          maxLength={MAX_SPECIAL_REQUESTS_LENGTH}
          aria-describedby="specialRequests-count"
        />
        <p
          id="specialRequests-count"
          className={cn('text-xs text-muted-foreground')}
        >
          {specialRequests.length}/{MAX_SPECIAL_REQUESTS_LENGTH} characters
        </p>
      </div>

      {/* Auth gate */}
      {!isAuthenticated && (
        <Alert>
          <LogInIcon className={cn('h-4 w-4')} />
          <AlertTitle>Sign in to complete your booking</AlertTitle>
          <AlertDescription>
            You need to be logged in to submit a booking. Your selections will
            be saved.{' '}
            <Link href="/login" className={cn('font-medium underline')}>
              Log in
            </Link>{' '}
            or{' '}
            <Link href="/register" className={cn('font-medium underline')}>
              create an account
            </Link>
            .
          </AlertDescription>
        </Alert>
      )}

      {/* Error display */}
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Booking failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className={cn('flex justify-between')}>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={prevStep}
          disabled={isSubmitting}
        >
          Back
        </Button>
        {isAuthenticated && (
          <Button
            type="button"
            size="lg"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2Icon className={cn('mr-2 h-4 w-4 animate-spin')} />
                Submitting...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
