<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class PropertyService
{
    private const CACHE_KEY = 'property_data';
    private const CACHE_TTL_SECONDS = 3600;

    public function get(): array
    {
        return Cache::remember(self::CACHE_KEY, self::CACHE_TTL_SECONDS, function () {
            $path = database_path('data/property.json');

            return json_decode(file_get_contents($path), true);
        });
    }

    public function getUnit(int $unitId): ?array
    {
        $units = $this->getUnitsIndexed();

        return $units[$unitId] ?? null;
    }

    /**
     * Returns units keyed by ID for O(1) lookup.
     */
    public function getUnitsIndexed(): array
    {
        $data = $this->get();
        $indexed = [];

        foreach ($data['units'] as $unit) {
            $indexed[$unit['id']] = $unit;
        }

        return $indexed;
    }
}
