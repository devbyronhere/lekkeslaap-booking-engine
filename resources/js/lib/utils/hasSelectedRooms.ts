import type { RoomSelection } from '@/Stores/useBookingStore';

export const hasSelectedRooms = (rooms: Pick<RoomSelection, 'quantity'>[]) =>
  rooms.some((r) => r.quantity > 0);
