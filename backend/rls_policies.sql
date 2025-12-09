-- ============================================================================
-- LearnLynk Technical Assessment - Row-Level Security Policies
-- ============================================================================

-- Task 2: Row-Level Security
-- Implements RLS policies for the leads table with the following rules:
-- - Counselors can see leads they own OR leads assigned to any team they belong to
-- - Admins can see all leads belonging to their tenant

-- Assumes the existence of:
-- - users(id, tenant_id, role)
-- - teams(id, tenant_id)
-- - user_teams(user_id, team_id)
-- - leads.team_id (optional field for team assignment)

-- JWT contains: user_id, role, tenant_id

-- ============================================================================
-- ENABLE RLS ON LEADS TABLE
-- ============================================================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT POLICY
-- ============================================================================
-- Policy name: leads_select_policy
-- Rules:
-- 1. Admins: Can see all leads in their tenant
-- 2. Counselors: Can see leads they own (owner_id matches user_id)
-- 3. Counselors: Can see leads assigned to any team they belong to

CREATE POLICY leads_select_policy ON leads
    FOR SELECT
    USING (
        -- Check if user's tenant matches the lead's tenant
        tenant_id = auth.jwt() ->> 'tenant_id'::text::uuid
        AND (
            -- Admin can see all leads in their tenant
            (auth.jwt() ->> 'role') = 'admin'
            
            OR
            
            -- Counselor can see leads they own
            (
                (auth.jwt() ->> 'role') = 'counselor' 
                AND owner_id = (auth.jwt() ->> 'user_id')::uuid
            )
            
            OR
            
            -- Counselor can see leads assigned to teams they belong to
            -- Note: This assumes leads table has a team_id field.
            -- If leads are assigned to teams via lead_id in a junction table,
            -- this query would need to be adjusted accordingly.
            (
                (auth.jwt() ->> 'role') = 'counselor'
                AND EXISTS (
                    SELECT 1 
                    FROM user_teams ut
                    WHERE ut.user_id = (auth.jwt() ->> 'user_id')::uuid
                    AND ut.team_id = leads.team_id
                )
            )
        )
    );

-- ============================================================================
-- INSERT POLICY
-- ============================================================================
-- Policy name: leads_insert_policy
-- Rules:
-- 1. Counselors and Admins can insert leads under their tenant
-- 2. The tenant_id of the new lead must match the user's tenant_id from JWT

CREATE POLICY leads_insert_policy ON leads
    FOR INSERT
    WITH CHECK (
        -- User must be either counselor or admin
        (auth.jwt() ->> 'role') IN ('counselor', 'admin')
        
        -- The lead's tenant_id must match the user's tenant_id
        AND tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    );

-- ============================================================================
-- UPDATE POLICY (Optional, but recommended)
-- ============================================================================
-- Policy name: leads_update_policy
-- Rules: Same as SELECT - users can only update leads they can see

CREATE POLICY leads_update_policy ON leads
    FOR UPDATE
    USING (
        tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
        AND (
            (auth.jwt() ->> 'role') = 'admin'
            OR
            (
                (auth.jwt() ->> 'role') = 'counselor' 
                AND owner_id = (auth.jwt() ->> 'user_id')::uuid
            )
            OR
            (
                (auth.jwt() ->> 'role') = 'counselor'
                AND EXISTS (
                    SELECT 1 
                    FROM user_teams ut
                    WHERE ut.user_id = (auth.jwt() ->> 'user_id')::uuid
                    AND ut.team_id = leads.team_id
                )
            )
        )
    );

-- ============================================================================
-- DELETE POLICY (Optional, but recommended)
-- ============================================================================
-- Policy name: leads_delete_policy
-- Rules: Only admins can delete leads in their tenant

CREATE POLICY leads_delete_policy ON leads
    FOR DELETE
    USING (
        tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
        AND (auth.jwt() ->> 'role') = 'admin'
    );

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. The above policies assume that leads have a 'team_id' field for team assignment.
--    If team assignment is handled differently (e.g., via a junction table like 
--    lead_teams), the SELECT policy would need to be modified accordingly.
--
-- 2. If you need to add the team_id field to the leads table, uncomment:
--    ALTER TABLE leads ADD COLUMN team_id UUID REFERENCES teams(id);
--
-- 3. The policies use auth.jwt() to access JWT claims. In Supabase, you might
--    need to use auth.uid() for user_id and custom JWT claims setup for role
--    and tenant_id.
--
-- 4. For production use, consider adding policies for UPDATE and DELETE operations
--    as shown above.
