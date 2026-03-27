<?php

use App\Jobs\ProcessBookingJob;
use App\Models\Booking;
use App\Models\User;
use App\Services\ChannelManagerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

uses(RefreshDatabase::class);

function createBookingForJob(): Booking
{
    $user = User::factory()->create();

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

it('dispatches job when booking created', function () {
    Queue::fake();
    $user = User::factory()->create();

    $checkIn = now()->addDays(3)->toDateString();
    $checkOut = now()->addDays(6)->toDateString();
    $subtotal = 1200 * 3 * 2;
    $tax = $subtotal * 0.15;
    $total = $subtotal + $tax;

    $this->actingAs($user)->postJson(route('bookings.store'), [
        'check_in' => $checkIn,
        'check_out' => $checkOut,
        'rooms' => [['unit_id' => 1, 'quantity' => 2, 'guests' => 2]],
        'submitted_total' => $total,
        'special_requests' => null,
    ]);

    Queue::assertPushed(ProcessBookingJob::class);
});

it('updates status to confirmed on success', function () {
    $booking = createBookingForJob();

    $mockChannelManager = Mockery::mock(ChannelManagerService::class);
    $mockChannelManager->shouldReceive('book')
        ->once()
        ->andReturn([
            'status' => 'confirmed',
            'external_confirmation_id' => 'OTA-TEST123',
            'timestamp' => now()->toIso8601String(),
        ]);

    $job = new ProcessBookingJob($booking);
    $job->handle($mockChannelManager);

    $booking->refresh();
    expect($booking->status)->toBe('confirmed')
        ->and($booking->external_confirmation_id)->toBe('OTA-TEST123');
});

it('updates status to failed after max retries', function () {
    $booking = createBookingForJob();

    $job = new ProcessBookingJob($booking);
    $job->failed(new Exception('Channel Manager API is currently unreachable.'));

    $booking->refresh();
    expect($booking->status)->toBe('failed');
});

it('has correct retry config', function () {
    $booking = createBookingForJob();
    $job = new ProcessBookingJob($booking);

    expect($job->tries)->toBe(3)
        ->and($job->backoff)->toBe([5, 15, 45]);
});
