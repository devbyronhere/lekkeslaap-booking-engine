import { z } from 'zod';

export const dateSchema = z
  .object({
    checkIn: z
      .string()
      .min(1, 'Check-in date is required')
      .refine((val) => {
        const date = new Date(val);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      }, 'Check-in must be today or later'),
    checkOut: z.string().min(1, 'Check-out date is required'),
  })
  .refine(
    (data) => {
      if (!data.checkIn || !data.checkOut) return true;
      return new Date(data.checkOut) > new Date(data.checkIn);
    },
    { message: 'Check-out must be after check-in', path: ['checkOut'] }
  );

export type DateFormValues = z.infer<typeof dateSchema>;
