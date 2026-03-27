<?php

namespace App\Http\Requests;

use App\Services\PropertyService;
use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'check_in' => ['required', 'date', 'after_or_equal:today'],
            'check_out' => ['required', 'date', 'after:check_in'],
            'rooms' => ['required', 'array', 'min:1'],
            'rooms.*.unit_id' => ['required', 'integer'],
            'rooms.*.quantity' => ['required', 'integer', 'min:1'],
            'rooms.*.guests' => ['required', 'integer', 'min:1'],
            'special_requests' => ['nullable', 'string', 'max:500'],
            'submitted_total' => ['required', 'numeric', 'min:0'],
        ];
    }

    /**
     * Custom validation: verify units exist, quantities don't exceed availability,
     * and guest counts respect max_guests per unit.
     */
    public function after(): array
    {
        return [
            function ($validator) {
                $propertyService = app(PropertyService::class);
                $units = $propertyService->getUnitsIndexed();
                $rooms = $this->input('rooms', []);

                foreach ($rooms as $index => $room) {
                    $unitId = $room['unit_id'] ?? null;

                    if ($unitId === null) {
                        continue;
                    }

                    $unit = $units[$unitId] ?? null;

                    if (!$unit) {
                        $validator->errors()->add(
                            "rooms.{$index}.unit_id",
                            "The selected room type does not exist."
                        );
                        continue;
                    }

                    $quantity = $room['quantity'] ?? 0;
                    if ($quantity > $unit['available_count']) {
                        $validator->errors()->add(
                            "rooms.{$index}.quantity",
                            "Only {$unit['available_count']} {$unit['name']} room(s) available."
                        );
                    }

                    $guests = $room['guests'] ?? 0;
                    $maxGuests = $unit['max_guests'] * $quantity;
                    if ($guests > $maxGuests) {
                        $validator->errors()->add(
                            "rooms.{$index}.guests",
                            "Maximum {$maxGuests} guest(s) allowed for {$quantity} {$unit['name']} room(s)."
                        );
                    }
                }
            },
        ];
    }

    public function messages(): array
    {
        return [
            'check_in.after_or_equal' => 'Check-in date must be today or later.',
            'check_out.after' => 'Check-out date must be after the check-in date.',
            'rooms.required' => 'Please select at least one room.',
            'rooms.min' => 'Please select at least one room.',
            'rooms.*.quantity.min' => 'Room quantity must be at least 1.',
            'rooms.*.guests.min' => 'Guest count must be at least 1.',
            'special_requests.max' => 'Special requests must be 500 characters or fewer.',
        ];
    }
}
