import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { roomSchema, type RoomFormValues } from '@/lib/schemas';
import { useBookingStore } from '@/Stores/useBookingStore';
import { calculateNights, calculatePrice } from '@/lib/utils/calculatePrice';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { MinusIcon, PlusIcon, UsersIcon } from 'lucide-react';
import type { PropertyData, Unit } from '@/types/property';

interface RoomStepProps {
  propertyData: PropertyData;
}

export function RoomStep({ propertyData }: RoomStepProps) {
  const { checkIn, checkOut, rooms: storedRooms, setRooms, nextStep, prevStep } = useBookingStore();
  const { units, property } = propertyData;
  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0;

  const defaultRooms = units.map((unit) => {
    const existing = storedRooms.find((r) => r.unitId === unit.id);
    return existing ?? { unitId: unit.id, quantity: 0, guests: 0 };
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: { rooms: defaultRooms },
  });

  const { fields } = useFieldArray({ control, name: 'rooms' });
  const watchedRooms = watch('rooms');

  const breakdown = calculatePrice(watchedRooms, units, nights, property.tax_rate);

  const onSubmit = (data: RoomFormValues) => {
    setRooms(data.rooms.filter((r) => r.quantity > 0));
    nextStep();
  };

  const handleQuantityChange = (index: number, delta: number, unit: Unit) => {
    const current = watchedRooms[index].quantity;
    const newQty = Math.max(0, Math.min(current + delta, unit.available_count));
    setValue(`rooms.${index}.quantity`, newQty, { shouldValidate: true });

    // Reset guests when quantity goes to 0
    if (newQty === 0) {
      setValue(`rooms.${index}.guests`, 0);
    }
    // Set default guest count when first adding a room
    if (current === 0 && newQty > 0) {
      setValue(`rooms.${index}.guests`, 1);
    }
  };

  const handleGuestChange = (index: number, delta: number, unit: Unit) => {
    const current = watchedRooms[index].guests;
    const newGuests = Math.max(1, Math.min(current + delta, unit.max_guests));
    setValue(`rooms.${index}.guests`, newGuests, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6')}>
      <h2 className={cn('text-xl font-semibold')}>Select your rooms</h2>

      {errors.rooms?.root && (
        <p className={cn('text-sm text-destructive')} role="alert">
          {errors.rooms.root.message}
        </p>
      )}

      <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-2')}>
        {fields.map((field, index) => {
          const unit = units.find((u) => u.id === field.unitId);
          if (!unit) return null;

          const qty = watchedRooms[index]?.quantity ?? 0;
          const guests = watchedRooms[index]?.guests ?? 0;

          // Calculate line total for this room
          const lineTotal =
            unit.pricing_model === 'per_unit'
              ? unit.price * nights * qty
              : unit.price * guests * nights * qty;

          return (
            <Card key={field.id}>
              {unit.pictures[0] && (
                <img
                  src={unit.pictures[0]}
                  alt={unit.name}
                  className={cn('h-40 w-full object-cover')}
                />
              )}
              <CardHeader>
                <div className={cn('flex items-start justify-between')}>
                  <CardTitle>{unit.name}</CardTitle>
                  <Badge variant="secondary">
                    {unit.available_count} available
                  </Badge>
                </div>
                <CardDescription>
                  {formatCurrency(unit.price)}{' '}
                  {unit.pricing_model === 'per_unit'
                    ? 'per room / night'
                    : 'per person / night'}
                  {' - '}Up to {unit.max_guests}{' '}
                  {unit.max_guests === 1 ? 'guest' : 'guests'}
                </CardDescription>
              </CardHeader>
              <CardContent className={cn('space-y-4')}>
                {/* Quantity selector */}
                <div className={cn('space-y-2')}>
                  <Label>Rooms</Label>
                  <div className={cn('flex items-center gap-3')}>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className={cn('min-h-[44px] min-w-[44px]')}
                      onClick={() => handleQuantityChange(index, -1, unit)}
                      disabled={qty === 0}
                      aria-label={`Decrease ${unit.name} quantity`}
                    >
                      <MinusIcon className={cn('h-4 w-4')} />
                    </Button>
                    <span
                      className={cn('w-8 text-center text-lg font-medium')}
                      aria-live="polite"
                      aria-label={`${qty} ${unit.name} rooms selected`}
                    >
                      {qty}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className={cn('min-h-[44px] min-w-[44px]')}
                      onClick={() => handleQuantityChange(index, 1, unit)}
                      disabled={qty >= unit.available_count}
                      aria-label={`Increase ${unit.name} quantity`}
                    >
                      <PlusIcon className={cn('h-4 w-4')} />
                    </Button>
                  </div>
                </div>

                {/* Guest count - shown when quantity > 0 */}
                {qty > 0 && (
                  <div className={cn('space-y-2')}>
                    <Label>
                      <UsersIcon className={cn('inline h-4 w-4')} /> Guests per
                      room
                    </Label>
                    <div className={cn('flex items-center gap-3')}>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={cn('min-h-[44px] min-w-[44px]')}
                        onClick={() => handleGuestChange(index, -1, unit)}
                        disabled={guests <= 1}
                        aria-label={`Decrease guests for ${unit.name}`}
                      >
                        <MinusIcon className={cn('h-4 w-4')} />
                      </Button>
                      <span
                        className={cn('w-8 text-center text-lg font-medium')}
                        aria-live="polite"
                        aria-label={`${guests} guests per ${unit.name}`}
                      >
                        {guests}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className={cn('min-h-[44px] min-w-[44px]')}
                        onClick={() => handleGuestChange(index, 1, unit)}
                        disabled={guests >= unit.max_guests}
                        aria-label={`Increase guests for ${unit.name}`}
                      >
                        <PlusIcon className={cn('h-4 w-4')} />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Line total */}
                {qty > 0 && (
                  <div
                    className={cn(
                      'rounded-md bg-muted px-3 py-2 text-sm font-medium'
                    )}
                  >
                    {formatCurrency(lineTotal)}
                    <span className={cn('text-muted-foreground')}>
                      {' '}
                      for {nights} {nights === 1 ? 'night' : 'nights'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Running total */}
      {breakdown.subtotal > 0 && (
        <>
          <Separator />
          <div className={cn('space-y-1 text-right')}>
            <p className={cn('text-sm text-muted-foreground')}>
              Subtotal: {formatCurrency(breakdown.subtotal)}
            </p>
            <p className={cn('text-sm text-muted-foreground')}>
              VAT ({(breakdown.taxRate * 100).toFixed(0)}%):{' '}
              {formatCurrency(breakdown.taxAmount)}
            </p>
            <p className={cn('text-lg font-semibold')}>
              Total: {formatCurrency(breakdown.total)}
            </p>
          </div>
        </>
      )}

      <div className={cn('flex justify-between')}>
        <Button type="button" variant="outline" size="lg" onClick={prevStep}>
          Back
        </Button>
        <Button type="submit" size="lg">
          Next: Review Booking
        </Button>
      </div>
    </form>
  );
}
