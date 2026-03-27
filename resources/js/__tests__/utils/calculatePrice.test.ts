import { calculatePrice, calculateNights } from '@/lib/utils/calculatePrice';
import type { Unit } from '@/types/property';
import type { RoomSelection } from '@/Stores/useBookingStore';

const TAX_RATE = 0.15;

const standardRoom: Unit = {
  id: 1,
  name: 'Standard Room',
  max_guests: 2,
  pricing_model: 'per_unit',
  price: 1200,
  available_count: 5,
  pictures: [],
};

const familyCottage: Unit = {
  id: 2,
  name: 'Family Cottage',
  max_guests: 6,
  pricing_model: 'per_person',
  price: 650,
  available_count: 3,
  pictures: [],
};

describe('calculateNights', () => {
  it('calculates nights between two dates', () => {
    expect(calculateNights('2026-04-01', '2026-04-04')).toBe(3);
  });

  it('returns 0 for same-day dates', () => {
    expect(calculateNights('2026-04-01', '2026-04-01')).toBe(0);
  });

  it('returns 0 for inverted dates', () => {
    expect(calculateNights('2026-04-04', '2026-04-01')).toBe(0);
  });
});

describe('calculatePrice', () => {
  it('calculates per_unit price: price * nights * quantity', () => {
    const rooms: RoomSelection[] = [{ unitId: 1, quantity: 2, guests: 2 }];
    const result = calculatePrice(rooms, [standardRoom], 3, TAX_RATE);

    expect(result.lineItems).toHaveLength(1);
    expect(result.lineItems[0].lineTotal).toBe(1200 * 3 * 2); // 7200
  });

  it('calculates per_person price: price * guests * nights * quantity', () => {
    const rooms: RoomSelection[] = [{ unitId: 2, quantity: 1, guests: 4 }];
    const result = calculatePrice(rooms, [familyCottage], 2, TAX_RATE);

    expect(result.lineItems).toHaveLength(1);
    expect(result.lineItems[0].lineTotal).toBe(650 * 4 * 2 * 1); // 5200
  });

  it('sums multi-room total correctly', () => {
    const rooms: RoomSelection[] = [
      { unitId: 1, quantity: 2, guests: 2 },
      { unitId: 2, quantity: 1, guests: 4 },
    ];
    const result = calculatePrice(rooms, [standardRoom, familyCottage], 3, TAX_RATE);

    const expectedStandard = 1200 * 3 * 2; // 7200
    const expectedFamily = 650 * 4 * 3 * 1; // 7800
    expect(result.subtotal).toBe(expectedStandard + expectedFamily); // 15000
  });

  it('calculates VAT at 15%', () => {
    const rooms: RoomSelection[] = [{ unitId: 1, quantity: 1, guests: 1 }];
    const result = calculatePrice(rooms, [standardRoom], 2, TAX_RATE);

    const subtotal = 1200 * 2 * 1; // 2400
    expect(result.taxRate).toBe(0.15);
    expect(result.taxAmount).toBe(subtotal * 0.15); // 360
    expect(result.total).toBe(subtotal + subtotal * 0.15); // 2760
  });

  it('handles edge case: 1 night, 1 guest, 1 quantity', () => {
    const rooms: RoomSelection[] = [{ unitId: 1, quantity: 1, guests: 1 }];
    const result = calculatePrice(rooms, [standardRoom], 1, TAX_RATE);

    expect(result.subtotal).toBe(1200);
    expect(result.total).toBe(1200 * 1.15);
  });

  it('per_unit ignores guests in calculation', () => {
    const rooms1: RoomSelection[] = [{ unitId: 1, quantity: 1, guests: 1 }];
    const rooms2: RoomSelection[] = [{ unitId: 1, quantity: 1, guests: 2 }];

    const result1 = calculatePrice(rooms1, [standardRoom], 2, TAX_RATE);
    const result2 = calculatePrice(rooms2, [standardRoom], 2, TAX_RATE);

    expect(result1.subtotal).toBe(result2.subtotal);
  });

  it('filters out rooms with quantity 0', () => {
    const rooms: RoomSelection[] = [{ unitId: 1, quantity: 0, guests: 2 }];
    const result = calculatePrice(rooms, [standardRoom], 3, TAX_RATE);

    expect(result.lineItems).toHaveLength(0);
    expect(result.subtotal).toBe(0);
  });

  it('skips rooms with unknown unitId', () => {
    const rooms: RoomSelection[] = [{ unitId: 999, quantity: 1, guests: 2 }];
    const result = calculatePrice(rooms, [standardRoom], 3, TAX_RATE);

    expect(result.lineItems).toHaveLength(0);
    expect(result.subtotal).toBe(0);
  });
});
