<?php

use App\Models\User;
use App\Services\PricingService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

function bookingDataWithRooms(array $rooms, int $nights = 2, float $submittedTotal = 0): array
{
    $checkIn = now()->addDays(3)->toDateString();
    $checkOut = now()->addDays(3 + $nights)->toDateString();

    return [
        'check_in' => $checkIn,
        'check_out' => $checkOut,
        'rooms' => $rooms,
        'submitted_total' => $submittedTotal,
        'special_requests' => null,
    ];
}

it('calculates per_unit price correctly', function () {
    $pricingService = app(PricingService::class);

    $data = bookingDataWithRooms(
        rooms: [['unit_id' => 1, 'quantity' => 2, 'guests' => 2]],
        nights: 3,
    );

    $result = $pricingService->calculate($data);

    // Standard Room (per_unit): 1200 * 3 nights * 2 qty = 7200
    expect($result['subtotal'])->toBe(7200.0)
        ->and($result['nights'])->toEqual(3);
});

it('calculates per_person price correctly', function () {
    $pricingService = app(PricingService::class);

    $data = bookingDataWithRooms(
        rooms: [['unit_id' => 3, 'quantity' => 1, 'guests' => 4]],
        nights: 2,
    );

    $result = $pricingService->calculate($data);

    // Family Cottage (per_person): 650 * 4 guests * 2 nights * 1 qty = 5200
    expect($result['subtotal'])->toBe(5200.0)
        ->and($result['nights'])->toEqual(2);
});

it('rejects manipulated total', function () {
    $user = User::factory()->create();

    $rooms = [['unit_id' => 1, 'quantity' => 1, 'guests' => 2]];
    $data = bookingDataWithRooms(rooms: $rooms, nights: 2, submittedTotal: 1.00);

    $response = $this->actingAs($user)->postJson(route('bookings.store'), $data);

    $response->assertStatus(422)
        ->assertJsonFragment(['message' => 'Price mismatch detected. Please review the updated pricing and try again.']);
});

it('calculates VAT at 15 percent', function () {
    $pricingService = app(PricingService::class);

    $data = bookingDataWithRooms(
        rooms: [['unit_id' => 1, 'quantity' => 1, 'guests' => 2]],
        nights: 2,
    );

    $result = $pricingService->calculate($data);

    // Standard Room: 1200 * 2 * 1 = 2400
    $expectedSubtotal = 2400.0;
    $expectedTax = round($expectedSubtotal * 0.15, 2);

    expect($result['subtotal'])->toBe($expectedSubtotal)
        ->and($result['tax_rate'])->toBe(0.15)
        ->and($result['tax_amount'])->toBe($expectedTax)
        ->and($result['total_price'])->toBe(round($expectedSubtotal + $expectedTax, 2));
});

it('calculates multi-room correctly', function () {
    $pricingService = app(PricingService::class);

    $data = bookingDataWithRooms(
        rooms: [
            ['unit_id' => 1, 'quantity' => 2, 'guests' => 2],   // Standard Room (per_unit)
            ['unit_id' => 3, 'quantity' => 1, 'guests' => 3],   // Family Cottage (per_person)
        ],
        nights: 2,
    );

    $result = $pricingService->calculate($data);

    // Standard: 1200 * 2 nights * 2 qty = 4800
    // Family Cottage: 650 * 3 guests * 2 nights * 1 qty = 3900
    $expectedSubtotal = 4800.0 + 3900.0;

    expect($result['subtotal'])->toBe($expectedSubtotal)
        ->and($result['total_price'])->toBe(round($expectedSubtotal * 1.15, 2));
});
