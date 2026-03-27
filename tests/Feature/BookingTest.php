<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

function validBookingData(array $overrides = []): array
{
    $checkIn = now()->addDays(3)->toDateString();
    $checkOut = now()->addDays(6)->toDateString();
    $nights = 3;

    // 2x Standard Room (per_unit): 1200 * 3 * 2 = 7200
    $subtotal = 7200;
    $tax = $subtotal * 0.15;
    $total = $subtotal + $tax;

    return array_merge([
        'check_in' => $checkIn,
        'check_out' => $checkOut,
        'rooms' => [
            [
                'unit_id' => 1,
                'quantity' => 2,
                'guests' => 2,
            ],
        ],
        'submitted_total' => $total,
        'special_requests' => null,
    ], $overrides);
}

it('rejects booking without authentication', function () {
    $response = $this->postJson(route('bookings.store'), validBookingData());

    $response->assertStatus(401);
});

it('rejects booking with check_in in the past', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson(route('bookings.store'), validBookingData([
        'check_in' => now()->subDay()->toDateString(),
        'check_out' => now()->addDays(2)->toDateString(),
    ]));

    $response->assertStatus(422)
        ->assertJsonValidationErrors('check_in');
});

it('rejects booking with check_out before check_in', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson(route('bookings.store'), validBookingData([
        'check_in' => now()->addDays(3)->toDateString(),
        'check_out' => now()->addDays(2)->toDateString(),
    ]));

    $response->assertStatus(422)
        ->assertJsonValidationErrors('check_out');
});

it('rejects booking with missing dates', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson(route('bookings.store'), validBookingData([
        'check_in' => null,
        'check_out' => null,
    ]));

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['check_in', 'check_out']);
});

it('rejects booking with non-existent unit_id', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson(route('bookings.store'), validBookingData([
        'rooms' => [
            ['unit_id' => 999, 'quantity' => 1, 'guests' => 1],
        ],
    ]));

    $response->assertStatus(422)
        ->assertJsonValidationErrors('rooms.0.unit_id');
});

it('rejects booking with quantity exceeding available_count', function () {
    $user = User::factory()->create();

    // Standard Room has available_count=5, requesting 6
    $response = $this->actingAs($user)->postJson(route('bookings.store'), validBookingData([
        'rooms' => [
            ['unit_id' => 1, 'quantity' => 6, 'guests' => 2],
        ],
    ]));

    $response->assertStatus(422)
        ->assertJsonValidationErrors('rooms.0.quantity');
});

it('rejects booking with guests exceeding max_guests times quantity', function () {
    $user = User::factory()->create();

    // 2x Standard Room (max_guests=2), so max 4 guests total, requesting 5
    $response = $this->actingAs($user)->postJson(route('bookings.store'), validBookingData([
        'rooms' => [
            ['unit_id' => 1, 'quantity' => 2, 'guests' => 5],
        ],
    ]));

    $response->assertStatus(422)
        ->assertJsonValidationErrors('rooms.0.guests');
});

it('rejects booking with empty rooms', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson(route('bookings.store'), validBookingData([
        'rooms' => [],
    ]));

    $response->assertStatus(422)
        ->assertJsonValidationErrors('rooms');
});

it('accepts valid booking and returns booking ID', function () {
    Queue::fake();
    $user = User::factory()->create();

    $response = $this->actingAs($user)->postJson(route('bookings.store'), validBookingData());

    $response->assertStatus(201)
        ->assertJsonStructure(['booking_id']);

    $this->assertDatabaseHas('bookings', [
        'user_id' => $user->id,
        'status' => 'pending',
    ]);
});
