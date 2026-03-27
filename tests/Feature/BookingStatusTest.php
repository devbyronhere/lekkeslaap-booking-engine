<?php

use App\Models\Booking;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

function createBookingForUser(User $user): Booking
{
    return Booking::create([
        'user_id' => $user->id,
        'property_id' => 101,
        'check_in' => now()->addDays(3)->toDateString(),
        'check_out' => now()->addDays(5)->toDateString(),
        'nights' => 2,
        'currency' => 'ZAR',
        'rooms' => [['unit_id' => 1, 'unit_name' => 'Standard Room', 'pricing_model' => 'per_unit', 'unit_price' => 1200, 'quantity' => 1, 'guests' => 2, 'subtotal' => 2400]],
        'subtotal' => 2400.00,
        'tax_rate' => 0.15,
        'tax_amount' => 360.00,
        'total_price' => 2760.00,
        'status' => 'pending',
        'attempts' => 0,
    ]);
}

it('returns correct booking status', function () {
    $user = User::factory()->create();
    $booking = createBookingForUser($user);

    Sanctum::actingAs($user);

    $response = $this->getJson(route('api.bookings.status', $booking));

    $response->assertStatus(200)
        ->assertJsonFragment(['status' => 'pending'])
        ->assertJsonStructure(['status', 'external_confirmation_id', 'updated_at']);
});

it('returns 403 for another users booking', function () {
    $userA = User::factory()->create();
    $userB = User::factory()->create();
    $booking = createBookingForUser($userA);

    Sanctum::actingAs($userB);

    $response = $this->getJson(route('api.bookings.status', $booking));

    $response->assertStatus(403);
});

it('returns 401 without auth', function () {
    $user = User::factory()->create();
    $booking = createBookingForUser($user);

    $response = $this->getJson(route('api.bookings.status', $booking));

    $response->assertStatus(401);
});
