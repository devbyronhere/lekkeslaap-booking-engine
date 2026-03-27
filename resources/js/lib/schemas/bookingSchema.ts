import { z } from 'zod';
import { roomSelectionSchema } from './roomSchema';
import { hasSelectedRooms } from '@/lib/utils/hasSelectedRooms';

export const bookingSchema = z
  .object({
    checkIn: z.string().min(1, 'Check-in date is required'),
    checkOut: z.string().min(1, 'Check-out date is required'),
    rooms: z
      .array(roomSelectionSchema)
      .refine(hasSelectedRooms, {
        message: 'Please select at least one room',
      }),
    specialRequests: z
      .string()
      .max(500, 'Special requests must be 500 characters or less')
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.checkIn || !data.checkOut) return true;
      return new Date(data.checkOut) > new Date(data.checkIn);
    },
    { message: 'Check-out must be after check-in', path: ['checkOut'] }
  );

export type BookingFormValues = z.infer<typeof bookingSchema>;
