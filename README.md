# OTA Booking Engine - Lekke Localhost Lodge

A multi-step booking form for an Online Travel Agency, built as a technical assessment for LekkeSlaap.

## Architecture Decisions

### Stack
- **Backend:** Laravel 12 + Breeze + Inertia.js (PHP 8.5)
- **Frontend:** React 18 + TypeScript + Tailwind CSS v4 + shadcn/ui (Radix)
- **State:** Zustand with localStorage persistence (survives refresh and auth redirects)
- **Forms:** React Hook Form + Zod for client-side validation
- **Database:** SQLite (development)
- **Queue:** Laravel database queue for async booking processing

### Key Design Choices

1. **Inertia.js over separate API** - Since Breeze already includes Inertia, this eliminates the need for a separate REST API layer. The exception is the booking status polling endpoint, which uses a standard JSON API route for lightweight async polling.

2. **Server-authoritative pricing** - The frontend calculates prices for real-time display, but the server recalculates everything on submission. The client-submitted total is compared against the server calculation to detect price manipulation.

3. **Queue + polling for ChannelManagerService** - The unreliable external API (1-4s latency, 25% failure rate) is handled via a queued job with 3 retries and exponential backoff (5s, 15s, 45s). The frontend polls every 2.5s for status updates, with a 60s timeout safeguard.

4. **Zustand with persist middleware** - Wizard state is stored in localStorage, so progress survives page refreshes and authentication redirects. When a guest is prompted to log in at the summary step, their selections are preserved.

5. **shadcn/ui components** - Pre-built accessible components (Calendar, Tooltip, Dialog) to avoid reinventing the wheel. The plan notes the brand orange (#EC772D) has ~3.2:1 contrast ratio on white, so it's used only for large button backgrounds with white text.

6. **Form Request validation** - Laravel Form Requests handle all server-side validation including custom rules that verify unit IDs exist in property.json, quantities don't exceed availability, and guest counts respect room capacity.

## Setup & Run Instructions

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 20+
- npm

### Installation

```bash
git clone https://github.com/devbyronhere/lekkeslaap-booking-engine.git
cd lekkeslaap-booking-engine
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate:fresh
npm install
npm run build
```

### Running the App

```bash
# Terminal 1: Start Laravel
php artisan serve

# Terminal 2: Start Vite (for development with HMR)
npm run dev
```

Visit `http://localhost:8000`

### Processing Bookings

After submitting a booking, process the queue in a separate terminal:

```bash
php artisan queue:work --stop-when-empty
```

The booking status page will update automatically via polling.

### Running Tests

```bash
# Backend (Pest)
php artisan test

# Frontend (Vitest)
npx vitest --run
```

## Assumptions

- Prices in property.json are exclusive of VAT. The displayed total is VAT-inclusive (15% VAT, per SA Consumer Protection Act).
- SQLite is sufficient for development/assessment. Production would use MySQL/MariaDB.
- No date-specific availability blocking - rooms are available for any future date range.
- The authenticated user is the booking customer (no booking-on-behalf-of).
- Property data rarely changes (cached for 1 hour server-side).

## What I Would Add With More Time

- **Redis caching** - Replace file cache with Redis for production performance
- **WebSockets** - Replace polling with Laravel Echo + Pusher/Soketi for real-time status updates
- **Rate limiting** - Throttle booking submissions and API endpoints
- **E2E tests** - Playwright tests for the full booking flow including auth
- **Email notifications** - Booking confirmation and failure emails via Laravel Mail
- **Booking cancellation** - Allow users to cancel pending/confirmed bookings
- **Loading skeletons** - Skeleton UI instead of spinners for better perceived performance
- **i18n** - Afrikaans language support (fitting for LekkeSlaap's bilingual platform)
- **Payment integration** - Stitch Payouts or similar for real payment processing
- **Sentry/error tracking** - Production error monitoring
- **Server-side session backup** - Store wizard state in session as a fallback to localStorage
- **Date-specific availability** - Block dates that are already booked

## AI Workflow

This project was built using Claude Code (Anthropic's agentic AI CLI). AI session transcripts are included in the `docs/ai-sessions/` directory.

The workflow involved:
1. Planning the architecture and making key decisions upfront
2. Using Claude Code to scaffold the project and implement features
3. Reviewing and guiding AI output at each step
4. Iterating on issues (Tailwind v3/v4 conflict, Vite peer deps, etc.)

---

Built by Byron Devin for the LekkeSlaap Intermediate Full-Stack Software Engineer assessment.
