# Key Decisions - OTA Booking Engine

## Status Key
- DECIDED - Decision made, rationale documented
- PENDING - Awaiting Byron's input (see open-questions.md)

---

## 1. Frontend Framework

**Decision:** React with TypeScript

**Status:** DECIDED

**Explanation:** The task allows React or Vue. Byron's core stack is React/TypeScript, and LekkeSlaap uses React in production.

**Options:**
| Option | Pros | Cons |
|--------|------|------|
| React + TypeScript | Byron's strongest stack, matches LekkeSlaap's production stack, huge ecosystem | None for this context |
| Vue + TypeScript | Also allowed by task | Not Byron's primary framework, less strategic alignment |

**Decision rationale:** React is Byron's strength and aligns with what LekkeSlaap actually uses. TypeScript adds type safety and demonstrates production maturity.

---

## 2. Application Architecture - Laravel Breeze + Inertia.js vs Decoupled API

**Decision:** Laravel Breeze + Inertia.js (React) with API routes for async operations

**Status:** DECIDED

**Explanation:** The task recommends Laravel Breeze for auth scaffolding. Breeze with React ships with Inertia.js (server-driven SPA). Inertia handles page routing, auth, data loading. API routes used alongside for booking submission and status polling.

**Options:**
| Option | Pros | Cons |
|--------|------|------|
| Laravel Breeze + Inertia.js (React) | Recommended by task, handles auth boilerplate, SSR-like data passing, fast setup, shows Laravel competency, LekkeSlaap's own site appears to use Inertia (Ziggy routes detected) | Inertia is opinionated, less common outside Laravel ecosystem, Byron hasn't used it before |
| Decoupled: Laravel API + React SPA (Vite) | Clean separation, more familiar pattern for Byron, standard REST/API approach | More auth boilerplate to wire up, task explicitly recommends Breeze |
| Laravel Breeze + Inertia.js, but use API routes where needed | Best of both - Breeze for auth scaffolding, Inertia for page routing, API routes for async operations (booking status polling) | Slight complexity of mixing patterns |

**Recommendation:** Option 3 (Breeze + Inertia hybrid). It follows the task's recommendation, saves time on auth, and shows willingness to work within the Laravel ecosystem. We can still use API routes for things like booking submission and status polling. LekkeSlaap's actual site uses this pattern (Ziggy + React detected in their source).

---

## 3. Authentication Approach

**Decision:** Laravel Breeze (built-in)

**Status:** DECIDED

**Explanation:** Auth is needed but is not the focus. Users browse as guests, must auth to submit. State must persist through login/signup.

**Options:**
| Option | Pros | Cons |
|--------|------|------|
| **Laravel Breeze (built-in)** | Task explicitly recommends it, zero extra dependencies, session-based auth works perfectly with Inertia, handles CSRF automatically | Basic UI (but design isn't being tested) |
| Clerk | Polished auth UI, social logins, easy setup | External dependency, overkill for assessment scope, task recommends Breeze, adds complexity to state persistence across auth, requires API keys/account setup |
| Laravel Fortify + custom UI | More control over auth UI | More work than Breeze for same result |

**Decision rationale:** The task literally says "We recommend using a starter kit like Laravel Breeze." Breeze's session-based auth makes "preserve form state on login" trivial since the session persists. Wizard state in localStorage (via Zustand) also survives the auth redirect naturally. Clerk was considered but rejected as overkill and contrary to the task's recommendation.

---

## 4. Database

**Decision:** SQLite

**Status:** DECIDED

**Explanation:** Need to persist bookings. Task says SQLite is preconfigured with Breeze and that "the core booking logic should be your main focus."

**Options:**
| Option | Pros | Cons |
|--------|------|------|
| **SQLite** | Zero config, preconfigured with Breeze, task mentions it, good enough for assessment | Not production-grade for high-traffic |
| MySQL | Matches LekkeSlaap's production stack (MySQL/MariaDB), demonstrates awareness | Extra setup steps, time spent on non-core logic |
| PostgreSQL | Byron's most familiar DB | Not in LekkeSlaap's stack, extra setup |

**Decision rationale:** SQLite saves time for zero downside in an assessment context. README will note that MySQL/MariaDB would be used in production to match LekkeSlaap's infrastructure.

---

## 5. UI Component Library

**Decision:** shadcn/ui + Tailwind CSS

**Status:** DECIDED

**Explanation:** Need date picker, tooltips, form components. Task says "use any third-party libraries, don't build complex components from scratch." The task does not specify a component library. LekkeSlaap's own site uses custom CSS with Pikaday for date picking and imgix React SDK for images.

**Options:**
| Option | Pros | Cons |
|--------|------|------|
| **shadcn/ui + Radix primitives** | Beautiful defaults, accessible, Tailwind-native, copy-paste (not dependency), highly customizable, great with cn() | Setup takes a few minutes |
| Headless UI + custom styling | Fully accessible, minimal | More styling work |
| Material UI / Ant Design | Lots of components | Heavy, not Tailwind-native, opinionated styling |
| Mantine | Good DX, built-in hooks | Not Tailwind-native |

**Decision rationale:** shadcn/ui is Tailwind-native, accessible by default (built on Radix), works perfectly with cn(), and components are copied into the project (not a dependency). Has all needed components: DatePicker, Tooltip, Card, Button, Form, Dialog. Matches Byron's Tailwind-first approach.

---

## 6. UI Design Approach

**Decision:** PENDING (see open-questions.md Q11)

**Status:** PENDING

**Explanation:** The task states "you are not being tested on your design, you can use default components and styling." Time is 3-5 hours.

**Options:**
| Option | Pros | Cons |
|--------|------|------|
| Pure shadcn defaults | Fast, professional-looking by default, time spent on logic instead | Doesn't show brand awareness |
| shadcn defaults + LekkeSlaap brand colors | Small time investment (~10 min), shows awareness without going overboard | Minor effort |
| More polished with property images and layout inspiration | Shows initiative | Significant time for something they said doesn't matter |

**Brand colors (confirmed from LekkeSlaap's site):**
| Color | Hex | Usage |
|-------|-----|-------|
| Orange | `#EC772D` | Primary brand accent, CTAs, badges |
| Dark gray | `#5A5B5D` | Text/secondary |
| White | `#FFFFFF` | Backgrounds |

**Recommendation:** Option 2. shadcn defaults with LekkeSlaap's orange (#EC772D) as the primary color in Tailwind config. Minimal time, shows brand awareness.

---

## 7. Form Handling

**Decision:** React Hook Form + Zod (via zodResolver)

**Status:** DECIDED

**Explanation:** Multi-step form with validation across steps, server-side validation mirroring.

**Options:**
| Option | Pros | Cons |
|--------|------|------|
| **React Hook Form + Zod** | Industry standard, excellent multi-step support, Zod schemas can be shared/reused, zodResolver integrates cleanly, uncontrolled by default (performant) | None significant |
| Formik + Yup | Older but proven | Heavier, controlled inputs by default, less performant |
| Native React state | No dependencies | Massive boilerplate for multi-step validation |

**Decision rationale:** React Hook Form + Zod is the right tool for this. Zod schemas define validation once and can be reused for both client and conceptual parity with server-side validation. The "parse don't validate" principle aligns perfectly with Zod's parse-based approach.

---

## 8. Multi-Step Form State Management

**Decision:** Zustand with persist middleware

**Status:** DECIDED

**Explanation:** Need to manage state across 5 steps, persist on refresh, preserve through auth flow.

**Options:**
| Option | Size | Boilerplate | Persistence | Provider needed | Learning curve |
|--------|------|-------------|-------------|----------------|---------------|
| **Zustand + persist** | ~1KB | Minimal | Built-in middleware | No | Low |
| Redux Toolkit | ~11KB | Moderate (slices, reducers) | Needs redux-persist | Yes (Provider) | Medium |
| React Context + useReducer | 0KB (built-in) | High (reducer, context, provider, manual localStorage sync) | Manual | Yes | Low but verbose |
| Jotai | ~2KB | Minimal (atomic) | Plugin | No | Low |

**Decision rationale:** Zustand is tiny (~1KB), requires no Provider wrapper, and its persist middleware handles localStorage automatically. Works cleanly alongside React Hook Form (Zustand for wizard state/selections, RHF for form field validation). The persist middleware makes "survive refresh" and "survive auth redirect" a one-line config instead of manual wiring.

---

## 9. State Persistence Strategy (Survive Refresh)

**Decision:** localStorage via Zustand persist

**Status:** DECIDED

**Explanation:** Task requires: "Users must be able to go back and forth between steps without losing progress (even on refresh)."

**Options:**
| Option | Pros | Cons |
|--------|------|------|
| **localStorage (via Zustand persist)** | Survives refresh, survives auth redirect, client-side, fast | Cleared if user clears browser data |
| sessionStorage | Scoped to tab, survives refresh | Doesn't survive new tab |
| Server-side session (Laravel) | Most robust, survives device switch | Round-trip latency, more backend work |
| URL params | Shareable, bookmarkable | Complex state doesn't serialize well, exposes data |

**Decision rationale:** localStorage via Zustand persist is the simplest approach that meets all requirements: survives refresh, survives auth redirect (critical), and is fast. README will note that production would add server-side session backup for cross-device support.

---

## 10. Handling the Unreliable ChannelManagerService

**Decision:** Queue job with retry + frontend polling

**Status:** DECIDED (pending confirmation on polling - see open-questions.md Q12)

**Explanation:** The service is slow (1-4s) and fails 25% of the time. Task says: "user is not left staring at a frozen browser" and "a temporary network hiccup does not permanently lose a booking."

**Architecture:**
1. User submits booking -> Laravel saves to DB with status "pending"
2. Laravel dispatches a queued job to call ChannelManagerService
3. Job retries on failure (Laravel's built-in retry with exponential backoff, 3 attempts)
4. Frontend polls for status updates every 2-3 seconds
5. User sees a status page immediately (not a frozen browser)

**Frontend status update options:**
| Option | Pros | Cons |
|--------|------|------|
| **Polling (every 2-3s)** | Simple, works everywhere, easy to implement | Slightly wasteful requests |
| Server-Sent Events (SSE) | Real-time, one-way | Needs specific Laravel setup |
| WebSockets (Laravel Echo + Pusher/Soketi) | True real-time, bidirectional | Overkill, significant setup time |

**Decision rationale:** Polling is appropriate because the booking resolves in 1-4 seconds (3-6 poll requests max). No additional infrastructure needed. Task hints at this approach: "process pending jobs manually by running php artisan queue:work." WebSockets/SSE noted as production enhancement in README.

---

## 11. Property Data Caching

**Decision:** Laravel file cache + Cache-Control headers

**Status:** DECIDED

**Explanation:** Task says property data "rarely changes hour-to-hour. Optimise how your backend delivers this to the frontend."

**Options:**
| Option | Pros | Cons |
|--------|------|------|
| **Laravel Cache (file driver) with TTL** | Simple, no extra services, shows caching awareness | File cache is single-server |
| Redis cache | Production-grade, fast, matches LekkeSlaap stack | Requires Redis running locally |
| HTTP Cache-Control headers + ETag | Browser caching, reduces requests entirely | Less control over invalidation |

**Decision rationale:** Laravel's built-in cache with file driver for assessment simplicity, plus Cache-Control headers. Cache for 1 hour. README notes Redis would be used in production. This demonstrates caching strategy without over-engineering.

---

## 12. Price Calculation - Server Authority

**Decision:** Server-side is source of truth, client calculates for UX

**Status:** DECIDED

**Explanation:** Task says "assume user is untrustworthy" and "no manipulated prices pass backend validation."

**Approach:**
- Client calculates prices for real-time display (responsive UX)
- Server recalculates and validates all prices on submission (source of truth)
- If client and server prices don't match, reject the submission
- Price logic is defined once (Zod schema for shape, server for calculation authority)

---

## 13. Testing Strategy

**Decision:** Pest (backend) + Vitest (frontend)

**Status:** DECIDED

**Explanation:** Need meaningful tests that prove our logic works. Don't overtest. Don't test third-party libraries.

| Layer | Tool | What to test |
|-------|------|-------------|
| Backend unit/feature | Pest | Booking validation, price calculation, job dispatch, API endpoints |
| Frontend unit | Vitest + React Testing Library | Form step logic, price calculation display, state management |
| E2E (if time permits) | Playwright | Full booking flow happy path |

**Priority order (given 3-5 hour constraint):**
1. Backend feature tests (Pest) - booking validation and price integrity (the "system integrity" requirement)
2. Frontend unit tests (Vitest) - price calculation, form validation logic
3. One E2E test if time permits - happy path booking flow

**Skip:** Auth tests (Breeze handles this), component rendering tests (testing the library), trivial getter tests.

**Decision rationale:** Pest chosen for PHP backend because it has cleaner syntax (similar to Jest/Vitest) and is the modern Laravel testing standard. Vitest for frontend as Byron's preferred tool. Both layers need testing because the task emphasizes backend validation ("no manipulated prices") and frontend UX.

---

## 14. Error Handling and Monitoring

**Decision:** Structured error handling, no Sentry

**Status:** DECIDED

**Explanation:** Focus on clean error handling in code, mention Sentry as production enhancement.

**Approach:**
- Structured JSON error responses from the API
- Proper HTTP status codes (422 for validation, 500 for server errors, 503 for ChannelManager failures)
- User-friendly error messages on the frontend (no raw error dumps)
- Laravel's built-in logging for server-side errors
- Try/catch with meaningful error boundaries in React
- Graceful degradation when ChannelManagerService fails

**Decision rationale:** Sentry skipped - extra setup time for something that doesn't demonstrate core engineering skills. Clean error handling in the code itself (structured responses, proper HTTP codes, user-friendly messages) matters more for an assessment. Sentry noted as production enhancement in README.

---

## 15. Loading States

**Decision:** Spinners

**Status:** DECIDED

**Explanation:** UX during data fetching and transitions.

**Options:**
| Option | Pros | Cons |
|--------|------|------|
| Loading skeletons | Modern, polished UX, prevents layout shift | Minor implementation time |
| **Spinner** | Simple, universal, fast to implement | Dated, layout shift |
| Skeleton for initial load, spinner for actions | Best of both | Slightly more code |

**Decision rationale:** Spinners for all loading states. Simple, fast to implement, appropriate for time constraint. Skeletons noted as enhancement for polish.

---

## 16. AI-Augmented Engineering Showcase

**Decision:** PENDING (see open-questions.md Q13)

**Status:** PENDING

**Explanation:** Task explicitly encourages AI tools and requires chat logs. Need to decide scope of demonstration.

**Must-haves (near-zero time cost):**
- CLAUDE.md at repo root (done)
- Session transcripts via /export (assessment requirement)
- Co-Authored-By tags on commits (automatic with Claude Code)
- README section on AI workflow with links to transcripts
- key-decisions.md (this file, done)

**High-value (small time investment):**
- Conventional Commits with clear messages (already in workflow)
- .claude/commands/ with 1-2 custom slash commands
- Plan mode outputs saved to docs/plans/

**Medium-value (if time permits):**
- .claude/settings.json committed
- Feature branches with PR descriptions
- Individual ADR files in docs/decisions/

**Advanced (impressive but likely skip for time):**
- Hooks configuration
- MCP servers
- Skills definitions

---

## 17. Accessibility (a11y)

**Decision:** Follow WCAG 2.1 AA baseline

**Status:** DECIDED

**Explanation:** Task says "fully usable by everyone, regardless of how they navigate the web." This means keyboard navigation, screen reader support, and semantic HTML.

**Approach:**
- shadcn/ui (Radix primitives) provides accessible components out of the box
- Semantic HTML (form, fieldset, legend, label, button)
- ARIA attributes where needed (step indicator, live regions for price updates)
- Keyboard navigation through all steps
- Focus management on step transitions
- Color contrast (shadcn defaults meet AA)

---

## 18. Project Structure

**Decision:** Standard Laravel Breeze + Inertia structure

**Status:** DECIDED

**Recommendation:**
```
/
  app/
    Http/
      Controllers/
      Requests/          (Form Request validation)
    Models/
    Services/
      ChannelManagerService.php
    Jobs/
  resources/
    js/
      Components/
        Booking/
          DateStep.tsx
          RoomStep.tsx
          SummaryStep.tsx
          StatusStep.tsx
          BookingWizard.tsx
        ui/              (shadcn components)
      Pages/
        Booking/
          Index.tsx
      Hooks/
      Lib/
        schemas/         (Zod schemas)
        utils/
      Stores/            (Zustand)
    css/
  routes/
    web.php              (Inertia page routes)
    api.php              (Booking status polling)
  database/
    migrations/
  tests/
    Feature/             (Pest)
    Unit/                (Pest)
  resources/js/__tests__/ (Vitest)
  CLAUDE.md
  key-decisions.md
  open-questions.md
  docs/
    ai-sessions/         (exported transcripts)
```

---

## 19. Multi-Room Bookings

**Decision:** Yes, users can book multiple room types in one booking

**Status:** DECIDED

**Explanation:** A single booking can include multiple room types with different quantities (e.g., 2x Standard Room + 1x Deluxe Suite). The `available_count` field on each unit supports this.

**Decision rationale:** This is what real OTAs do. It makes the room selection step more interesting and demonstrates a more complete booking engine. The pricing logic is slightly more complex but not dramatically so.

---

## 20. Guest Allocation Model

**Decision:** Per-room-type guest count (Option A)

**Status:** DECIDED

**Explanation:** Users select a quantity of each room type and a total guest count per room type. No per-individual-room guest assignment.

**UI pattern:**
| Room type selected | User inputs | Validation |
|---|---|---|
| 2x Standard Room (per_unit) | "3 guests" | Guests <= max_guests (2) x quantity (2) = 4 |
| 1x Family Cottage (per_person) | "4 guests" | Guests <= max_guests (6) x quantity (1) = 6 |
| 3x Backpacker Bunk (per_person) | "3 guests" | Guests <= max_guests (1) x quantity (3) = 3 |

**Decision rationale:** This is the pattern most OTAs use (Booking.com, LekkeSlaap). Simpler UI than per-room assignment, and for `per_person` pricing we need a guest count anyway. For `per_unit` pricing, guest count is only used for capacity validation.

---

## 21. Pricing Model and VAT Display

**Decision:** Prices in property.json are ex-VAT. Display all prices VAT-inclusive. Tooltip shows VAT breakdown.

**Status:** DECIDED

**Explanation:** The property.json has a separate `tax_rate: 0.15` field, and the task says "Include a tooltip over the total price showing the tax amount (15% VAT)."

**Pricing calculation:**

| Unit | Model | Calculation |
|------|-------|-------------|
| Standard Room | per_unit | R1,200 x nights x quantity |
| Deluxe Suite | per_unit | R2,500 x nights x quantity |
| Family Cottage | per_person | R650 x guests x nights x quantity |
| Backpacker Bunk | per_person | R250 x guests x nights x quantity |

Then:
- Subtotal = sum of all room calculations
- VAT = subtotal x 0.15
- **Displayed total = subtotal + VAT** (VAT-inclusive, this is what the user sees)
- Tooltip on total: "Price includes 15% VAT (R X.XX)"

**Decision rationale:** Prices stored ex-VAT is the industry standard for booking engines (tax rates vary, can change). Displaying VAT-inclusive prices follows South African Consumer Protection Act requirements and matches LekkeSlaap's own site. The tooltip satisfies the task requirement to show the tax amount. This is documented as an assumption in the README.

---

## 22. ChannelManagerService Booking Data Schema

**Decision:** Custom schema based on industry channel manager standards

**Status:** DECIDED

**Explanation:** The `ChannelManagerService::book()` method accepts any `array $bookingData` - it never reads specific keys. The schema is our design decision. Based on research of Booking.com, Channex, SiteMinder, and OpenTravel standards.

**Schema:**
```php
[
    'reservation_id' => 'BK-ABC123',
    'status' => 'new',
    'property_id' => 101,
    'check_in' => '2026-04-01',
    'check_out' => '2026-04-03',
    'nights' => 2,
    'currency' => 'ZAR',
    'rooms' => [
        [
            'unit_id' => 1,
            'unit_name' => 'Standard Room',
            'quantity' => 2,
            'guests' => 4,
            'pricing_model' => 'per_unit',
            'unit_price' => 1200.00,
            'subtotal' => 4800.00,
        ],
    ],
    'subtotal' => 4800.00,
    'tax_rate' => 0.15,
    'tax_amount' => 720.00,
    'total_price' => 5520.00,
    'customer' => [
        'name' => 'Byron Devin',
        'email' => 'byron@example.com',
    ],
    'special_requests' => 'Late check-in, ground floor room please',
]
```

**Key naming decisions:**
- `customer` (not `guest` or `booker`) - the authenticated user making the reservation. "Customer" is used by Channex and aligns with the OTA's relationship to the person paying. Guests are the people staying, which may differ from the customer.
- `special_requests` - optional free-text field, standard across all booking platforms

**Decision rationale:** Schema includes all fields the task validates (dates, rooms, guests, prices) plus industry-standard metadata (reservation_id, status, currency, per-room breakdowns). No phone number - not in task scope and Breeze doesn't collect it. Noted as future enhancement.

---

## 23. Date Constraints

**Decision:** Min 1 night, no max cap, allow same-day check-in, block past dates

**Status:** DECIDED

**Explanation:** The task says "Ensure no invalid dates" but doesn't specify exact constraints.

**Rules:**
- Check-out must be at least 1 day after check-in (minimum 1 night stay)
- No maximum future booking cap (keep it simple)
- Same-day check-in allowed (check-in date can be today)
- Past dates blocked (earliest check-in is today)
- Both dates required, validated as valid date strings

**Decision rationale:** These are reasonable defaults for a booking platform. Documented as assumptions in the README. A real production system would add property-specific min/max stay rules and date-specific availability.

---

## 24. Submission Fields

**Decision:** Auth user data (name, email) + optional special requests textarea

**Status:** DECIDED

**Explanation:** The task focuses on booking logic, not guest profile collection. Auth gives us the customer's name and email.

**Fields collected:**
- `name` - from authenticated user (auto-filled, not editable)
- `email` - from authenticated user (auto-filled, not editable)
- `special_requests` - optional textarea on the summary step (e.g., "Late check-in", "extra pillows")

**Skipped for MVP:** Phone number, guest names per room, arrival time, address, children ages. All noted as future enhancements.

**Decision rationale:** Minimal fields keep the form focused on what the task actually requires. Special requests textarea is one field that shows UX awareness and adds to the channel manager payload. Every real booking site has it.

---

## 25. Post-Booking State Management

**Decision:** Clear wizard state on successful submission, redirect to confirmation page

**Status:** DECIDED

**Explanation:** After a booking is confirmed, the wizard state in localStorage is no longer needed.

**Flow:**
1. Booking submitted -> status changes to "confirmed"
2. Zustand store is cleared (localStorage wiped)
3. User is redirected to a dedicated confirmation page showing booking details + confirmation ID
4. If user navigates back to the booking form, they start fresh

**Decision rationale:** Keeping stale booking data in localStorage would cause confusion if the user starts a new booking. Clean break after confirmation is the expected UX pattern.

---

## 26. Booking History Scope

**Decision:** Single booking status page only (MVP)

**Status:** DECIDED

**Explanation:** The task says "Display the booking status" (singular). A full "My Bookings" list is out of scope.

**What we build:**
- A status page for the booking just submitted (`/bookings/{id}/status`)
- Shows: booking details, room selections, pricing, confirmation ID, current status
- Polls for status updates while pending

**What we skip:** "My Bookings" list page, booking modification, booking cancellation. Noted as future enhancements in README.

**Decision rationale:** The task requires displaying booking status, not booking management. MVP scoping within 3-5 hours means focusing on the core flow.

---

## 27. UI Design Approach

**Decision:** shadcn/ui components with LekkeSlaap brand colors, property images, and layout informed by their site

**Status:** DECIDED

**Explanation:** The task says design isn't being tested, but we can still show brand awareness within the constraints of shadcn's pre-built components.

**Approach:**
- Tailwind config: LekkeSlaap brand colors (orange #EC772D, dark gray #5A5B5D, white)
- Property images from property.json displayed in room selection cards
- Layout and component usage informed by LekkeSlaap's site patterns (sticky booking summary, card-based room listings, clear CTAs)
- All built with shadcn components - let the LekkeSlaap site inform how to use them, not replace them
- No custom CSS or pixel-perfect matching - work within shadcn's design system

**Decision rationale:** This approach shows brand awareness and attention to the company's product without spending significant time on custom design. shadcn does the heavy lifting, LekkeSlaap's patterns guide the composition.

---

## 28. ZAR Currency Formatting

**Decision:** Match LekkeSlaap's format using Intl.NumberFormat

**Status:** DECIDED

**Explanation:** South African Rand has multiple formatting conventions. LekkeSlaap's website uses space-separated thousands with `R` prefix.

**Format rules:**
- Whole numbers: `R 1 200` (no decimals)
- With cents: `R 1 200.00`
- Implementation: `Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })` which outputs `R 1 200,00`
- Match LekkeSlaap's own site convention

**Decision rationale:** Matching LekkeSlaap's format shows brand awareness and follows South African convention. Using `Intl.NumberFormat` is the correct approach - no manual string formatting, handles edge cases, and is locale-aware.

---

## Decisions Summary

| # | Decision | Status | Choice |
|---|----------|--------|--------|
| 1 | Frontend framework | DECIDED | React + TypeScript |
| 2 | Architecture | DECIDED | Breeze + Inertia hybrid (API routes for async) |
| 3 | Authentication | DECIDED | Laravel Breeze |
| 4 | Database | DECIDED | SQLite |
| 5 | Component library | DECIDED | shadcn/ui + Tailwind |
| 6 | UI design | DECIDED | See #27 - shadcn + brand colors + LekkeSlaap-informed layout |
| 7 | Form handling | DECIDED | React Hook Form + Zod |
| 8 | State management | DECIDED | Zustand + persist |
| 9 | State persistence | DECIDED | localStorage via Zustand |
| 10 | Background jobs | DECIDED | Queue + polling (confirmed) |
| 11 | Caching | DECIDED | Laravel file cache + headers |
| 12 | Price calculation | DECIDED | Server-authoritative |
| 13 | Testing | DECIDED | Pest (backend) + Vitest (frontend) |
| 14 | Error handling | DECIDED | Structured responses, no Sentry |
| 15 | Loading states | DECIDED | Spinners |
| 16 | AI showcase | DECIDED | Minimum - CLAUDE.md, transcripts, Co-Authored-By, README section |
| 17 | Accessibility | DECIDED | WCAG 2.1 AA |
| 18 | Project structure | DECIDED | Standard Breeze + Inertia |
| 19 | Multi-room bookings | DECIDED | Yes, multiple room types per booking |
| 20 | Guest allocation | DECIDED | Per-room-type guest count |
| 21 | Pricing & VAT | DECIDED | Ex-VAT stored, display VAT-inclusive, tooltip breakdown |
| 22 | Channel manager schema | DECIDED | Custom schema, customer naming, special_requests field |
| 23 | Date constraints | DECIDED | Min 1 night, no max, same-day OK, block past |
| 24 | Submission fields | DECIDED | Auth data + special requests textarea |
| 25 | Post-booking state | DECIDED | Clear state, redirect to confirmation page |
| 26 | Booking history | DECIDED | Single status page only (MVP) |
| 27 | UI design | DECIDED | shadcn + brand colors + property images + LekkeSlaap-informed layout |
| 28 | ZAR formatting | DECIDED | R 1 200 format, Intl.NumberFormat('en-ZA') |

---

## Future Enhancements (Document for README)

Things to mention as "what I'd add with more time":
- Redis caching in production (replace file driver)
- Sentry error monitoring
- WebSocket-based real-time booking status (Laravel Echo)
- Rate limiting on booking endpoints
- E2E test suite with Playwright
- i18n (Afrikaans/English) - relevant to LekkeSlaap's bilingual platform
- Payment integration
- Booking cancellation flow
- Email notifications (booking confirmation, status updates)
- Mobile-responsive optimization
- Performance monitoring (Web Vitals)
- Loading skeletons for content-heavy pages
- Server-side session backup for cross-device state persistence
