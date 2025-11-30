/*
  # Add Welcome Email Trigger

  1. Changes
    - Creates a database trigger that sends welcome email when new parent signs up
    - Calls the send-welcome-email edge function via HTTP request
    - Executes asynchronously to not block user registration
  
  2. Notes
    - The trigger fires AFTER INSERT on the parents table
    - Uses pg_net extension for HTTP requests to edge function
    - Non-blocking: email sending happens in background
*/

-- Enable pg_net extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create function to send welcome email
CREATE OR REPLACE FUNCTION send_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Make async HTTP request to edge function
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on parents table
DROP TRIGGER IF EXISTS on_parent_created ON parents;
CREATE TRIGGER on_parent_created
  AFTER INSERT ON parents
  FOR EACH ROW
  EXECUTE FUNCTION send_welcome_email();
