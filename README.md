# LearnLynk Technical Assessment

This repository contains my submission for the LearnLynk internship technical assessment. The project implements a task management system using Supabase, Next.js, and TypeScript.

## 📋 Assessment Tasks

### Task 1: Database Schema ✅
Created PostgreSQL schema for leads, applications, and tasks tables with proper relationships and constraints.

**File:** `backend/schema.sql`

Key features:
- Standard fields (id, tenant_id, created_at, updated_at) on all tables
- Foreign key constraints with CASCADE delete
- Check constraints for task types and due dates
- Indexes for common query patterns
- Auto-update triggers for timestamp fields

### Task 2: Row-Level Security ✅
Implemented RLS policies for multi-tenant access control.

**File:** `backend/rls_policies.sql`

Access rules:
- Counselors can view leads they own or are assigned to their team
- Admins have full tenant-wide access
- Proper INSERT, UPDATE, DELETE policies included

### Task 3: Edge Function ✅
Built a Supabase Edge Function for creating tasks with validation.

**File:** `backend/edge-functions/create-task/index.ts`

Features:
- POST endpoint accepting task data
- Input validation (task type, future timestamps, UUID format)
- Realtime broadcast event on task creation
- Error handling with appropriate HTTP status codes

### Task 4: Frontend Dashboard ✅
Created a Next.js page displaying today's tasks with React Query integration.

**File:** `frontend/pages/dashboard/today.tsx`

Features:
- Fetches tasks due today from Supabase
- Table display with task details
- Mark Complete functionality
- React Query for state management and mutations
- Loading and error states

### Task 5: Stripe Integration (Written Answer) ✅
Explained how to implement Stripe Checkout for application fees.

**Answer below**

---

## 🚀 Live Demo

**Frontend:** https://learnlynk-tech-test-kappa.vercel.app  
**GitHub:** https://github.com/viru0909-dev/learnlynk-tech-test

---

## 💻 Tech Stack

- **Backend:** Supabase (PostgreSQL + Edge Functions)
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **State Management:** React Query (TanStack Query)
- **Deployment:** Vercel

---

## 📖 Stripe Checkout Integration (Task 5 Answer)

To implement Stripe Checkout for application fees, I would follow these steps:

1. **Create Payment Request Record**
   - When a user initiates payment, create a record in `payment_requests` table
   - Store amount, application_id, status ('pending'), and generate unique idempotency key

2. **Create Stripe Checkout Session**
   - Call `stripe.checkout.sessions.create()` with:
     - Line items (application fee amount)
     - Customer email from lead
     - Success/cancel URLs
     - Metadata containing application_id
   - Store the Stripe session ID in payment_requests table

3. **Redirect to Stripe**
   - Redirect user to the Checkout URL returned by Stripe
   - User completes payment on Stripe's hosted page

4. **Handle Webhook**
   - Set up webhook endpoint to receive `checkout.session.completed` events
   - Verify webhook signature for security
   - Extract application_id from session metadata

5. **Update Records**
   - Update payment_requests status to 'completed'
   - Update applications table to advance status/timeline
   - Store transaction details (stripe_payment_intent_id, amount_paid)

6. **Handle Idempotency**
   - Use Stripe's idempotency keys to prevent duplicate charges
   - Check payment_requests status before creating new session
   - Handle edge cases (failed payments, abandoned checkouts)

This ensures secure payment processing, proper reconciliation, and maintains data consistency across the application.

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- Supabase account
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/viru0909-dev/learnlynk-tech-test.git
   cd learnlynk-tech-test
   ```

2. **Set up Supabase Database**
   - Go to your Supabase project dashboard
   - Open SQL Editor
   - Run `backend/schema.sql`
   - Run `backend/rls_policies.sql`

3. **Configure Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local
   ```
   
   Add your Supabase credentials to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   Visit `http://localhost:3000`

5. **Add Test Data**
   See `QUICKSTART.md` for SQL commands to insert sample tasks

---

## 📁 Project Structure

```
learnlynk-tech-test/
├── backend/
│   ├── schema.sql                    # Database schema
│   ├── rls_policies.sql             # Security policies
│   └── edge-functions/
│       └── create-task/
│           └── index.ts             # Task creation endpoint
├── frontend/
│   ├── components/
│   │   └── ErrorBoundary.tsx        # Error handling
│   ├── lib/
│   │   └── supabase.ts              # Supabase client
│   ├── pages/
│   │   ├── _app.tsx                 # App wrapper
│   │   ├── index.tsx                # Homepage
│   │   └── dashboard/
│   │       └── today.tsx            # Dashboard page
│   └── styles/
│       └── globals.css              # Global styles
├── README.md                         # This file
└── QUICKSTART.md                     # Quick setup guide
```

---

## ✨ Features Implemented

### Core Requirements
- ✅ Complete database schema with relationships
- ✅ RLS policies for multi-tenant security
- ✅ Edge Function with validation and Realtime
- ✅ Frontend dashboard with React Query
- ✅ Stripe integration explanation

### Additional Features
- ✅ Error boundaries for production stability
- ✅ SEO meta tags on all pages
- ✅ Security headers configuration
- ✅ TypeScript strict mode
- ✅ Responsive design
- ✅ Loading and error states

---

## 🎯 Assessment Notes

- All requirements met as specified
- Used React Query as mentioned in assessment criteria
- Added Realtime broadcast event in Edge Function
- Implemented proper error handling throughout
- Code is production-ready and deployed to Vercel

---

## 👤 Candidate Information

**Name:** Virendra Gadekar  
**GitHub:** https://github.com/viru0909-dev  
**Email:** virendragadekar@example.com

---

## 📄 License

This project was created for the LearnLynk technical assessment.
