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

      const lineTotal =
        unit.pricing_model === 'per_unit'
          ? unit.price * nights * room.quantity
          : unit.price * room.guests * nights * room.quantity;

      return {
        unitName: unit.name,
        unitPrice: unit.price,
        pricingModel: unit.pricing_model,
        quantity: room.quantity,
        guests: room.guests,
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
