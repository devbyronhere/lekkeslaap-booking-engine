# Implementation Plan - OTA Booking Engine

**Assessment:** Intermediate Full-Stack Software Engineer - LekkeSlaap
**Time Budget:** 3-5 hours
**Date:** 2026-03-27

---

## Table of Contents

1. [Before You Start - Prerequisites & Decisions](#1-before-you-start)
2. [Project Scaffolding & Configuration](#2-project-scaffolding--configuration)
3. [Backend Implementation](#3-backend-implementation)
4. [Frontend Implementation](#4-frontend-implementation)
5. [Testing](#5-testing)
6. [Polish & Documentation](#6-polish--documentation)
7. [Submission Checklist](#7-submission-checklist)
8. [Time Pressure Triage](#8-time-pressure-triage)

---

## 1. Before You Start

### 1.1 Environment Prerequisites

- [x] **1.1.1** PHP 8.2+ installed: `php -v` (8.5.4)
- [x] **1.1.2** Composer installed: `composer -V` (2.9.5)
- [x] **1.1.3** Node.js 20+ installed: `node -v` (22.19.0)
- [x] **1.1.4** npm installed: `npm -v` (10.9.3)
- [x] **1.1.5** SQLite available: `php -m | grep sqlite` (pdo_sqlite + sqlite3)
- [x] **1.1.6** Required PHP extensions enabled: `php -m | grep -E 'mbstring|xml|curl|openssl|tokenizer|fileinfo|bcmath'`

### 1.2 Accounts & Services

- [x] **1.2.1** GitHub account ready for final submission (devbyronhere)
- [x] **1.2.2** No external API keys, Redis, Pusher, or third-party accounts needed - entire stack runs locally

### 1.3 Decisions Requiring Byron's Input

> **[BYRON INPUT NEEDED]** - Resolve these before starting implementation:

- [x] **1.3.1** Location for `property.json`: `database/data/property.json`
- [x] **1.3.2** Branch naming: `feature/booking-engine`
- [x] **1.3.3** GitHub repo: `lekkeslaap-booking-engine`, private
- [x] **1.3.4** All 13 open questions in `open-questions.md` confirmed RESOLVED

---

## 2. Project Scaffolding & Configuration

### 2.1 Create Laravel Project (~5 min)

- [x] **2.1.1** Create new Laravel project:
  ```bash
  composer create-project laravel/laravel booking-engine
  cd booking-engine
  ```
- [x] **2.1.2** Install Laravel Breeze with React + TypeScript + Inertia:
  ```bash
  composer require laravel/breeze --dev
  php artisan breeze:install react --typescript
  ```
- [x] **2.1.3** Install npm dependencies and verify build:
  ```bash
  npm install && npm run build
  ```
- [x] **2.1.4** Verify SQLite is configured: check `.env` for `DB_CONNECTION=sqlite`
- [x] **2.1.5** Run initial migrations: `php artisan migrate`
- [ ] **2.1.6** Start both servers and verify Breeze welcome page loads at `http://localhost:8000`:
  ```bash
  php artisan serve &
  npm run dev
  ```

### 2.2 Copy Provided Assets

- [x] **2.2.1** Create `app/Services/` directory, copy `ChannelManagerService.php` into it
- [x] **2.2.2** Copy `property.json` to decided location (see 1.3.1)
- [x] **2.2.3** Copy `CLAUDE.md`, `key-decisions.md`, `open-questions.md` into project root

### 2.3 Environment Configuration

- [x] **2.3.1** Set in `.env`:
  ```
  QUEUE_CONNECTION=database
  APP_NAME="Lekke Localhost Lodge"
  ```
- [ ] **2.3.2** Create queue tables (if not already present):
  ```bash
  php artisan queue:table
  php artisan queue:failed-table
  php artisan migrate
  ```
- [x] **2.3.3** Verify `SESSION_DRIVER=database` (Breeze default on Laravel 11+)

### 2.4 shadcn/ui Setup (~3 min)

- [x] **2.4.1** ⚠️ **MANUAL** - Initialize shadcn/ui (interactive prompts):
  ```bash
  npx shadcn@latest init
  ```
  Select: TypeScript, default style, CSS at `resources/css/app.css`, confirm Tailwind config path
- [x] **2.4.2** Install all needed components upfront:
  ```bash
  npx shadcn@latest add button card input label tooltip dialog form calendar popover textarea badge separator alert
  ```
  Note: `form` pulls in React Hook Form + Zod + @hookform/resolvers automatically

### 2.5 Additional npm Dependencies (~2 min)

- [x] **2.5.1** Install Zustand: `npm install zustand`
- [x] **2.5.2** Install RHF + Zod (if not already from shadcn form): `npm install react-hook-form zod @hookform/resolvers`
- [x] **2.5.3** Install date-fns (for shadcn Calendar): `npm install date-fns`
- [x] **2.5.4** Install frontend test deps:
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
  ```
- [x] **2.5.5** Create `vitest.config.ts` at project root with path aliases matching `tsconfig.json` and `jsdom` as test environment

### 2.6 Commitlint + Husky (~3 min)

- [x] **2.6.1** Install commitlint:
  ```bash
  npm install -D @commitlint/cli @commitlint/config-conventional
  ```
- [x] **2.6.2** Create `commitlint.config.js`:
  ```js
  module.exports = { extends: ['@commitlint/config-conventional'] };
  ```
- [x] **2.6.3** Install and init Husky:
  ```bash
  npm install -D husky
  npx husky init
  ```
- [x] **2.6.4** Add commit-msg hook:
  ```bash
  echo 'npx --no -- commitlint --edit "$1"' > .husky/commit-msg
  ```
- [x] **2.6.5** Add pre-push hook to reject lightweight tags:
  ```bash
  echo 'git tag -l | while read tag; do if ! git cat-file -t "$tag" | grep -q "tag"; then echo "Error: Lightweight tag found. Use annotated tags only." && exit 1; fi; done' > .husky/pre-push
  ```
- [ ] **2.6.6** Verify: `echo "bad message" | npx commitlint` should fail, `echo "chore: test" | npx commitlint` should pass

### 2.7 Tailwind Brand Colors

- [ ] **2.7.1** Add to `tailwind.config.js` theme extend:
  ```js
  colors: {
    brand: {
      orange: '#EC772D',
      gray: '#5A5B5D',
    },
  },
  ```
- [ ] **2.7.2** Update shadcn CSS variables in `resources/css/app.css`: set `--primary` to HSL equivalent of #EC772D (~`24 84% 55%`)

### 2.8 Backend Test Setup

- [x] **2.8.1** Install Pest:
  ```bash
  composer require pestphp/pest --dev --with-all-dependencies
  composer require pestphp/pest-plugin-laravel --dev
  ```
- [ ] **2.8.2** Verify: `php artisan test` runs and passes default Breeze tests

### 2.9 Git Setup

- [x] **2.9.1** Initialize repo: `git init`
- [x] **2.9.2** Review `.gitignore` (excludes `.env`, `vendor/`, `node_modules/`, SQLite DB)
- [x] **2.9.3** Initial commit:
  ```bash
  git add -A
  git commit -m "chore: scaffold Laravel Breeze + React + Inertia + TypeScript project"
  ```
- [x] **2.9.4** Create working branch: `git checkout -b feature/booking-engine`
- [x] **2.9.5** ⚠️ **MANUAL** - Create GitHub repo and push (confirm before running):
  ```bash
  gh repo create lekkeslaap-booking-engine --private --source=. --push
  ```

### 2.10 Verification

- [ ] **2.10.1** `php artisan serve` starts without errors
- [ ] **2.10.2** `npm run dev` starts Vite without errors
- [ ] **2.10.3** `http://localhost:8000` shows Breeze welcome page, register/login works
- [ ] **2.10.4** `php artisan test` passes
- [ ] **2.10.5** `npx vitest --run` runs without config errors
- [ ] **2.10.6** Committing with a non-conventional message is rejected

---

## 3. Backend Implementation

### 3.1 Database & Models

- [ ] **3.1.1** Create bookings migration (`php artisan make:migration create_bookings_table`) with columns:
  - `id` - bigIncrements (primary key)
  - `user_id` - foreignId, constrained to `users`, `onDelete('cascade')`
  - `property_id` - unsignedInteger, not nullable
  - `check_in` - date, not nullable
  - `check_out` - date, not nullable
  - `nights` - unsignedSmallInteger, not nullable
  - `currency` - string(3), not nullable, default `'ZAR'`
  - `rooms` - json, not nullable (array of room selections)
  - `subtotal` - decimal(10, 2), not nullable
  - `tax_rate` - decimal(4, 4), not nullable, default `0.1500`
  - `tax_amount` - decimal(10, 2), not nullable
  - `total_price` - decimal(10, 2), not nullable
  - `special_requests` - text, nullable
  - `status` - string, not nullable, default `'pending'` (values: pending, processing, confirmed, failed)
  - `external_confirmation_id` - string, nullable
  - `attempts` - unsignedTinyInteger, not nullable, default `0`
  - `timestamps()`
  - Index on `user_id`, index on `status`

- [ ] **3.1.2** Create `app/Models/Booking.php`:
  - `$fillable`: all columns except id/timestamps
  - `$casts`: `check_in` as date, `check_out` as date, `rooms` as array, `subtotal`/`tax_amount`/`total_price` as `decimal:2`, `tax_rate` as `decimal:4`, `attempts` as integer
  - `user()` belongsTo relationship

- [ ] **3.1.3** Add `bookings()` hasMany to `app/Models/User.php`

- [ ] **3.1.4** Run `php artisan migrate` to verify

### 3.2 Property Data & Caching

- [ ] **3.2.1** Create `app/Services/PropertyService.php` with:
  - `get(): array` - uses `Cache::remember('property_data', 3600, fn() => json_decode(file_get_contents(base_path('property.json')), true))` (1hr TTL, file driver)
  - `getUnit(int $unitId): ?array` - retrieves single unit by ID from cached data
  - `getUnitsIndexed(): array` - returns units keyed by ID for O(1) lookup

- [ ] **3.2.2** Create `app/Http/Controllers/BookingPageController.php` with `index` method:
  - Injects PropertyService
  - Returns `Inertia::render('Booking/Index', ['property' => $propertyService->get()])`
  - Sets Cache-Control header: `public, max-age=3600, s-maxage=3600`

### 3.3 Form Request Validation

- [ ] **3.3.1** Create `app/Http/Requests/StoreBookingRequest.php` with rules:
  - `check_in`: `['required', 'date', 'after_or_equal:today']`
  - `check_out`: `['required', 'date', 'after:check_in']`
  - `rooms`: `['required', 'array', 'min:1']`
  - `rooms.*.unit_id`: `['required', 'integer']` + custom rule: unit exists in property.json
  - `rooms.*.quantity`: `['required', 'integer', 'min:1']` + custom rule: quantity <= available_count
  - `rooms.*.guests`: `['required', 'integer', 'min:1']` + custom rule: guests <= max_guests * quantity
  - `special_requests`: `['nullable', 'string', 'max:500']`
  - `submitted_total`: `['required', 'numeric', 'min:0']` (for price mismatch detection)

- [ ] **3.3.2** Add custom validation via `withValidator()` or `after()` callback using PropertyService for unit lookups

- [ ] **3.3.3** Add user-friendly error messages

### 3.4 Pricing Service (Server-Authoritative)

- [ ] **3.4.1** Create `app/Services/PricingService.php` with `calculate(array $validatedData): array`:
  - Compute `$nights` = difference between check_in and check_out
  - For each room, look up unit from PropertyService:
    - `per_unit`: price * nights * quantity
    - `per_person`: price * guests * nights * quantity
  - `subtotal` = sum of all room subtotals
  - `tax_amount` = round(subtotal * 0.15, 2)
  - `total_price` = round(subtotal + tax_amount, 2)
  - Returns full breakdown including enriched rooms array (with unit_name, pricing_model, unit_price, subtotal per room)

- [ ] **3.4.2** Add `verifyClientTotal(float $clientTotal, float $serverTotal, float $tolerance = 0.01): bool` method

### 3.5 Booking Controller

- [ ] **3.5.1** Create `app/Http/Controllers/BookingController.php` with `store` method:
  - Accept `StoreBookingRequest`
  - Call PricingService::calculate()
  - Call PricingService::verifyClientTotal() - reject 422 on mismatch
  - Create Booking record with status `'pending'`
  - Dispatch ProcessBookingJob
  - Return Inertia redirect to booking status page (or JSON with booking_id)

- [ ] **3.5.2** Add `status` method (JSON API endpoint for polling):
  - Route model binding for Booking
  - Verify authenticated user owns the booking (403 if not)
  - Return JSON: `{ status, external_confirmation_id, updated_at }`

- [ ] **3.5.3** Add `show` method (Inertia page for status):
  - Verify ownership
  - Return `Inertia::render('Booking/Status', ['booking' => $booking])`

### 3.6 Queue Job

- [ ] **3.6.1** Create `app/Jobs/ProcessBookingJob.php`:
  - `implements ShouldQueue`
  - Constructor accepts `public Booking $booking`
  - `$tries = 3`
  - `$backoff = [5, 15, 45]` (exponential backoff)

- [ ] **3.6.2** Implement `handle()`:
  - Update booking status to `'processing'`, increment `attempts`
  - Build `$bookingData` array per key-decisions.md #22 schema:
    ```php
    [
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
    ]
    ```
  - Call `ChannelManagerService::book($bookingData)`
  - On success: update status to `'confirmed'`, save `external_confirmation_id`

- [ ] **3.6.3** Implement `failed(Throwable $exception)`:
  - Update booking status to `'failed'`
  - Log failure

### 3.7 Routes

- [ ] **3.7.1** In `routes/web.php` - public Inertia page:
  ```php
  Route::get('/', [BookingPageController::class, 'index'])->name('booking.index');
  ```

- [ ] **3.7.2** In `routes/web.php` - authenticated booking routes:
  ```php
  Route::middleware('auth')->group(function () {
      Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
      Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
  });
  ```

- [ ] **3.7.3** In `routes/api.php` - polling endpoint:
  ```php
  Route::middleware('auth:sanctum')->group(function () {
      Route::get('/bookings/{booking}/status', [BookingController::class, 'status'])->name('api.bookings.status');
  });
  ```

- [ ] **3.7.4** Verify routes: `php artisan route:list`

### 3.8 ChannelManagerService Integration

- [ ] **3.8.1** Verify `ChannelManagerService.php` is at `app/Services/ChannelManagerService.php` with namespace `App\Services`
- [ ] **3.8.2** Optionally register as singleton in `AppServiceProvider` (for mockability in tests)

---

## 4. Frontend Implementation

### 4.1 TypeScript Types

- [ ] **4.1.1** Create `resources/js/types/property.ts`:
  - `Unit` interface: id, name, description, max_guests, pricing_model ('per_unit' | 'per_person'), price, available_count, pictures
  - `Property` interface: id, name, currency, tax_rate, pictures
  - `PropertyData` interface: { property: Property; units: Unit[] }

- [ ] **4.1.2** Create `resources/js/types/booking.ts`:
  - `BookingStatus` type: 'pending' | 'processing' | 'confirmed' | 'failed'
  - `BookingStatusResponse` interface: { status, external_confirmation_id, updated_at }

### 4.2 Zustand Store

**File: `resources/js/Stores/useBookingStore.ts`**

- [ ] **4.2.1** Define `RoomSelection` type: `{ unitId: number; quantity: number; guests: number }`
- [ ] **4.2.2** Define `BookingState` interface: `currentStep` (1-5), `checkIn: string | null`, `checkOut: string | null`, `rooms: RoomSelection[]`, `specialRequests: string`, `bookingId: number | null`
- [ ] **4.2.3** Define actions: `setDates`, `setRooms`, `setSpecialRequests`, `setBookingId`, `nextStep`, `prevStep`, `goToStep`, `reset`
- [ ] **4.2.4** Create store with Zustand `persist` middleware, localStorage key: `'booking-wizard'`
- [ ] **4.2.5** Implement all actions (nextStep clamped to 5, prevStep clamped to 1, reset returns all to defaults)

### 4.3 Zod Schemas

- [ ] **4.3.1** Create `resources/js/Lib/schemas/dateSchema.ts`:
  - `z.object({ checkIn: z.string(), checkOut: z.string() })` with refines: checkIn >= today, checkOut > checkIn

- [ ] **4.3.2** Create `resources/js/Lib/schemas/roomSchema.ts`:
  - `roomSelectionSchema`: z.object with unitId, quantity (min 1), guests (min 1)
  - `createRoomsSchema(units)`: factory that returns array schema with superRefine validating guests <= maxGuests * quantity per unit

- [ ] **4.3.3** Create `resources/js/Lib/schemas/bookingSchema.ts`:
  - Combines date fields, rooms array, specialRequests (string, max 500, optional, default '')

- [ ] **4.3.4** Create `resources/js/Lib/schemas/index.ts` barrel export

### 4.4 Shared Utils

- [ ] **4.4.1** Create `resources/js/Lib/utils/formatCurrency.ts`:
  - `formatCurrency(amount: number): string` using `Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })`

- [ ] **4.4.2** Create `resources/js/Lib/utils/calculatePrice.ts`:
  - Define `PriceBreakdown` type: perRoom array, subtotal, taxRate, taxAmount, total
  - `calculatePrice(rooms, nights, units, taxRate): PriceBreakdown`
    - per_unit: price * nights * quantity
    - per_person: price * guests * nights * quantity
    - subtotal = sum of line totals
    - taxAmount = subtotal * taxRate
    - total = subtotal + taxAmount

- [ ] **4.4.3** Create `calculateNights(checkIn: string, checkOut: string): number` helper

- [ ] **4.4.4** Ensure `cn()` utility exists (shadcn standard - likely already created during init)

### 4.5 Booking Wizard (Orchestrator)

**File: `resources/js/Components/Booking/BookingWizard.tsx`**

- [ ] **4.5.1** Accept props: `propertyData: PropertyData`, `auth: { user: { id, name, email } | null }`
- [ ] **4.5.2** Read `currentStep` from Zustand store
- [ ] **4.5.3** Render step indicator/progress bar: "Dates", "Rooms", "Summary", "Status". Use `role="navigation"`, `aria-label="Booking progress"`, `aria-current="step"` on active
- [ ] **4.5.4** Conditionally render: DateStep (1), RoomStep (2), SummaryStep (3, handles submission), StatusStep (5)
- [ ] **4.5.5** Back/Next buttons: Back hidden on step 1 and step 5. Next hidden on step 3+. Next triggers step validation before advancing
- [ ] **4.5.6** `aria-live="polite"` on step content area
- [ ] **4.5.7** Focus management: move focus to step `<h2>` heading on step change via useEffect + ref

### 4.6 Step 1: Date Selection

**File: `resources/js/Components/Booking/DateStep.tsx`**

- [ ] **4.6.1** Initialize React Hook Form with `zodResolver(dateSchema)`, defaults from Zustand
- [ ] **4.6.2** Render `<h2>` "Select Your Dates" with tabIndex={-1} and ref for focus
- [ ] **4.6.3** Check-in date picker: shadcn Popover + Calendar, label "Check-in Date", disable dates before today
- [ ] **4.6.4** Check-out date picker: disable dates before checkIn + 1 day. Disable entirely if no check-in selected
- [ ] **4.6.5** Display calculated nights ("X night(s)") when both dates selected
- [ ] **4.6.6** On valid submit: call `setDates()` on Zustand store, then `nextStep()`
- [ ] **4.6.7** Inline validation errors via shadcn FormMessage

### 4.7 Step 2: Room & Guest Selection

**File: `resources/js/Components/Booking/RoomStep.tsx`**

- [ ] **4.7.1** Accept `propertyData`, init RHF with rooms schema, defaults from Zustand
- [ ] **4.7.2** Render `<h2>` "Choose Your Rooms" with focus ref
- [ ] **4.7.3** For each unit, render a shadcn Card with:
  - First image from `pictures` array (`loading="lazy"`, alt = unit name)
  - Unit name, description
  - Price: "R X per night" (per_unit) or "R X per person per night" (per_person)
  - "Up to X guests" badge, "X available" count
- [ ] **4.7.4** Quantity selector per card: stepper 0 to available_count, aria-labeled
- [ ] **4.7.5** Guest count input (shown when quantity > 0): stepper 1 to max_guests * quantity, aria-labeled
- [ ] **4.7.6** When quantity changes to 0: hide guest input, reset guests. When quantity goes from 0 to 1+: auto-set guests to 1
- [ ] **4.7.7** Real-time per-room line total displayed below each card
- [ ] **4.7.8** Running total at bottom (sticky/fixed): includes tax, uses `aria-live="polite"`
- [ ] **4.7.9** Validate on Next: at least one room selected, guest counts valid
- [ ] **4.7.10** On valid submit: filter out quantity-0 rooms, call `setRooms()`, then `nextStep()`

### 4.8 Step 3: Booking Summary

**File: `resources/js/Components/Booking/SummaryStep.tsx`**

- [ ] **4.8.1** Accept `propertyData` and `auth` props
- [ ] **4.8.2** Render `<h2>` "Booking Summary" with focus ref
- [ ] **4.8.3** Display dates section: formatted check-in, check-out, number of nights
- [ ] **4.8.4** Display rooms section: per-room-type line items with name, quantity, guests, line total
- [ ] **4.8.5** Price breakdown:
  - Per-room line items
  - Subtotal (ex-VAT)
  - Grand Total (VAT-inclusive) wrapped in shadcn **Tooltip**: "Price includes 15% VAT (R X,XXX.XX)". Tooltip keyboard-accessible
- [ ] **4.8.6** Special requests textarea: bound to RHF, Zod max 500, character count "X/500", syncs to Zustand
- [ ] **4.8.7** **If NOT authenticated**: render shadcn Alert "Please log in or create an account to complete your booking" with "Log In" (`/login`) and "Sign Up" (`/register`) links. NO confirm button
- [ ] **4.8.8** **If authenticated**: show user name/email (read-only from `auth.user`), render "Confirm Booking" button (brand orange)
- [ ] **4.8.9** On confirm: set `isSubmitting`, show spinner on button, POST to `/bookings` via Inertia router
- [ ] **4.8.10** POST payload: checkIn, checkOut, rooms [{unitId, quantity, guests}], specialRequests, submitted_total. Prices NOT sent - server recalculates
- [ ] **4.8.11** On success: call `setBookingId(id)`, `goToStep(5)`
- [ ] **4.8.12** On 422 error: display server validation errors inline
- [ ] **4.8.13** On 500 error: show generic error Alert, reset isSubmitting

### 4.9 Step 5: Booking Status

**File: `resources/js/Components/Booking/StatusStep.tsx`**

- [ ] **4.9.1** Read `bookingId` from Zustand store
- [ ] **4.9.2** Render `<h2>` "Booking Status" with focus ref
- [ ] **4.9.3** Poll `GET /api/bookings/${bookingId}/status` every 2.5s using `useEffect` + `setInterval` (or extract to custom hook)
- [ ] **4.9.4** **Pending**: spinner + "Processing your booking..." + "This usually takes a few seconds." (`role="status"`, `aria-live="polite"`)
- [ ] **4.9.5** **Confirmed**: checkmark + "Booking Confirmed!" + confirmation ID + booking summary (`aria-live="assertive"`)
- [ ] **4.9.6** **Failed**: error icon + "Booking Failed" + error message + "Try Again" button (goes to step 3, does NOT clear store)
- [ ] **4.9.7** Stop polling when status is confirmed or failed. Cleanup interval on unmount
- [ ] **4.9.8** Display read-only booking summary alongside status (copy to local state before clearing)
- [ ] **4.9.9** Clear Zustand store (`reset()`) only on confirmed, after rendering confirmation details
- [ ] **4.9.10** Timeout safeguard: after 60s without resolution, stop polling and show "Taking longer than expected" message with booking reference

### 4.10 Custom Polling Hook

**File: `resources/js/Hooks/useBookingStatus.ts`**

- [ ] **4.10.1** Create `useBookingStatus(bookingId: number | null)` hook
- [ ] **4.10.2** Returns: `{ status, confirmationId, isPolling }`
- [ ] **4.10.3** Starts polling when bookingId is not null, stops on confirmed/failed/timeout/unmount
- [ ] **4.10.4** Handles fetch errors gracefully (retry on next interval, don't crash)

### 4.11 Booking Page (Inertia)

**File: `resources/js/Pages/Booking/Index.tsx`**

- [ ] **4.11.1** Receive `propertyData` and `auth` as Inertia page props
- [ ] **4.11.2** Render property header: name + hero image from `propertyData.property.pictures[0]`
- [ ] **4.11.3** Render `BookingWizard` component
- [ ] **4.11.4** Set page title via Inertia `<Head title="Book - Lekke Localhost Lodge" />`
- [ ] **4.11.5** Semantic HTML: `<main>` wrapper, `<header>` for property info

### 4.12 Layout & Styling

- [ ] **4.12.1** Room cards: CSS grid `grid-cols-1 md:grid-cols-2`
- [ ] **4.12.2** Summary: single column mobile, two-column desktop
- [ ] **4.12.3** Step indicator: horizontal desktop, "Step X of 5" on mobile
- [ ] **4.12.4** All touch targets min 44x44px (WCAG 2.1 AA)
- [ ] **4.12.5** Note: brand orange #EC772D on white has ~3.2:1 contrast (fails AA for small text). Use for large button backgrounds with white text only, or darken slightly for text usage

### 4.13 Auth Integration

- [ ] **4.13.1** Access auth via `usePage<PageProps>().props.auth.user`
- [ ] **4.13.2** Login/register links use Inertia `<Link>` to Breeze auth pages. Zustand persist survives navigation
- [ ] **4.13.3** Configure Breeze post-login redirect to `/` (booking page). Zustand rehydrates from localStorage

---

## 5. Testing

### 5.1 Backend Test Setup

- [ ] **5.1.1** [P1] Confirm `.env.testing` uses SQLite `:memory:` database
- [ ] **5.1.2** [P1] Confirm `tests/Pest.php` exists with correct base class
- [ ] **5.1.3** [P1] Run `php artisan test` to verify runner works

### 5.2 Booking Validation Tests (Pest) - P1

**File: `tests/Feature/BookingTest.php`**

- [ ] **5.2.1** [P1] `it rejects booking without authentication` - POST without auth, assert 401/redirect
- [ ] **5.2.2** [P1] `it rejects booking with check_in in the past` - assert 422 on check_in
- [ ] **5.2.3** [P1] `it rejects booking with check_out before check_in` - assert 422 on check_out
- [ ] **5.2.4** [P1] `it rejects booking with missing dates` - assert 422 on both
- [ ] **5.2.5** [P1] `it rejects booking with non-existent unit_id` - unit_id 999, assert 422
- [ ] **5.2.6** [P1] `it rejects booking with quantity exceeding available_count` - 6x Standard Room, assert 422
- [ ] **5.2.7** [P1] `it rejects booking with guests exceeding max_guests * quantity` - 2x Standard (max 2), 5 guests, assert 422
- [ ] **5.2.8** [P1] `it rejects booking with empty rooms` - rooms: [], assert 422
- [ ] **5.2.9** [P1] `it accepts valid booking and returns booking ID` - assert 200/201, assertDatabaseHas with status pending

### 5.3 Price Integrity Tests (Pest) - P1

**File: `tests/Feature/PriceValidationTest.php`**

- [ ] **5.3.1** [P1] `it calculates per_unit price correctly` - 2x Standard Room, 3 nights. Subtotal = 1200 * 3 * 2 = 7200
- [ ] **5.3.2** [P1] `it calculates per_person price correctly` - 1x Family Cottage, 2 nights, 4 guests. Subtotal = 650 * 4 * 2 = 5200
- [ ] **5.3.3** [P1] `it rejects manipulated total` - valid rooms but submitted_total = R1.00, assert 422
- [ ] **5.3.4** [P1] `it calculates VAT at 15%` - verify stored tax_amount = subtotal * 0.15, total = subtotal * 1.15
- [ ] **5.3.5** [P1] `it calculates multi-room correctly` - 2x Standard + 1x Family Cottage (3 guests), 2 nights. Subtotal = (1200*2*2) + (650*3*2) = 4800 + 3900 = 8700

### 5.4 Job Dispatch Tests (Pest) - P1/P2

**File: `tests/Feature/BookingJobTest.php`**

- [ ] **5.4.1** [P1] `it dispatches job when booking created` - Queue::fake(), submit, Queue::assertPushed(ProcessBookingJob::class)
- [ ] **5.4.2** [P1] `it updates status to confirmed on success` - mock ChannelManagerService::book(), run job, assert status = confirmed
- [ ] **5.4.3** [P2] `it updates status to failed after max retries` - call job->failed(), assert status = failed
- [ ] **5.4.4** [P2] `it has correct retry config` - assert $tries = 3, $backoff configured

### 5.5 Status API Tests (Pest) - P1

**File: `tests/Feature/BookingStatusTest.php`**

- [ ] **5.5.1** [P1] `it returns correct booking status` - create booking, GET status, assert 200 + correct status JSON
- [ ] **5.5.2** [P1] `it returns 403 for another user's booking` - User A's booking, auth as User B, assert 403
- [ ] **5.5.3** [P1] `it returns 401 without auth` - GET without auth, assert 401

### 5.6 Frontend Tests (Vitest) - P2

**File: `resources/js/__tests__/utils/calculatePrice.test.ts`**

- [ ] **5.6.1** [P2] `per_unit: price * nights * quantity` - 1200 * 3 * 2 = 7200
- [ ] **5.6.2** [P2] `per_person: price * guests * nights * quantity` - 650 * 2 * 1 * 4 = 5200
- [ ] **5.6.3** [P2] `multi-room total sums correctly`
- [ ] **5.6.4** [P2] `VAT at 15%` - calculateVat(10000) = 1500
- [ ] **5.6.5** [P2] `edge case: 1 night, 1 guest, 1 quantity`
- [ ] **5.6.6** [P3] `per_unit ignores guests in calculation`

**File: `resources/js/__tests__/utils/formatCurrency.test.ts`**

- [ ] **5.6.7** [P2] `formats ZAR with thousands separator` - formatCurrency(1200) contains "R" and "1 200"
- [ ] **5.6.8** [P2] `handles zero` - formatCurrency(0)
- [ ] **5.6.9** [P3] `handles large amounts` - formatCurrency(125000)

**File: `resources/js/__tests__/stores/useBookingStore.test.ts`**

- [ ] **5.6.10** [P2] `sets and retrieves dates`
- [ ] **5.6.11** [P2] `sets and retrieves room selections`
- [ ] **5.6.12** [P2] `step navigation: next, prev, goTo`
- [ ] **5.6.13** [P2] `reset clears all state`

**File: `resources/js/__tests__/schemas/bookingSchema.test.ts`**

- [ ] **5.6.14** [P2] `date schema accepts valid range`
- [ ] **5.6.15** [P2] `date schema rejects inverted dates`
- [ ] **5.6.16** [P2] `room schema validates guest limits`
- [ ] **5.6.17** [P2] `rejects missing required fields`

---

## 6. Polish & Documentation

### 6.1 README.md - P1

- [ ] **6.1.1** [P1] **Architecture Decisions** section: key choices summary (Breeze + Inertia, Zustand persist, queue + polling, server-authoritative pricing, shadcn/ui). Reference key-decisions.md for full detail
- [ ] **6.1.2** [P1] **Setup & Run Instructions** - exact steps:
  1. `git clone <repo> && cd <repo>`
  2. `cp .env.example .env`
  3. `composer install`
  4. `php artisan key:generate`
  5. `php artisan migrate:fresh --seed`
  6. `npm install && npm run build`
  7. `php artisan serve`
  8. Visit `http://localhost:8000`
  9. `php artisan queue:work --stop-when-empty` (second terminal, after booking submission)
- [ ] **6.1.3** [P1] **What I Would Add With More Time**: Redis caching, Sentry, WebSockets, rate limiting, E2E tests, i18n, payment integration, booking cancellation, email notifications, loading skeletons, server-side session backup
- [ ] **6.1.4** [P1] **AI Workflow** section: describe Claude Code usage, link to exported transcripts
- [ ] **6.1.5** [P1] **Assumptions**: prices ex-VAT in JSON, VAT-inclusive display (SA Consumer Protection Act), SQLite for dev, no date-specific availability blocking, customer = authenticated user
- [ ] **6.1.6** [P2] **Running Tests** section: `php artisan test` and `npx vitest`

### 6.2 Manual UX Verification - P1/P2

- [ ] **6.2.1** ⚠️ **MANUAL** [P1] **Auth flow**: guest browsing -> fill dates/rooms -> summary -> prompted to login -> login -> state preserved -> submit successfully
- [ ] **6.2.2** ⚠️ **MANUAL** [P1] **Refresh persistence**: fill dates and rooms -> hard refresh -> data still there
- [ ] **6.2.3** ⚠️ **MANUAL** [P2] **Loading states**: spinners on data load, submission, and polling
- [ ] **6.2.4** ⚠️ **MANUAL** [P2] **Error handling**: submit booking, run queue worker, if all retries fail -> status page shows "failed"
- [ ] **6.2.5** ⚠️ **MANUAL** [P2] **Step navigation**: forward/backward without data loss

### 6.3 Accessibility Verification - P2/P3

- [ ] **6.3.1** ⚠️ **MANUAL** [P2] Tab through entire form - all elements reachable, logical focus order
- [ ] **6.3.2** ⚠️ **MANUAL** [P2] Date picker keyboard accessible
- [ ] **6.3.3** ⚠️ **MANUAL** [P3] Room inputs properly labeled (aria-label)
- [ ] **6.3.4** ⚠️ **MANUAL** [P3] VAT tooltip accessible via keyboard
- [ ] **6.3.5** ⚠️ **MANUAL** [P3] Step transitions announce to screen readers

---

## 7. Submission Checklist

- [ ] **7.1** [P1] Git repo clean: `git status` shows no uncommitted changes
- [ ] **7.2** [P1] Meaningful commit history: conventional commits, small atomic commits, Co-Authored-By tags
- [ ] **7.3** [P1] README.md complete (all sections from 6.1)
- [ ] **7.4** [P1] AI session transcripts exported and included in `docs/ai-sessions/`
- [ ] **7.5** [P1] All tests pass: `php artisan test` and `npx vitest --run` both exit 0
- [ ] **7.6** [P1] App runs from scratch: `composer install && npm install && php artisan migrate:fresh --seed && php artisan serve` + `npm run dev`
- [ ] **7.7** [P1] Queue works: submit booking -> `php artisan queue:work --stop-when-empty` -> status transitions to confirmed/failed
- [ ] **7.8** [P2] No `.env` or credentials committed
- [ ] **7.9** [P2] `key-decisions.md` and `CLAUDE.md` committed
- [ ] **7.10** [P3] `npm run build` succeeds (production build)

---

## 8. Time Pressure Triage

If running low on time, prioritize in this order:

### Must Have (core assessment criteria)
1. Working multi-step form (steps 1-3 + submission + status)
2. Server-side validation and price recalculation
3. Queue job with retry for ChannelManagerService
4. Auth gating on submission with state preservation
5. Backend tests (validation + price integrity)
6. README with setup instructions

### Should Have
7. Frontend tests (price calc, store, schemas)
8. Polling for booking status
9. Special requests field
10. Property images in room cards
11. Brand colors

### Nice to Have (skip if under 30 min remaining)
12. Accessibility polish (focus management, aria-live)
13. Loading skeletons / timeout safeguards
14. Commitlint + Husky setup
15. E2E verification of edge cases

### If Time Runs Out
Document everything you didn't build in the "What I Would Add" section of the README. An incomplete but well-documented MVP with clear architecture decisions is better than a rushed complete implementation.
