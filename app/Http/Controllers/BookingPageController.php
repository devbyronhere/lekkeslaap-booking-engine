<?php

namespace App\Http\Controllers;

use App\Services\PropertyService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class BookingPageController
{
    public function __construct(
        private PropertyService $propertyService,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('Booking/Index', [
            'propertyData' => $this->propertyService->get(),
        ])->toResponse($request)->header('Cache-Control', 'public, max-age=3600, s-maxage=3600');
    }
}
