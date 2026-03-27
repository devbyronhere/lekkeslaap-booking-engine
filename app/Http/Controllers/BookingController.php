<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookingRequest;
use App\Jobs\ProcessBookingJob;
use App\Models\Booking;
use App\Services\PricingService;
use App\Services\PropertyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingController
{
    public function __construct(
        private PricingService $pricingService,
        private PropertyService $propertyService,
    ) {}

    public function store(StoreBookingRequest $request): JsonResponse|\Symfony\Component\HttpFoundation\Response
    {
        $validated = $request->validated();
        $property = $this->propertyService->get();
        $pricing = $this->pricingService->calculate($validated);

        if (!$this->pricingService->verifyClientTotal($validated['submitted_total'], $pricing['total_price'])) {
            return response()->json([
                'message' => 'Price mismatch detected. Please review the updated pricing and try again.',
                'server_total' => $pricing['total_price'],
            ], 422);
        }

        $booking = Booking::create([
            'user_id' => $request->user()->id,
            'property_id' => $property['property']['id'],
            'check_in' => $validated['check_in'],
            'check_out' => $validated['check_out'],
            'nights' => $pricing['nights'],
            'currency' => $property['property']['currency'],
            'rooms' => $pricing['rooms'],
            'subtotal' => $pricing['subtotal'],
            'tax_rate' => $pricing['tax_rate'],
            'tax_amount' => $pricing['tax_amount'],
            'total_price' => $pricing['total_price'],
            'special_requests' => $validated['special_requests'] ?? null,
            'status' => 'pending',
        ]);

        ProcessBookingJob::dispatch($booking);

        if ($request->wantsJson()) {
            return response()->json([
                'booking_id' => $booking->id,
            ], 201);
        }

        return Inertia::location(route('bookings.show', $booking));
    }

    public function show(Request $request, Booking $booking): Response
    {
        if ($booking->user_id !== $request->user()->id) {
            abort(403);
        }

        return Inertia::render('Booking/Status', [
            'booking' => $booking,
        ]);
    }

    public function status(Request $request, Booking $booking): JsonResponse
    {
        if ($booking->user_id !== $request->user()->id) {
            abort(403);
        }

        return response()->json([
            'status' => $booking->status,
            'external_confirmation_id' => $booking->external_confirmation_id,
            'updated_at' => $booking->updated_at,
        ]);
    }
}
