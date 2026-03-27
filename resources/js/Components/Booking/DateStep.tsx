import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, addDays, startOfToday } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dateSchema, type DateFormValues } from '@/lib/schemas';
import { useBookingStore } from '@/Stores/useBookingStore';
import { calculateNights } from '@/lib/utils/calculatePrice';
import { Button } from '@/Components/ui/button';
import { Calendar } from '@/Components/ui/calendar';
import { Label } from '@/Components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';

export function DateStep() {
  const { checkIn, checkOut, setDates, nextStep } = useBookingStore();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DateFormValues>({
    resolver: zodResolver(dateSchema),
    defaultValues: {
      checkIn: checkIn ?? '',
      checkOut: checkOut ?? '',
    },
  });

  const watchedCheckIn = watch('checkIn');
  const watchedCheckOut = watch('checkOut');
  const nights =
    watchedCheckIn && watchedCheckOut
      ? calculateNights(watchedCheckIn, watchedCheckOut)
      : 0;

  const today = startOfToday();

  const onSubmit = (data: DateFormValues) => {
    setDates(data.checkIn, data.checkOut);
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6')}>
      <h2 className={cn('text-xl font-semibold')}>Select your dates</h2>

      <div className={cn('grid gap-4 sm:grid-cols-2')}>
        {/* Check-in date picker */}
        <div className={cn('space-y-2')}>
          <Label htmlFor="checkIn">Check-in</Label>
          <Controller
            control={control}
            name="checkIn"
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="checkIn"
                    variant="outline"
                    size="lg"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                    aria-label="Select check-in date"
                    aria-invalid={!!errors.checkIn}
                  >
                    <CalendarIcon className={cn('mr-2 h-4 w-4')} />
                    {field.value
                      ? format(new Date(field.value), 'PPP')
                      : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className={cn('w-auto p-0')} align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => {
                      field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                    }}
                    disabled={{ before: today }}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.checkIn && (
            <p className={cn('text-sm text-destructive')} role="alert">
              {errors.checkIn.message}
            </p>
          )}
        </div>

        {/* Check-out date picker */}
        <div className={cn('space-y-2')}>
          <Label htmlFor="checkOut">Check-out</Label>
          <Controller
            control={control}
            name="checkOut"
            render={({ field }) => {
              const minCheckOut = watchedCheckIn
                ? addDays(new Date(watchedCheckIn), 1)
                : addDays(today, 1);

              return (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="checkOut"
                      variant="outline"
                      size="lg"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                      aria-label="Select check-out date"
                      aria-invalid={!!errors.checkOut}
                    >
                      <CalendarIcon className={cn('mr-2 h-4 w-4')} />
                      {field.value
                        ? format(new Date(field.value), 'PPP')
                        : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className={cn('w-auto p-0')} align="start">
                    <Calendar
                      mode="single"
                      selected={
                        field.value ? new Date(field.value) : undefined
                      }
                      onSelect={(date) => {
                        field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                      }}
                      disabled={{ before: minCheckOut }}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              );
            }}
          />
          {errors.checkOut && (
            <p className={cn('text-sm text-destructive')} role="alert">
              {errors.checkOut.message}
            </p>
          )}
        </div>
      </div>

      {nights > 0 && (
        <p className={cn('text-sm text-muted-foreground')}>
          {nights} {nights === 1 ? 'night' : 'nights'} selected
        </p>
      )}

      <div className={cn('flex justify-end')}>
        <Button type="submit" size="lg">
          Next: Select Rooms
        </Button>
      </div>
    </form>
  );
}
