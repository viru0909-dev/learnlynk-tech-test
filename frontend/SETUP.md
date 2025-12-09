# Frontend Setup Guide

## Prerequisites
- Node.js 18+ installed
- A Supabase project (free tier works)

## Step 1: Install Dependencies

```bash
cd frontend
npm install
```

## Step 2: Configure Supabase

1. Create a `.env.local` file in the frontend directory:
```bash
cp .env.local.example .env.local
```

2. Fill in your Supabase credentials in `.env.local`:
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the Project URL and anon/public key
   - Paste them into `.env.local`

## Step 3: Set Up Supabase Database

1. Go to your Supabase project SQL Editor
2. Run the scripts in order:
   - First: `backend/schema.sql`
   - Second: `backend/rls_policies.sql`

## Step 4: Deploy Edge Function (Optional)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the Edge Function
supabase functions deploy create-task
```

## Step 5: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing the Dashboard

1. First, you need to create some test data in Supabase:

```sql
-- Insert a test lead
INSERT INTO leads (tenant_id, owner_id, stage, first_name, last_name, email)
VALUES (gen_random_uuid(), gen_random_uuid(), 'new', 'John', 'Doe', 'john@example.com');

-- Insert a test application (use the lead_id from above)
INSERT INTO applications (tenant_id, lead_id, status, program)
VALUES (gen_random_uuid(), 'your-lead-id-here', 'pending', 'Computer Science');

-- Insert a task due today (use the application_id from above)
INSERT INTO tasks (tenant_id, application_id, type, due_at, status)
VALUES (
  gen_random_uuid(), 
  'your-application-id-here', 
  'call', 
  NOW() + INTERVAL '2 hours',
  'pending'
);
```

2. Navigate to `/dashboard/today` to see your tasks

## Build for Production

```bash
npm run build
npm start
```

## Troubleshooting

**Issue: "Cannot find module '@supabase/supabase-js'"**
- Solution: Run `npm install` again

**Issue: "Invalid API key"**
- Solution: Check your `.env.local` file and ensure the Supabase credentials are correct

**Issue: "No tasks showing"**
- Solution: Make sure you've run the SQL scripts and inserted test data with `due_at` set to today

**Issue: "RLS policy error"**
- Solution: For testing, you can temporarily disable RLS with: `ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;`
