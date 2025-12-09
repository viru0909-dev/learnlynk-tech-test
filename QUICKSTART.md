# ==============================================================================
# QUICK START GUIDE - LearnLynk Technical Assessment
# ==============================================================================

## ✅ Status: Frontend Running on http://localhost:3000

The Next.js development server is successfully running!

## 🔧 Next Steps to Complete Setup:

### 1. Configure Supabase (Required)

To use the dashboard page, you need to connect to a Supabase project:

```bash
# 1. Copy the environment template
cd frontend
cp .env.local.example .env.local

# 2. Edit .env.local with your Supabase credentials
# Add your values from: https://app.supabase.com/project/_/settings/api
```

**Required variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Set Up Database (Required for Dashboard to Work)

Run these SQL scripts in your Supabase SQL Editor:

**A. Create Tables:**
```bash
# Copy and run: backend/schema.sql
# This creates: leads, applications, tasks tables
```

**B. Setup Security:**
```bash
# Copy and run: backend/rls_policies.sql
# This enables RLS policies
```

**C. Create Test Data:**
```sql
-- For testing the dashboard, insert a task due today:
INSERT INTO leads (tenant_id, owner_id, stage, first_name) 
VALUES (gen_random_uuid(), gen_random_uuid(), 'new', 'Test');

INSERT INTO applications (tenant_id, lead_id, status) 
VALUES ((SELECT tenant_id FROM leads LIMIT 1), 
        (SELECT id FROM leads LIMIT 1), 
        'pending');

INSERT INTO tasks (tenant_id, application_id, type, due_at, status)
VALUES ((SELECT tenant_id FROM applications LIMIT 1),
        (SELECT id FROM applications LIMIT 1),
        'call',
        NOW() + INTERVAL '2 hours',
        'pending');
```

### 3. Restart Server (After Env Setup)

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 4. View the Application

- **Homepage:** http://localhost:3000
- **Dashboard:** http://localhost:3000/dashboard/today

## 📁 Project Structure

```
learnlynk-tech-test/
├── backend/
│   ├── schema.sql                    ✅ Complete
│   ├── rls_policies.sql              ✅ Complete
│   └── edge-functions/
│       └── create-task/index.ts       ✅ Complete
├── frontend/
│   ├── pages/
│   │   ├── index.tsx                  ✅ Homepage
│   │   └── dashboard/today.tsx        ✅ Dashboard
│   ├── .env.local.example             🔧 Configure this
│   └── package.json                   ✅ Installed
└── README.md                          ✅ Complete

```

## 🚀 What's Working

✅ Next.js server running on port 3000  
✅ Homepage displays with navigation  
✅ Dashboard page ready (needs Supabase config)  
✅ All assessment files created  
✅ Dependencies installed (117 packages)  

## ⚠️ What Needs Configuration

🔧 Supabase environment variables (.env.local)  
🔧 Run SQL scripts in Supabase  
🔧 Create test data for dashboard  

## 📚 Documentation

- Full setup guide: `frontend/SETUP.md`
- Assessment details: `README.md`
- Implementation walkthrough: Check artifacts directory

## 🐛 Troubleshooting

**Error: "supabaseUrl is required"**
→ You need to configure `.env.local` with Supabase credentials

**No tasks showing on dashboard**
→ Insert test data using the SQL above

**Build errors**
→ Run `npm install` again

---

**Ready to proceed?** Follow Steps 1-3 above to complete the Supabase setup!
