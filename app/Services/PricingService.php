<?php

namespace App\Services;

use Carbon\Carbon;

class PricingService
{
    public function __construct(
        private PropertyService $propertyService,
    ) {}

    /**
     * Calculate server-authoritative pricing from validated booking data.
     *
     * Returns a breakdown with enriched rooms, subtotal, tax, and total.
     */
    public function calculate(array $validatedData): array
    {
        $checkIn = Carbon::parse($validatedData['check_in']);
        $checkOut = Carbon::parse($validatedData['check_out']);
        $nights = $checkIn->diffInDays($checkOut);
        $units = $this->propertyService->getUnitsIndexed();
        $property = $this->propertyService->get();
        $taxRate = $property['property']['tax_rate'];

        $enrichedRooms = [];
        $subtotal = 0;

        foreach ($validatedData['rooms'] as $room) {
            $unit = $units[$room['unit_id']];
            $quantity = $room['quantity'];
            $guests = $room['guests'];

            if ($unit['pricing_model'] === 'per_unit') {
                $roomSubtotal = $unit['price'] * $nights * $quantity;
            } else {
                // per_person: price * guests * nights * quantity
                $roomSubtotal = $unit['price'] * $guests * $nights * $quantity;
            }

            $enrichedRooms[] = [
                'unit_id' => $unit['id'],
                'unit_name' => $unit['name'],
                'pricing_model' => $unit['pricing_model'],
                'unit_price' => $unit['price'],
                'quantity' => $quantity,
                'guests' => $guests,
                'subtotal' => round($roomSubtotal, 2),
            ];

            $subtotal += $roomSubtotal;
        }

        $subtotal = round($subtotal, 2);
        $taxAmount = round($subtotal * $taxRate, 2);
        $totalPrice = round($subtotal + $taxAmount, 2);

        return [
            'nights' => $nights,
            'rooms' => $enrichedRooms,
            'subtotal' => $subtotal,
            'tax_rate' => $taxRate,
            'tax_amount' => $taxAmount,
            'total_price' => $totalPrice,
        ];
    }

    public function verifyClientTotal(float $clientTotal, float $serverTotal, float $tolerance = 0.01): bool
    {
        return abs($clientTotal - $serverTotal) <= $tolerance;
    }
}
