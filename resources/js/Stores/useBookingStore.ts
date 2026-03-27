import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RoomSelection {
  unitId: number;
  quantity: number;
  guests: number;
}

interface BookingState {
  currentStep: number;
  checkIn: string | null;
  checkOut: string | null;
  rooms: RoomSelection[];
  specialRequests: string;
  bookingId: number | null;
}

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
    { name: 'booking-wizard' }
  )
);
