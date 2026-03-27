<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    protected $fillable = [
        'user_id',
        'property_id',
        'check_in',
        'check_out',
        'nights',
        'currency',
        'rooms',
        'subtotal',
        'tax_rate',
        'tax_amount',
        'total_price',
        'special_requests',
        'status',
        'external_confirmation_id',
        'attempts',
    ];

    protected function casts(): array
    {
        return [
            'check_in' => 'date',
            'check_out' => 'date',
            'rooms' => 'array',
            'subtotal' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total_price' => 'decimal:2',
            'tax_rate' => 'decimal:4',
            'attempts' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
