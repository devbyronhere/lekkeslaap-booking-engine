# Implements OTA Multi-Step Booking Engine

## Description 🎙️

- Built a complete multi-step booking wizard with 5 steps: date selection, room/guest allocation, booking summary, submission, and status display
- Integrated Laravel Breeze authentication - guests can browse freely but must log in to submit, with form state preserved across auth redirects via Zustand persist (localStorage)
- Server-authoritative pricing with 15% VAT - client calculates for display, server recalculates and validates on submission to prevent price manipulation
- Queued booking processing via `ProcessBookingJob` with 3 retries and exponential backoff (5s, 15s, 45s) to handle the slow/unreliable ChannelManagerService
- Frontend polls booking status every 2.5s with a 60s timeout safeguard
- Property data cached server-side (1 hour) with Cache-Control headers
- Full backend validation via `StoreBookingRequest` Form Request - verifies unit IDs exist in property.json, quantities don't exceed availability, and guest counts respect room capacity

## Context or background 🏞️

Technical take-home assessment for LekkeSlaap Intermediate Full-Stack Software Engineer position. The task requires building the core booking flow for an OTA, handling an unreliable upstream Channel Manager API, and ensuring data integrity under the assumption that the user is untrustworthy.

**Stack:** Laravel 12 + Breeze + Inertia.js, React 18 + TypeScript + Tailwind CSS v4, shadcn/ui (Radix), React Hook Form + Zod, Zustand, SQLite, Pest + Vitest

## Data inputs and responses 🔬

**Input:** `property.json` - source of truth for rooms and pricing (3 room types with per-night rates)

**Booking submission payload:**
- Check-in/check-out dates
- Room selections (unit ID, quantity, adults, children per room)
- Client-calculated total (validated against server calculation)

**Booking status responses:**
- `pending` - Job queued, awaiting processing
- `confirmed` - ChannelManagerService returned success
- `failed` - All retries exhausted

## Screenshots and recordings 📸

https://www.loom.com/share/e09f948e86a84749a680c5a8b229fc62

## How should this be tested 🧪

### Automated tests
```bash
# Backend (Pest) - validation, price integrity, job dispatch, API endpoints
php artisan test

# Frontend (Vitest) - Zod schemas, price calculations, Zustand store, formatCurrency
npx vitest --run
```

### Manual testing
1. Visit `http://localhost:8000`, select dates, allocate rooms/guests
2. Verify price updates in real-time with VAT tooltip on the total
3. Navigate back and forth between steps - state should persist
4. Refresh the page - selections should survive
5. Proceed to summary as guest - should be prompted to log in
6. Log in/register and verify selections are preserved
7. Submit booking, then run `php artisan queue:work --stop-when-empty`
8. Watch the status page poll and update (confirmed or failed)

## Checklist ✅

- [x] 🎨 My code follows the style guidelines of this project
- [x] 🔎 I have performed a self-review of my own code
- [x] ✍️ I have commented my code in hard-to-understand areas
- [x] ⚠️ My changes generate no new warnings
- [x] 🧪 I have added tests that prove my fix is effective or that my feature works
- [x] 🛂 New and existing unit tests pass locally with my changes
- [x] 📦 I have created and committed a relevant migration file if making database changes
