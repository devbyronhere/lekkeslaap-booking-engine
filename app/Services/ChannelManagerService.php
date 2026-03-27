<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;

class ChannelManagerService
{
    public function book(array $bookingData): array
    {
        // Simulate slow network response (1 to 4 seconds)
        sleep(rand(1, 4));

        // Simulate a 25% chance of the external API failing or timing out
        if (rand(1, 4) === 1) {
            Log::warning('ChannelManagerService: Connection timeout or 503 Service Unavailable.');
            throw new Exception('Channel Manager API is currently unreachable. Please try again.');
        }

        $confirmationId = 'OTA-' . strtoupper(uniqid());
        Log::info("ChannelManagerService: Booking {$confirmationId} confirmed successfully.", $bookingData);

        return [
            'status' => 'confirmed',
            'external_confirmation_id' => $confirmationId,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}
