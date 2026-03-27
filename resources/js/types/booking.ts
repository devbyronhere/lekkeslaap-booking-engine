import { z } from 'zod';

export const bookingStatusSchema = z.enum(['pending', 'confirmed', 'failed']);

export const bookingStatusResponseSchema = z.object({
  status: bookingStatusSchema,
  confirmation_id: z.string().nullable(),
  message: z.string().nullable(),
});

export type BookingStatus = z.infer<typeof bookingStatusSchema>;
export type BookingStatusResponse = z.infer<typeof bookingStatusResponseSchema>;
