import { z } from 'zod';

export const roomSelectionSchema = z.object({
  unitId: z.number(),
  quantity: z.number().int().min(0),
  guests: z.number().int().min(0),
});

export const roomSchema = z.object({
  rooms: z
    .array(roomSelectionSchema)
    .refine((rooms) => rooms.some((r) => r.quantity > 0), {
      message: 'Please select at least one room',
    }),
});

export type RoomFormValues = z.infer<typeof roomSchema>;
