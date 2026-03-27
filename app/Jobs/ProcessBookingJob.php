<?php

namespace App\Jobs;

use App\Models\Booking;
use App\Services\ChannelManagerService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class ProcessBookingJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    /** @var array<int, int> */
    public array $backoff = [5, 15, 45];

    public function __construct(
        public Booking $booking,
    ) {}

    public function handle(ChannelManagerService $channelManager): void
    {
        $this->booking->update([
            'status' => 'processing',
            'attempts' => $this->booking->attempts + 1,
        ]);

        $bookingData = [
            'reservation_id' => 'BK-' . strtoupper(Str::random(8)),
            'status' => 'new',
            'property_id' => $this->booking->property_id,
            'check_in' => $this->booking->check_in->toDateString(),
            'check_out' => $this->booking->check_out->toDateString(),
            'nights' => $this->booking->nights,
            'currency' => $this->booking->currency,
            'rooms' => $this->booking->rooms,
            'subtotal' => $this->booking->subtotal,
            'tax_rate' => $this->booking->tax_rate,
            'tax_amount' => $this->booking->tax_amount,
            'total_price' => $this->booking->total_price,
            'customer' => [
                'name' => $this->booking->user->name,
                'email' => $this->booking->user->email,
            ],
            'special_requests' => $this->booking->special_requests,
        ];

        $result = $channelManager->book($bookingData);

        $this->booking->update([
            'status' => 'confirmed',
            'external_confirmation_id' => $result['external_confirmation_id'],
        ]);
    }

    public function failed(Throwable $exception): void
    {
        Log::error('Booking processing failed', [
            'booking_id' => $this->booking->id,
            'error' => $exception->getMessage(),
        ]);

        $this->booking->update([
            'status' => 'failed',
        ]);
    }
}
