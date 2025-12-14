-- Interview Sessions Schema
-- Run this migration to add interview_sessions table to Supabase

-- Create enum types
CREATE TYPE interview_type AS ENUM (
  'investor_validation',
  'customer_discovery',
  'founder_feedback',
  'user_research',
  'exit_interview',
  'custom'
);

CREATE TYPE interview_status AS ENUM (
  'not_started',
  'consent_pending',
  'profile_capture',
  'in_progress',
  'paused',
  'completed',
  'abandoned'
);

CREATE TYPE consent_status AS ENUM (
  'not_asked',
  'granted',
  'declined',
  'partial'
);

-- Create interview_sessions table
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Interview configuration
  interview_type interview_type NOT NULL,
  config_id TEXT NOT NULL,
  config_version TEXT NOT NULL,
  
  -- Status
  status interview_status NOT NULL DEFAULT 'not_started',
  
  -- Consent
  consent_status consent_status NOT NULL DEFAULT 'not_asked',
  consent_records JSONB DEFAULT '[]'::jsonb,
  
  -- Interviewee data
  interviewee_profile JSONB DEFAULT '{}'::jsonb,
  
  -- Conversation data
  messages JSONB DEFAULT '[]'::jsonb,
  concept_reactions JSONB DEFAULT '[]'::jsonb,
  
  -- Analysis & feedback
  feedback JSONB,
  
  -- Timing
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Related entities
  project_id UUID,
  company_id UUID
);

-- Create indexes
CREATE INDEX idx_interview_sessions_user_id ON interview_sessions(user_id);
CREATE INDEX idx_interview_sessions_config_id ON interview_sessions(config_id);
CREATE INDEX idx_interview_sessions_status ON interview_sessions(status);
CREATE INDEX idx_interview_sessions_interview_type ON interview_sessions(interview_type);
CREATE INDEX idx_interview_sessions_created_at ON interview_sessions(created_at DESC);

-- Enable RLS
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

-- Policies

-- Users can read their own sessions
CREATE POLICY "Users can view own interview sessions"
  ON interview_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own sessions
CREATE POLICY "Users can create own interview sessions"
  ON interview_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own interview sessions"
  ON interview_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own interview sessions"
  ON interview_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can read all sessions (for research analysis)
-- Uncomment and modify based on your admin role setup
-- CREATE POLICY "Admins can view all interview sessions"
--   ON interview_sessions
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_roles.user_id = auth.uid()
--       AND user_roles.role = 'admin'
--     )
--   );

-- Function to update duration on completion
CREATE OR REPLACE FUNCTION update_interview_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate duration
CREATE TRIGGER interview_duration_trigger
  BEFORE UPDATE ON interview_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_interview_duration();

-- Comments
COMMENT ON TABLE interview_sessions IS 'Stores AI-conducted interview sessions';
COMMENT ON COLUMN interview_sessions.config_id IS 'ID of the interview template configuration used';
COMMENT ON COLUMN interview_sessions.messages IS 'Array of conversation messages between interviewer and interviewee';
COMMENT ON COLUMN interview_sessions.concept_reactions IS 'Array of reactions to concepts/features presented during interview';
COMMENT ON COLUMN interview_sessions.feedback IS 'Generated analysis and feedback after interview completion';
