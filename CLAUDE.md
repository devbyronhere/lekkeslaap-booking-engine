# CLAUDE.md - OTA Booking Engine Assessment

## Project Overview

Building a multi-step OTA booking form for a LekkeSlaap interview assessment. The form handles date selection, room/guest allocation, booking summary, submission, and status display. Authentication is required to submit but not to browse.

## Tech Stack

- **Backend:** Laravel + Breeze + Inertia.js (PHP)
- **Frontend:** React + TypeScript + Tailwind CSS
- **Components:** shadcn/ui (Radix primitives)
- **Forms:** React Hook Form + Zod (zodResolver)
- **State:** Zustand with persist middleware (localStorage)
- **Database:** SQLite (development)
- **Testing:** Pest (PHP backend), Vitest + React Testing Library (frontend)
- **Auth:** Laravel Breeze (session-based)

## Key Commands

```bash
php artisan serve                          # Start Laravel dev server
npm run dev                                # Start Vite dev server
php artisan test                           # Run Pest tests
npx vitest                                 # Run frontend tests
php artisan queue:work --stop-when-empty   # Process queued jobs
php artisan migrate                        # Run database migrations
php artisan migrate:fresh --seed           # Reset and seed database
```

## Architecture Notes

- **Inertia.js** bridges Laravel controllers to React pages (no separate API layer)
- **API routes** used alongside Inertia for async operations (booking status polling)
- **Server-authoritative pricing** - client calculates for display, server validates on submission
- **ChannelManagerService** is slow (1-4s) and unreliable (25% failure) - use Laravel queue jobs with retry
- **Polling** (every 2-3s) for booking status updates on the frontend
- **Property data** cached server-side (rarely changes) with Cache-Control headers
- **Zustand persist** stores wizard state in localStorage (survives refresh and auth redirect)
- **15% VAT** shown in tooltip over total price

## Code Style

### General
- Descriptive variable and function names
- Comments only where they add value - for hard-to-understand code or to explain non-obvious decisions
- Parse don't validate (Zod for parsing, not just checking)
- No code duplication - extract reusable logic
- Performance-conscious (code splitting, lazy loading where appropriate)
- Fail fast - validate early, return early
- No magic numbers - use Tailwind config, constants, or named variables
- Watch for global side effects when editing shared UI components

### TypeScript
- Strict mode enabled
- Prefer type inference where types are obvious
- Use Zod schemas as the source of truth for types (z.infer<typeof schema>)
- No `any` types unless absolutely necessary with a comment explaining why

### Tailwind CSS
- Use config files for design tokens (colors, spacing, etc.)
- No magic numbers in class strings
- Always use cn() for class composition when more than one Tailwind class is used
- Brand colors: orange (#EC772D), dark gray (#5A5B5D), white (#FFFFFF)

### React
- Functional components only
- Custom hooks for reusable logic
- Keep components focused - one responsibility per component
- Use loading spinners for async operations

### PHP/Laravel
- Follow Laravel conventions for controllers, models, services
- Form Request classes for validation
- Resource classes for API responses where needed

## Testing Rules
- Test all logic, but don't overtest
- Never test third-party library behavior - assume it works, test our integration
- Each test must add clear value
- Backend: Pest for validation, price integrity, job dispatch, API endpoints
- Frontend: Vitest + RTL for form logic, price calculations, state management
- Prefer testing behavior over implementation details

## Git & Workflow
- Working branch: `feature/booking-engine`
- Conventional Commits: feat:, fix:, test:, docs:, refactor:, chore:
- Enforced by commitlint + Husky
- Annotated tags only (pre-push hook rejects lightweight tags)
- PRs target main
- Commit every time a feature is completed and/or tested working - do not batch unrelated changes
- Atomic commit messages - each commit describes one logical change
- Small, atomic commits - one logical change per commit

## Writing Style
- Never use em dashes in any text output - use regular dashes, commas, or restructure sentences
- Be concise and direct
- Use plain language

## Key Constraints
- 3-5 hour time budget - prioritize MVP, document what you'd add with more time
- User is untrustworthy - validate everything server-side
- ChannelManagerService is unreliable - queue jobs with retry, never block the user
- Form state must survive page refresh and auth redirect
- Fully accessible (WCAG 2.1 AA) - keyboard navigation, screen reader support, semantic HTML
- Property data from property.json is the source of truth for rooms and pricing
