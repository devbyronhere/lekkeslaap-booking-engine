import { dateSchema } from '@/lib/schemas/dateSchema';
import { roomSchema } from '@/lib/schemas/roomSchema';
import { bookingSchema } from '@/lib/schemas/bookingSchema';

describe('dateSchema', () => {
  it('accepts a valid date range', () => {
    const result = dateSchema.safeParse({
      checkIn: '2026-12-01',
      checkOut: '2026-12-05',
    });
    expect(result.success).toBe(true);
  });

  it('rejects past check-in date', () => {
    const result = dateSchema.safeParse({
      checkIn: '2020-01-01',
      checkOut: '2020-01-05',
    });
    expect(result.success).toBe(false);
  });

  it('rejects inverted dates (check-out before check-in)', () => {
    const result = dateSchema.safeParse({
      checkIn: '2026-12-05',
      checkOut: '2026-12-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing check-in', () => {
    const result = dateSchema.safeParse({
      checkIn: '',
      checkOut: '2026-12-05',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing check-out', () => {
    const result = dateSchema.safeParse({
      checkIn: '2026-12-01',
      checkOut: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('roomSchema', () => {
  it('accepts valid room selections with at least one room', () => {
    const result = roomSchema.safeParse({
      rooms: [{ unitId: 1, quantity: 1, guests: 2 }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects when no rooms have quantity > 0', () => {
    const result = roomSchema.safeParse({
      rooms: [{ unitId: 1, quantity: 0, guests: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative quantity', () => {
    const result = roomSchema.safeParse({
      rooms: [{ unitId: 1, quantity: -1, guests: 2 }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative guests', () => {
    const result = roomSchema.safeParse({
      rooms: [{ unitId: 1, quantity: 1, guests: -1 }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts multiple rooms where at least one has quantity > 0', () => {
    const result = roomSchema.safeParse({
      rooms: [
        { unitId: 1, quantity: 0, guests: 0 },
        { unitId: 2, quantity: 1, guests: 3 },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe('bookingSchema', () => {
  const validBooking = {
    checkIn: '2026-12-01',
    checkOut: '2026-12-05',
    rooms: [{ unitId: 1, quantity: 1, guests: 2 }],
    specialRequests: 'Late check-in',
  };

  it('accepts a valid complete booking', () => {
    const result = bookingSchema.safeParse(validBooking);
    expect(result.success).toBe(true);
  });

  it('rejects missing check-in', () => {
    const result = bookingSchema.safeParse({ ...validBooking, checkIn: '' });
    expect(result.success).toBe(false);
  });

  it('rejects inverted dates', () => {
    const result = bookingSchema.safeParse({
      ...validBooking,
      checkIn: '2026-12-05',
      checkOut: '2026-12-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects when no rooms are selected', () => {
    const result = bookingSchema.safeParse({
      ...validBooking,
      rooms: [{ unitId: 1, quantity: 0, guests: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('accepts booking without special requests', () => {
    const { specialRequests, ...withoutRequests } = validBooking;
    const result = bookingSchema.safeParse(withoutRequests);
    expect(result.success).toBe(true);
  });

  it('rejects special requests over 500 characters', () => {
    const result = bookingSchema.safeParse({
      ...validBooking,
      specialRequests: 'a'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});
