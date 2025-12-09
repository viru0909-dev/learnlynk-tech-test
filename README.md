# LearnLynk – Technical Assessment

Thanks for taking the time to complete this assessment. The goal is to understand how you think about problems and how you structure real project work. This is a small, self-contained exercise that should take around 2–3 hours. It's completely fine if you don't finish everything—just note any assumptions or TODOs.

## Stack

We use:
- **Supabase Postgres**
- **Supabase Edge Functions (TypeScript)**
- **Next.js + TypeScript**

You may use your own free Supabase project.

---

## Overview

There are four technical tasks:

1. **Database schema** — `backend/schema.sql`
2. **RLS policies** — `backend/rls_policies.sql`
3. **Edge Function** — `backend/edge-functions/create-task/index.ts`
4. **Next.js page** — `frontend/pages/dashboard/today.tsx`

There is also a short written question about Stripe in this README.

Feel free to use Supabase/PostgreSQL docs, or any resource you normally use.

---

## Task 1 — Database Schema

**File:** `backend/schema.sql`

Create the following tables:
- `leads`
- `applications`
- `tasks`

Each table should include standard fields:
- `id uuid primary key default gen_random_uuid()`
- `tenant_id uuid not null`
- `created_at timestamptz default now()`
- `updated_at timestamptz default now()`

**Additional requirements:**
- `applications.lead_id` → FK to `leads.id`
- `tasks.application_id` → FK to `applications.id`
- `tasks.type` should only allow: `call`, `email`, `review`
- `tasks.due_at >= tasks.created_at`

**Add reasonable indexes for typical queries:**
- **Leads:** `tenant_id`, `owner_id`, `stage`
- **Applications:** `tenant_id`, `lead_id`
- **Tasks:** `tenant_id`, `due_at`, `status`

---

## Task 2 — Row-Level Security

**File:** `backend/rls_policies.sql`

We want:
- **Counselors** can see:
  - Leads they own, or
  - Leads assigned to any team they belong to
- **Admins** can see all leads belonging to their tenant

**Assume the existence of:**
- `users(id, tenant_id, role)`
- `teams(id, tenant_id)`
- `user_teams(user_id, team_id)`

**JWT contains:**
- `user_id`
- `role`
- `tenant_id`

**Tasks:**
1. Enable RLS on `leads`
2. Write a SELECT policy enforcing the rules above
3. Write an INSERT policy that allows counselors/admins to add leads under their tenant

---

## Task 3 — Edge Function: create-task

**File:** `backend/edge-functions/create-task/index.ts`

Write a simple POST endpoint that:

**Input:**
```json
{
  "application_id": "uuid",
  "task_type": "call",
  "due_at": "2025-01-01T12:00:00Z"
}
```

**Requirements:**
- Validate:
  - `task_type` is `call`, `email`, or `review`
  - `due_at` is a valid future timestamp
- Insert a row into `tasks` using the service role key
- **Return:**
  - `{ "success": true, "task_id": "..." }`
  - On validation error → return 400
  - On internal errors → return 500

---

## Task 4 — Frontend Page: /dashboard/today

**File:** `frontend/pages/dashboard/today.tsx`

Build a small page that:
1. Fetches tasks due today (`status ≠ completed`)
2. Uses the provided Supabase client
3. Displays:
   - `type`
   - `application_id`
   - `due_at`
   - `status`
4. Adds a "Mark Complete" button that updates the task in Supabase

---

## Task 5 — Stripe Checkout (Written Answer)

### Stripe Answer

**Implementing a Stripe Checkout flow for application fees:**

The implementation would follow this flow to ensure secure payment processing and proper state management:

1. **Payment Request Creation**: When a counselor or admin initiates payment for an application, we insert a `payment_requests` row with `application_id`, `amount`, `currency`, and `status: 'pending'`. This establishes an audit trail before any external API calls.

2. **Stripe Checkout Session**: We call `stripe.checkout.sessions.create()` with the payment amount, success/cancel URLs, and include `metadata: { application_id, payment_request_id }` to link the Stripe session back to our records. The `client_reference_id` is set to our `payment_request_id` for easy reconciliation.

3. **Session Storage**: We store the Stripe `session_id`, `session_url`, and `created_at` timestamp in the `payment_requests` table. The user is then redirected to the Stripe-hosted checkout page via the `session_url`.

4. **Webhook Handling**: We implement a webhook endpoint (`/api/webhooks/stripe`) that verifies the Stripe signature and listens for `checkout.session.completed` events. Upon receiving this event, we extract the `client_reference_id` to identify the payment request and retrieve the full PaymentIntent details including `amount_received` and `payment_method`.

5. **Payment Success**: When the webhook confirms successful payment, we update the `payment_requests` row to `status: 'completed'`, store the Stripe `payment_intent_id`, and set `paid_at: now()`. Simultaneously, we update the related `applications` table by setting `payment_status: 'paid'` and `paid_at` to reflect that the application fee has been received. We also trigger any downstream processes like sending confirmation emails or advancing the application workflow.

6. **Idempotency**: The webhook handler checks if the payment has already been processed using the Stripe event ID to prevent duplicate processing. All database updates happen within a transaction to ensure consistency.

---

## Submission

1. Push your work to a public GitHub repo
2. Add your Stripe answer at the bottom of this file
3. Share the link

**Good luck!**

---

## Implementation Notes

### Assumptions Made

1. **Database Schema**:
   - Added `team_id` field to `leads` table for team-based access control
   - Included common fields like `owner_id`, `stage`, `email`, `phone` for leads
   - Added `status` field for applications and tasks
   - Implemented triggers for automatic `updated_at` timestamp updates

2. **RLS Policies**:
   - Assumes JWT claims are accessible via `auth.jwt()`
   - Team assignment is handled via a `team_id` field on leads
   - Included optional UPDATE and DELETE policies for completeness
   - Admins have full CRUD access to their tenant's leads

3. **Edge Function**:
   - Validates UUID format for `application_id`
   - Fetches `tenant_id` from the application to ensure data consistency
   - Returns detailed error messages for debugging
   - Implements CORS headers for browser compatibility

4. **Frontend Page**:
   - Uses Tailwind CSS for styling (common in Next.js projects)
   - Implements optimistic UI updates after marking tasks complete
   - Displays truncated UUIDs for better readability
   - Includes loading and error states
   - Shows time in user's local timezone

### Environment Setup Required

To run this project, you'll need to configure:

1. **Supabase Environment Variables**:
   ```env
   # For Edge Functions
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # For Frontend
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

2. **Database Setup**:
   - Run `backend/schema.sql` in your Supabase SQL editor
   - Run `backend/rls_policies.sql` to enable RLS
   - Create supporting tables (`users`, `teams`, `user_teams`) if testing RLS

3. **Edge Function Deployment**:
   ```bash
   supabase functions deploy create-task
   ```

4. **Frontend Development**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## Additional Enhancements (Not Implemented)

Given more time, I would add:

1. **Real-time subscriptions** for task updates using Supabase Realtime
2. **Filtering and sorting** on the dashboard page
3. **Task priority** field and visual indicators
4. **Notification system** for upcoming tasks
5. **Unit tests** for the Edge Function and frontend components
6. **E2E tests** using Playwright or Cypress
7. **Pagination** for large task lists
8. **Task assignment** workflow
9. **Audit logging** for compliance
10. **GraphQL API** layer for complex queries
