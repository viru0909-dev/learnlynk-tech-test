-- ============================================================================
-- LearnLynk Technical Assessment - Database Schema
-- ============================================================================

-- Task 1: Database Schema
-- Creates tables: leads, applications, tasks
-- Includes standard fields, foreign keys, constraints, and indexes

-- ============================================================================
-- LEADS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Additional fields for a typical lead
    owner_id UUID NOT NULL,
    stage VARCHAR(50) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    source VARCHAR(100),
    notes TEXT
);

-- Indexes for typical queries on leads
CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_owner ON leads(tenant_id, owner_id);

-- ============================================================================
-- APPLICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Foreign key to leads
    lead_id UUID NOT NULL,
    
    -- Additional fields for an application
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    program VARCHAR(255),
    submitted_at TIMESTAMPTZ,
    reviewed_by UUID,
    notes TEXT,
    
    -- Constraint: FK to leads
    CONSTRAINT fk_applications_lead
        FOREIGN KEY (lead_id) 
        REFERENCES leads(id) 
        ON DELETE CASCADE
);

-- Indexes for typical queries on applications
CREATE INDEX IF NOT EXISTS idx_applications_tenant_id ON applications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_applications_lead_id ON applications(lead_id);
CREATE INDEX IF NOT EXISTS idx_applications_tenant_lead ON applications(tenant_id, lead_id);

-- ============================================================================
-- TASKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Foreign key to applications
    application_id UUID NOT NULL,
    
    -- Task-specific fields
    type VARCHAR(20) NOT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    assigned_to UUID,
    description TEXT,
    completed_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT fk_tasks_application
        FOREIGN KEY (application_id) 
        REFERENCES applications(id) 
        ON DELETE CASCADE,
    
    -- Constraint: type must be one of: call, email, review
    CONSTRAINT chk_tasks_type 
        CHECK (type IN ('call', 'email', 'review')),
    
    -- Constraint: due_at must be >= created_at
    CONSTRAINT chk_tasks_due_at 
        CHECK (due_at >= created_at)
);

-- Indexes for typical queries on tasks
CREATE INDEX IF NOT EXISTS idx_tasks_tenant_id ON tasks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at ON tasks(due_at);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_tenant_due ON tasks(tenant_id, due_at);
CREATE INDEX IF NOT EXISTS idx_tasks_tenant_status ON tasks(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_application_id ON tasks(application_id);

-- ============================================================================
-- TRIGGERS FOR updated_at
-- ============================================================================
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to auto-update updated_at on each table
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at 
    BEFORE UPDATE ON applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
