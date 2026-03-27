import type { Unit } from '@/types/property';
import type { RoomSelection } from '@/Stores/useBookingStore';

export interface PriceLineItem {
  unitName: string;
  unitPrice: number;
  pricingModel: 'per_unit' | 'per_person';
  quantity: number;
  guests: number;
  nights: number;
  lineTotal: number;
}

export function calculateLineTotal(
  pricingModel: 'per_unit' | 'per_person',
  unitPrice: number,
  quantity: number,
  guests: number,
  nights: number
): number {
  return pricingModel === 'per_unit'
    ? unitPrice * nights * quantity
    : unitPrice * guests * nights;
}

export interface PriceBreakdown {
  lineItems: PriceLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffMs = end.getTime() - start.getTime();
  return Math.max(Math.round(diffMs / (1000 * 60 * 60 * 24)), 0);
}

export function calculatePrice(
  rooms: RoomSelection[],
  units: Unit[],
  nights: number,
  taxRate: number
): PriceBreakdown {
  const unitMap = new Map(units.map((u) => [u.id, u]));

  const lineItems: PriceLineItem[] = rooms
    .filter((r) => r.quantity > 0)
    .map((room) => {
      const unit = unitMap.get(room.unitId);
      if (!unit) {
        return null;
      }

      const totalGuests = room.guestsPerRoom?.reduce((s, g) => s + g, 0) ?? room.guests;

      const lineTotal = calculateLineTotal(
        unit.pricing_model, unit.price, room.quantity, totalGuests, nights
      );

      return {
        unitName: unit.name,
        unitPrice: unit.price,
        pricingModel: unit.pricing_model,
        quantity: room.quantity,
        guests: totalGuests,
        nights,
        lineTotal,
      };
    })
    .filter((item): item is PriceLineItem => item !== null);

  const subtotal = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return { lineItems, subtotal, taxRate, taxAmount, total };
}
