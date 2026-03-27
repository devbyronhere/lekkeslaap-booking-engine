import { z } from 'zod';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { roomSelectionSchema } from '@/lib/schemas/roomSchema';

export type RoomSelection = z.infer<typeof roomSelectionSchema>;

const bookingStateSchema = z.object({
  currentStep: z.number().int().min(1).max(5),
  checkIn: z.string().nullable(),
  checkOut: z.string().nullable(),
  rooms: z.array(roomSelectionSchema),
  specialRequests: z.string(),
  bookingId: z.number().nullable(),
});

type BookingState = z.infer<typeof bookingStateSchema>;

interface BookingActions {
  setDates: (checkIn: string, checkOut: string) => void;
  setRooms: (rooms: RoomSelection[]) => void;
  setSpecialRequests: (requests: string) => void;
  setBookingId: (id: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  reset: () => void;
}

const initialState: BookingState = {
  currentStep: 1,
  checkIn: null,
  checkOut: null,
  rooms: [],
  specialRequests: '',
  bookingId: null,
};

export const useBookingStore = create<BookingState & BookingActions>()(
  persist(
    (set) => ({
      ...initialState,
      setDates: (checkIn, checkOut) => set({ checkIn, checkOut }),
      setRooms: (rooms) => set({ rooms }),
      setSpecialRequests: (specialRequests) => set({ specialRequests }),
      setBookingId: (bookingId) => set({ bookingId }),
      nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
      prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
      goToStep: (step) => set({ currentStep: step }),
      reset: () => set(initialState),
    }),
    {
      name: 'booking-wizard',
      // Parse localStorage data through Zod to prevent corrupted/tampered state
      merge: (persisted, current) => {
        const result = bookingStateSchema.safeParse(persisted);
        return { ...current, ...(result.success ? result.data : {}) };
      },
    }
  )
);
