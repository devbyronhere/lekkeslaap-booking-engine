<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('property_id');
            $table->date('check_in');
            $table->date('check_out');
            $table->unsignedSmallInteger('nights');
            $table->string('currency', 3)->default('ZAR');
            $table->json('rooms');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax_rate', 4, 4)->default(0.1500);
            $table->decimal('tax_amount', 10, 2);
            $table->decimal('total_price', 10, 2);
            $table->text('special_requests')->nullable();
            $table->string('status')->default('pending');
            $table->string('external_confirmation_id')->nullable();
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
