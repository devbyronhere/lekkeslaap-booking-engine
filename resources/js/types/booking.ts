export type BookingStatus = 'pending' | 'confirmed' | 'failed';

export interface BookingStatusResponse {
  status: BookingStatus;
  confirmation_id: string | null;
  message: string | null;
}
