import { z } from 'zod';
import { hasSelectedRooms } from '@/lib/utils/hasSelectedRooms';

export const roomSelectionSchema = z.object({
  unitId: z.number(),
  quantity: z.number().int().min(0),
  guests: z.number().int().min(0),
  guestsPerRoom: z.array(z.number().int().min(1)).optional(),
});

export const roomSchema = z.object({
  rooms: z
    .array(roomSelectionSchema)
    .refine(hasSelectedRooms, {
      message: 'Please select at least one room',
    }),
});

export type RoomFormValues = z.infer<typeof roomSchema>;
