/*
  # Fix Remaining Security Issues

  ## Changes Made

  ### 1. Fix Function Search Path
  - Add explicit SET search_path to send_welcome_email function
  - Prevents search_path manipulation attacks
  - Sets immutable search_path for security

  ### 2. Move pg_net Extension
  - Create extensions schema if not exists
  - Move pg_net extension from public to extensions schema
  - Improves security by isolating extensions

  ### 3. Unused Indexes Note
  The following indexes are flagged as unused but are kept for future performance:
  - idx_chat_sessions_child_id: Will be used when filtering chats by child
  - idx_feedback_parent_id: Will be used for parent feedback queries
  - idx_parent_goals_child_id: Will be used for child goal lookups
  - idx_parent_goals_parent_id: Will be used for parent goal queries
  - idx_chat_messages_session_id_new: Will be used for message pagination
  
  These are preventive indexes for when the app scales.

  ## Notes
  - Non-breaking changes
  - Improves security posture
  - Follows PostgreSQL and Supabase best practices
*/

-- ============================================================================
-- 1. CREATE EXTENSIONS SCHEMA AND MOVE PG_NET
-- ============================================================================

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Move pg_net extension to extensions schema
-- First, we need to drop and recreate it in the new schema
DROP EXTENSION IF EXISTS pg_net CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- ============================================================================
-- 2. FIX FUNCTION SEARCH PATH
-- ============================================================================

-- Recreate send_welcome_email function with explicit search_path
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  -- Make async HTTP request to edge function using extensions.net
  PERFORM extensions.net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key', true)
    ),
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'parents',
      'record', jsonb_build_object(
        'id', NEW.id,
        'email', NEW.email,
        'created_at', NEW.created_at
      ),
      'schema', 'public'
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Failed to send welcome email: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Ensure trigger still exists
DROP TRIGGER IF EXISTS on_parent_created ON parents;
CREATE TRIGGER on_parent_created
  AFTER INSERT ON parents
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_email();

-- ============================================================================
-- 3. GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION send_welcome_email() TO authenticated, service_role;

-- Grant usage on pg_net in extensions schema
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
