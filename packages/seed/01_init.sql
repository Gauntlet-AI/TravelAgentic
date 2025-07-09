-- TravelAgentic Modern Database Seed
-- Comprehensive initialization for AI-first travel planning platform
-- Supports: 5-layer fallback system, browser automation, voice calls, trip templates
-- Version: Production-ready schema with all 21 tables

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CORE USER MANAGEMENT (3 tables)
-- ============================================================================

-- Users table (integrates with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences with comprehensive JSONB structure
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Legacy preference fields (maintained for compatibility)
  budget_min INTEGER,
  budget_max INTEGER,
  preferred_destinations TEXT[],
  travel_style TEXT,
  automation_level INTEGER DEFAULT 5 CHECK (automation_level >= 0 AND automation_level <= 10),
  -- Modern JSONB preference structures
  travel_preferences JSONB DEFAULT '{}',
  system_preferences JSONB DEFAULT '{}',
  constraints JSONB DEFAULT '[]',
  fallback_preferences JSONB DEFAULT '{}',
  booking_preferences JSONB DEFAULT '{}',
  template_preferences JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',
  privacy_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions for flow management
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  flow_type TEXT NOT NULL CHECK (flow_type IN ('structured', 'conversational')),
  current_step TEXT NOT NULL,
  context_version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- BOOKING & TRAVEL MANAGEMENT (3 tables)
-- ============================================================================

-- Bookings with comprehensive provider support
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_type TEXT NOT NULL,
  external_booking_id TEXT,
  provider TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  booking_data JSONB NOT NULL,
  total_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Itineraries for trip organization
CREATE TABLE IF NOT EXISTS public.itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'draft',
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for itinerary-booking relationships
CREATE TABLE IF NOT EXISTS public.itinerary_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID NOT NULL REFERENCES itineraries(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SEARCH & CACHING (2 tables)
-- ============================================================================

-- Search cache for API response optimization
CREATE TABLE IF NOT EXISTS public.search_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  search_type TEXT NOT NULL,
  search_params_hash TEXT NOT NULL,
  search_params JSONB NOT NULL,
  results JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(search_type, search_params_hash)
);

-- Search history for user analytics
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  search_type TEXT NOT NULL,
  search_params JSONB NOT NULL,
  results_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SESSION MANAGEMENT (3 tables)
-- ============================================================================

-- Context snapshots for backtracking capability
CREATE TABLE IF NOT EXISTS public.context_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  context_data JSONB NOT NULL,
  preferences JSONB,
  constraints JSONB,
  confidence_scores JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shopping carts with dependency management
CREATE TABLE IF NOT EXISTS public.shopping_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  cart_version INTEGER DEFAULT 1,
  items JSONB DEFAULT '[]',
  dependencies JSONB DEFAULT '{}',
  total_price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  price_last_updated TIMESTAMP WITH TIME ZONE,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Browser automation sessions for fallback system
CREATE TABLE IF NOT EXISTS public.browser_automation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_site TEXT NOT NULL,
  automation_type TEXT NOT NULL CHECK (automation_type IN ('flight_search', 'hotel_booking', 'activity_booking', 'restaurant_reservation')),
  search_params JSONB NOT NULL,
  browser_type TEXT DEFAULT 'chromium',
  headless BOOLEAN DEFAULT true,
  user_agent TEXT,
  viewport_size TEXT,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'timeout', 'blocked')),
  results_found INTEGER DEFAULT 0,
  results_data JSONB,
  screenshots_taken INTEGER DEFAULT 0,
  page_load_time_ms INTEGER,
  total_execution_time_ms INTEGER,
  steps_completed INTEGER DEFAULT 0,
  steps_total INTEGER,
  error_encountered TEXT,
  rate_limit_hit BOOLEAN DEFAULT false,
  captcha_encountered BOOLEAN DEFAULT false,
  delay_between_actions_ms INTEGER DEFAULT 2000,
  requests_made INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- TRIP TEMPLATES (4 tables)
-- ============================================================================

-- Trip templates for reusable travel plans
CREATE TABLE IF NOT EXISTS public.trip_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  template_version TEXT DEFAULT '1.0',
  template_type TEXT NOT NULL CHECK (template_type IN ('completed', 'partial', 'abandoned')),
  flow_state JSONB DEFAULT '{}',
  current_step TEXT,
  completed_steps TEXT[] DEFAULT ARRAY[]::TEXT[],
  flow_progress DECIMAL(3,2) DEFAULT 0.0,
  base_context JSONB NOT NULL,
  preferences JSONB DEFAULT '{}',
  constraints JSONB DEFAULT '[]',
  selections JSONB DEFAULT '{}',
  shopping_cart JSONB DEFAULT '{}',
  constraint_history JSONB DEFAULT '[]',
  completion_status TEXT DEFAULT 'partial',
  trip_success_rating DECIMAL(3,2),
  estimated_completion_time TEXT,
  reuse_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  season TEXT,
  destination TEXT,
  privacy_level TEXT DEFAULT 'private' CHECK (privacy_level IN ('private', 'friends', 'public')),
  resumable BOOLEAN DEFAULT true,
  share_partial BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template sharing permissions
CREATE TABLE IF NOT EXISTS public.template_sharing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES trip_templates(id) ON DELETE CASCADE,
  shared_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  shared_with UUID REFERENCES users(id) ON DELETE CASCADE,
  permission_level TEXT DEFAULT 'view' CHECK (permission_level IN ('view', 'clone', 'edit')),
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template version control
CREATE TABLE IF NOT EXISTS public.template_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES trip_templates(id) ON DELETE CASCADE,
  version_number TEXT NOT NULL,
  changes_description TEXT,
  version_data JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template usage analytics
CREATE TABLE IF NOT EXISTS public.template_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES trip_templates(id) ON DELETE CASCADE,
  used_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  usage_type TEXT NOT NULL CHECK (usage_type IN ('import', 'clone', 'resume')),
  success_rating DECIMAL(3,2),
  completion_achieved BOOLEAN DEFAULT false,
  adaptations_made JSONB DEFAULT '{}',
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AUTOMATION & FALLBACKS (3 tables)
-- ============================================================================

-- API failure tracking for fallback system
CREATE TABLE IF NOT EXISTS public.api_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  api_provider TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  failure_type TEXT NOT NULL CHECK (failure_type IN ('timeout', 'rate_limit', 'authentication', 'server_error', 'network_error', 'invalid_response')),
  error_code TEXT,
  error_message TEXT,
  request_data JSONB,
  response_data JSONB,
  retry_attempt INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  fallback_triggered BOOLEAN DEFAULT false,
  fallback_method TEXT CHECK (fallback_method IN ('secondary_api', 'browser_automation', 'voice_call', 'manual_intervention')),
  resolution_status TEXT DEFAULT 'pending' CHECK (resolution_status IN ('pending', 'resolved', 'failed', 'escalated')),
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Automation decision logging
CREATE TABLE IF NOT EXISTS public.automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  automation_level INTEGER NOT NULL CHECK (automation_level >= 0 AND automation_level <= 10),
  decision_point TEXT NOT NULL,
  decision_made TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  user_intervention_required BOOLEAN DEFAULT false,
  intervention_reason TEXT,
  context_data JSONB,
  alternatives_considered JSONB,
  outcome TEXT CHECK (outcome IN ('success', 'failure', 'user_override', 'escalated')),
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5-layer fallback cascade tracking
CREATE TABLE IF NOT EXISTS public.fallback_cascades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  original_request_type TEXT NOT NULL,
  original_request_data JSONB NOT NULL,
  -- Layer 1: Primary API
  primary_api_attempted BOOLEAN DEFAULT true,
  primary_api_success BOOLEAN DEFAULT false,
  primary_api_failure_id UUID REFERENCES api_failures(id),
  -- Layer 2: Secondary API
  secondary_api_attempted BOOLEAN DEFAULT false,
  secondary_api_success BOOLEAN DEFAULT false,
  secondary_api_failure_id UUID REFERENCES api_failures(id),
  -- Layer 3: Browser Automation
  browser_automation_attempted BOOLEAN DEFAULT false,
  browser_automation_success BOOLEAN DEFAULT false,
  browser_automation_session_id UUID REFERENCES browser_automation_sessions(id),
  -- Layer 4: Voice Calling
  voice_call_attempted BOOLEAN DEFAULT false,
  voice_call_success BOOLEAN DEFAULT false,
  voice_call_id UUID REFERENCES voice_calls(id),
  -- Layer 5: Manual Intervention
  manual_intervention_required BOOLEAN DEFAULT false,
  manual_intervention_completed BOOLEAN DEFAULT false,
  -- Final outcome
  final_status TEXT DEFAULT 'in_progress' CHECK (final_status IN ('in_progress', 'success', 'partial_success', 'failure')),
  final_result JSONB,
  total_time_to_resolution_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- VOICE CALLING (1 table)
-- ============================================================================

-- Voice calls for Phase 3 automation
CREATE TABLE IF NOT EXISTS public.voice_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  call_sid TEXT UNIQUE,
  status TEXT DEFAULT 'initiated',
  purpose TEXT NOT NULL,
  transcript TEXT,
  duration_seconds INTEGER,
  cost_usd DECIMAL(8,4),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- FEATURE MANAGEMENT (1 table)
-- ============================================================================

-- Feature flags for phase-based development
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- AI AGENT RESULTS (1 table)
-- ============================================================================

-- Agent results for AI orchestration
CREATE TABLE IF NOT EXISTS public.agent_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('flight', 'hotel', 'activity', 'restaurant')),
  search_params JSONB NOT NULL,
  results JSONB NOT NULL,
  result_count INTEGER DEFAULT 0,
  confidence_score DECIMAL(3,2),
  processing_time_ms INTEGER,
  api_source TEXT,
  fallback_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================

-- User-related indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active, expires_at);

-- Booking and travel indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_type_status ON bookings(booking_type, status);
CREATE INDEX IF NOT EXISTS idx_itineraries_user_id ON itineraries(user_id);
CREATE INDEX IF NOT EXISTS idx_itineraries_dates ON itineraries(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_itinerary_bookings_itinerary ON itinerary_bookings(itinerary_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_bookings_booking ON itinerary_bookings(booking_id);

-- Search and caching indexes
CREATE INDEX IF NOT EXISTS idx_search_cache_type_hash ON search_cache(search_type, search_params_hash);
CREATE INDEX IF NOT EXISTS idx_search_cache_expires_at ON search_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_search_history_user_id ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_type ON search_history(search_type);

-- Session management indexes
CREATE INDEX IF NOT EXISTS idx_context_snapshots_session ON context_snapshots(session_id, version);
CREATE INDEX IF NOT EXISTS idx_shopping_carts_session ON shopping_carts(session_id);
CREATE INDEX IF NOT EXISTS idx_shopping_carts_user ON shopping_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_browser_sessions_user ON browser_automation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_browser_sessions_status ON browser_automation_sessions(status, created_at);

-- Template indexes
CREATE INDEX IF NOT EXISTS idx_trip_templates_creator ON trip_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_trip_templates_type ON trip_templates(template_type, privacy_level);
CREATE INDEX IF NOT EXISTS idx_trip_templates_destination ON trip_templates(destination);
CREATE INDEX IF NOT EXISTS idx_template_sharing_template ON template_sharing(template_id);
CREATE INDEX IF NOT EXISTS idx_template_versions_template ON template_versions(template_id, is_current);
CREATE INDEX IF NOT EXISTS idx_template_usage_template ON template_usage(template_id);

-- Automation and fallback indexes
CREATE INDEX IF NOT EXISTS idx_api_failures_provider ON api_failures(api_provider, failure_type);
CREATE INDEX IF NOT EXISTS idx_api_failures_session ON api_failures(session_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_user ON automation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_session ON automation_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_fallback_cascades_session ON fallback_cascades(session_id);
CREATE INDEX IF NOT EXISTS idx_fallback_cascades_status ON fallback_cascades(final_status, created_at);

-- Voice and feature indexes
CREATE INDEX IF NOT EXISTS idx_voice_calls_user ON voice_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_calls_status ON voice_calls(status, created_at);
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(feature_name);
CREATE INDEX IF NOT EXISTS idx_agent_results_session ON agent_results(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_results_type ON agent_results(agent_type);

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Cache cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM search_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Session cleanup function
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW() AND is_active = false;
END;
$$ LANGUAGE plpgsql;

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
-- ============================================================================

-- Users table trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User preferences trigger
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User sessions trigger
DROP TRIGGER IF EXISTS update_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER update_user_sessions_updated_at
  BEFORE UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bookings trigger
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Itineraries trigger
DROP TRIGGER IF EXISTS update_itineraries_updated_at ON itineraries;
CREATE TRIGGER update_itineraries_updated_at
  BEFORE UPDATE ON itineraries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Shopping carts trigger
DROP TRIGGER IF EXISTS update_shopping_carts_updated_at ON shopping_carts;
CREATE TRIGGER update_shopping_carts_updated_at
  BEFORE UPDATE ON shopping_carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trip templates trigger
DROP TRIGGER IF EXISTS update_trip_templates_updated_at ON trip_templates;
CREATE TRIGGER update_trip_templates_updated_at
  BEFORE UPDATE ON trip_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Voice calls trigger
DROP TRIGGER IF EXISTS update_voice_calls_updated_at ON voice_calls;
CREATE TRIGGER update_voice_calls_updated_at
  BEFORE UPDATE ON voice_calls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Feature flags trigger
DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON feature_flags;
CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA FOR DEVELOPMENT
-- ============================================================================

-- Sample feature flags for phase-based development
INSERT INTO feature_flags (feature_name, is_enabled) VALUES
  ('mock_apis', true),
  ('browser_automation', true),
  ('voice_calling', false),
  ('real_payments', false),
  ('advanced_ai', true),
  ('template_sharing', true),
  ('analytics_tracking', true),
  ('performance_monitoring', true)
ON CONFLICT (feature_name) DO NOTHING;

-- Sample automation levels configuration
INSERT INTO feature_flags (feature_name, is_enabled) VALUES
  ('automation_level_0', true),  -- Manual only
  ('automation_level_5', true),  -- Balanced (default)
  ('automation_level_10', true)  -- Full automation
ON CONFLICT (feature_name) DO NOTHING;

-- Phase-based feature flags
INSERT INTO feature_flags (feature_name, is_enabled) VALUES
  ('phase_1_apis', true),    -- OpenAI, Stripe, mocks
  ('phase_2_apis', false),   -- Tequila, Booking.com, Viator
  ('phase_3_apis', false)    -- Twilio, ElevenLabs, Rome2Rio
ON CONFLICT (feature_name) DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'TravelAgentic Modern Database Seed Complete!';
  RAISE NOTICE '✅ 21 tables created with comprehensive structure';
  RAISE NOTICE '✅ Performance indexes optimized for AI-first workflows';
  RAISE NOTICE '✅ 5-layer fallback system support enabled';
  RAISE NOTICE '✅ Browser automation & voice calling ready';
  RAISE NOTICE '✅ Trip templates & sharing system configured';
  RAISE NOTICE '✅ Phase-based development flags initialized';
  RAISE NOTICE '🚀 Ready for TravelAgentic production deployment!';
END $$; 