# Open Questions - Awaiting Byron's Input

These are unresolved decisions and ambiguities from the README and task requirements. Each needs a decision before (or during) implementation. Where I have a recommendation, I've noted it.

---

## Architecture

### ~~Q1. Are you comfortable using Inertia.js?~~ RESOLVED

**Answer:** Yes. Using Breeze + Inertia (React) with API routes alongside for booking submission and status polling. See key-decisions.md #2.

---

## Booking Logic

### ~~Q2. Can a user book multiple room types in one booking?~~ RESOLVED

**Answer:** Yes, multi-room bookings (Option A). See key-decisions.md #19.

---

### ~~Q3. How should guest allocation work?~~ RESOLVED

**Answer:** Per-room-type guest count (Option A). See key-decisions.md #20.

---

### ~~Q4. Pricing model confirmation~~ RESOLVED

**Answer:** Pricing model confirmed as correct. Prices ex-VAT, displayed VAT-inclusive with tooltip. See key-decisions.md #21.

---

### ~~Q5. What data does ChannelManagerService::book() expect?~~ RESOLVED

**Answer:** Custom schema with `customer` naming (not `guest`/`booker`), includes `special_requests` field, no phone number. See key-decisions.md #22.

---

## Date Handling

### ~~Q6. Date constraints~~ RESOLVED

**Answer:** Min 1 night, no max cap, allow same-day check-in, block past dates (starting from today). See key-decisions.md #23.

---

## User Data

### ~~Q7. What fields do we collect at submission?~~ RESOLVED

**Answer:** Auth user data (name, email) + optional special requests textarea on summary step. No phone number. See key-decisions.md #24.

---

## Currency & Formatting

### ~~Q8. ZAR formatting convention~~ RESOLVED

**Answer:** Match LekkeSlaap's format: `R 1 200` for whole numbers, `R 1 200.00` when showing cents. Use `Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })`. See key-decisions.md #25.

---

## UX Edge Cases

### ~~Q9. What happens to persisted state after a successful booking?~~ RESOLVED

**Answer:** Option C. Clear state on successful submission, redirect to confirmation page. See key-decisions.md #25.

---

### ~~Q10. Booking history - show a "My Bookings" list?~~ RESOLVED

**Answer:** Option A. Just the status page for the booking just made (MVP). See key-decisions.md #26.

---

### ~~Q11. UI design approach~~ RESOLVED

**Answer:** shadcn components with LekkeSlaap brand colors, property images from JSON, and layout informed by their site patterns - but all within shadcn's design system, no custom CSS. See key-decisions.md #27.

---

### ~~Q12. Polling for booking status - confirmed?~~ RESOLVED

**Answer:** Yes, polling confirmed. Frontend polls `GET /api/bookings/{id}/status` every 2-3s. The ChannelManagerService returns data to the queued job (not the browser), which writes to DB, which the frontend reads via polling. See key-decisions.md #10.

---

### ~~Q13. AI showcase - which level?~~ RESOLVED

**Answer:** Minimum. CLAUDE.md (done), session transcripts via /export, Co-Authored-By on commits (automatic), README section on AI workflow, key-decisions.md (done). See key-decisions.md #16.

---

## Summary of Questions

| # | Question | Status | Answer |
|---|----------|--------|--------|
| Q1 | Inertia.js - yes or no? | RESOLVED | Yes, Breeze + Inertia hybrid |
| Q2 | Multi-room bookings? | RESOLVED | Yes (Option A) |
| Q3 | Guest allocation model? | RESOLVED | Per-room-type (Option A) |
| Q4 | Pricing model correct? | RESOLVED | Confirmed correct |
| Q5 | ChannelManager data schema OK? | RESOLVED | Custom schema, customer naming, special_requests |
| Q6 | Date constraints OK? | RESOLVED | Min 1 night, no max, same-day OK, block past |
| Q7 | Collect extra fields or just auth data? | RESOLVED | Auth data + special requests textarea |
| Q8 | ZAR format? | RESOLVED | R 1 200 format, Intl.NumberFormat('en-ZA') |
| Q9 | Clear state after booking? | RESOLVED | C - clear + confirmation page |
| Q10 | Booking history page? | RESOLVED | Just status page (MVP) |
| Q11 | UI design approach? | RESOLVED | shadcn + brand colors + property images + LekkeSlaap-informed |
| Q12 | Polling confirmed? | RESOLVED | Yes, poll every 2-3s |
| Q13 | AI showcase level? | RESOLVED | Minimum |
