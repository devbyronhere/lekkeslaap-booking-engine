import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '@/lib/utils';
import { roomSchema, type RoomFormValues } from '@/lib/schemas';
import { useBookingStore } from '@/Stores/useBookingStore';
import { calculateNights, calculatePrice, calculateLineTotal } from '@/lib/utils/calculatePrice';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Separator } from '@/Components/ui/separator';
import { FieldError } from '@/Components/ui/FieldError';
import { Stepper } from '@/Components/Booking/Stepper';
import { UsersIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { ImageCarousel } from './ImageCarousel';
import type { PropertyData, Unit } from '@/types/property';

interface RoomStepProps {
  propertyData: PropertyData;
}

export function RoomStep({ propertyData }: RoomStepProps) {
  const { checkIn, checkOut, rooms: storedRooms, setRooms, nextStep, prevStep } = useBookingStore();
  const { units, property } = propertyData;
  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0;

  // Track which cards have the per-room guest section expanded
  const [expandedGuests, setExpandedGuests] = useState<Record<number, boolean>>({});

  const defaultRooms = units.map((unit) => {
    const existing = storedRooms.find((r) => r.unitId === unit.id);
    if (existing) {
      return {
        unitId: unit.id,
        quantity: existing.quantity,
        guests: existing.guests,
        guestsPerRoom: existing.guestsPerRoom ?? Array(existing.quantity).fill(
          Math.max(1, Math.floor(existing.guests / existing.quantity))
        ),
      };
    }
    return { unitId: unit.id, quantity: 0, guests: 0, guestsPerRoom: [] as number[] };
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
    const filtered = data.rooms
      .filter((r) => r.quantity > 0)
      .map((r) => ({
        ...r,
        guests: r.guestsPerRoom?.reduce((sum, g) => sum + g, 0) ?? r.guests,
      }));
    setRooms(filtered);
    nextStep();
  };

  const handleQuantityChange = (index: number, delta: number, unit: Unit) => {
    const current = watchedRooms[index].quantity;
    const newQty = Math.max(0, Math.min(current + delta, unit.available_count));
    const currentPerRoom = watchedRooms[index].guestsPerRoom ?? [];

    setValue(`rooms.${index}.quantity`, newQty, { shouldValidate: true });

    if (newQty === 0) {
      setValue(`rooms.${index}.guests`, 0);
      setValue(`rooms.${index}.guestsPerRoom`, []);
      setExpandedGuests((prev) => ({ ...prev, [index]: false }));
    } else if (newQty > current) {
      const base = current === 0 ? [] : currentPerRoom;
      const newPerRoom = [...base, ...Array(newQty - current).fill(1)];
      setValue(`rooms.${index}.guestsPerRoom`, newPerRoom);
      setValue(`rooms.${index}.guests`, newPerRoom.reduce((s, g) => s + g, 0));
    } else if (newQty < current) {
      const newPerRoom = currentPerRoom.slice(0, newQty);
      setValue(`rooms.${index}.guestsPerRoom`, newPerRoom);
      setValue(`rooms.${index}.guests`, newPerRoom.reduce((s, g) => s + g, 0));
    }
  };

  const handlePerRoomGuestChange = (roomIndex: number, guestIndex: number, delta: number, unit: Unit) => {
    const perRoom = [...(watchedRooms[roomIndex].guestsPerRoom ?? [])];
    const current = perRoom[guestIndex] ?? 1;
    perRoom[guestIndex] = Math.max(1, Math.min(current + delta, unit.max_guests));
    setValue(`rooms.${roomIndex}.guestsPerRoom`, perRoom);
    setValue(`rooms.${roomIndex}.guests`, perRoom.reduce((s, g) => s + g, 0));
  };

  const toggleExpanded = (index: number) => {
    setExpandedGuests((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6')}>
      <h2 className={cn('text-xl font-semibold')}>Select your rooms</h2>

      <FieldError message={errors.rooms?.root?.message} />

      <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-2')}>
        {fields.map((field, index) => {
          const unit = units.find((u) => u.id === field.unitId);
          if (!unit) return null;

          const qty = watchedRooms[index]?.quantity ?? 0;
          const perRoom = watchedRooms[index]?.guestsPerRoom ?? [];
          const totalGuests = perRoom.reduce((s, g) => s + g, 0);
          const isExpanded = expandedGuests[index] ?? false;

          const lineTotal = calculateLineTotal(
            unit.pricing_model, unit.price, qty, totalGuests, nights
          );

          return (
            <Card key={field.id} className={cn('pt-0')}>
              <ImageCarousel
                images={unit.pictures}
                alt={unit.name}
                className={cn('h-40')}
              />
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
                  <Stepper
                    value={qty}
                    onDecrease={() => handleQuantityChange(index, -1, unit)}
                    onIncrease={() => handleQuantityChange(index, 1, unit)}
                    canDecrease={qty > 0}
                    canIncrease={qty < unit.available_count}
                    decreaseLabel={`Decrease ${unit.name} quantity`}
                    increaseLabel={`Increase ${unit.name} quantity`}
                    valueLabel={`${qty} ${unit.name} rooms selected`}
                    size="lg"
                  />
                </div>

                {/* Guest section - shown when quantity > 0 */}
                {qty > 0 && (
                  <div className={cn('space-y-3')}>
                    {/* Summary row with customize toggle */}
                    <button
                      type="button"
                      onClick={() => qty > 1 ? toggleExpanded(index) : undefined}
                      className={cn(
                        'flex w-full items-center justify-between rounded-md bg-muted px-3 py-2 text-sm',
                        qty > 1 && 'cursor-pointer hover:bg-muted/80'
                      )}
                    >
                      <span className={cn('flex items-center gap-1.5')}>
                        <UsersIcon className={cn('h-4 w-4 text-muted-foreground')} />
                        <span className={cn('font-medium')}>
                          {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'} total
                        </span>
                      </span>
                      {qty > 1 && (
                        <span className={cn('flex items-center gap-1 text-xs text-muted-foreground')}>
                          Customize
                          {isExpanded ? (
                            <ChevronUpIcon className={cn('h-3.5 w-3.5')} />
                          ) : (
                            <ChevronDownIcon className={cn('h-3.5 w-3.5')} />
                          )}
                        </span>
                      )}
                    </button>

                    {/* Single room - inline stepper (no expand needed) */}
                    {qty === 1 && (
                      <div className={cn('flex items-center gap-3')}>
                        <Label className={cn('text-sm text-muted-foreground')}>Guests</Label>
                        <Stepper
                          value={perRoom[0] ?? 1}
                          onDecrease={() => handlePerRoomGuestChange(index, 0, -1, unit)}
                          onIncrease={() => handlePerRoomGuestChange(index, 0, 1, unit)}
                          canDecrease={(perRoom[0] ?? 1) > 1}
                          canIncrease={(perRoom[0] ?? 1) < unit.max_guests}
                          decreaseLabel="Decrease guests"
                          increaseLabel="Increase guests"
                          valueLabel={`${perRoom[0] ?? 1} guests`}
                          size="md"
                        />
                      </div>
                    )}

                    {/* Multiple rooms - expandable per-room controls */}
                    {qty > 1 && isExpanded && (
                      <div className={cn('space-y-2 rounded-md border p-3')}>
                        {perRoom.map((guestCount, gi) => (
                          <div key={gi} className={cn('flex items-center justify-between')}>
                            <span className={cn('text-sm text-muted-foreground')}>
                              Room {gi + 1}
                            </span>
                            <div className={cn('flex items-center gap-2')}>
                              <Stepper
                                value={guestCount}
                                onDecrease={() => handlePerRoomGuestChange(index, gi, -1, unit)}
                                onIncrease={() => handlePerRoomGuestChange(index, gi, 1, unit)}
                                canDecrease={guestCount > 1}
                                canIncrease={guestCount < unit.max_guests}
                                decreaseLabel={`Decrease guests for room ${gi + 1}`}
                                increaseLabel={`Increase guests for room ${gi + 1}`}
                                valueLabel={`${guestCount} guests in room ${gi + 1}`}
                                size="sm"
                              />
                              <span className={cn('text-xs text-muted-foreground')}>
                                {guestCount === 1 ? 'guest' : 'guests'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
