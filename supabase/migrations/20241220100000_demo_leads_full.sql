-- supabase/migrations/20241220100000_demo_leads_full.sql

-- Drop and recreate demo_leads with all needed columns
DROP TABLE IF EXISTS demo_leads CASCADE;

CREATE TABLE demo_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Lead info
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'new',
  -- Statuses: new, setup_started, setup_complete, parsing, creating_trial, 
  --           trial_ready, trial_started, trial_complete, results_sent, error
  error_message TEXT,
  
  -- Setup conversation
  setup_agent_id TEXT,
  setup_conversation_id TEXT,
  setup_transcript TEXT,
  
  -- Parsed interview spec
  interview_spec JSONB,
  
  -- Trial interview
  trial_agent_id TEXT,
  trial_conversation_id TEXT,
  trial_transcript TEXT,
  trial_results JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  setup_completed_at TIMESTAMPTZ,
  trial_completed_at TIMESTAMPTZ,
  results_sent_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_demo_leads_email ON demo_leads(email);
CREATE INDEX idx_demo_leads_status ON demo_leads(status);
CREATE INDEX idx_demo_leads_setup_conv ON demo_leads(setup_conversation_id);
CREATE INDEX idx_demo_leads_trial_conv ON demo_leads(trial_conversation_id);