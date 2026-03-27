<?php

use App\Http\Controllers\BookingController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/bookings/{booking}/status', [BookingController::class, 'status'])
        ->name('api.bookings.status');
});
