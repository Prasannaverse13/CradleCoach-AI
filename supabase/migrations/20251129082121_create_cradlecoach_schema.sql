/*
  # CradleCoach AI - Complete Database Schema

  ## Overview
  Creates the complete database schema for CradleCoach AI, a parenting co-pilot application
  for newborn-3 year olds that logs activities, provides personalized insights, and offers
  AI-powered parenting guidance.

  ## New Tables

  ### 1. `parents`
  Parent user profiles with preferences
  - `id` (uuid, FK to auth.users)
  - `name` (text)
  - `email` (text)
  - `country` (text)
  - `timezone` (text)
  - `language` (text, default 'en')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `children`
  Child profiles linked to parents
  - `id` (uuid, PK)
  - `parent_id` (uuid, FK to parents)
  - `name` (text)
  - `date_of_birth` (date)
  - `sex` (text)
  - `birth_type` (text: full-term/pre-term)
  - `feeding_type` (text: breast/formula/mixed)
  - `notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `parent_goals`
  Parent's selected goals for their child
  - `id` (uuid, PK)
  - `parent_id` (uuid, FK to parents)
  - `child_id` (uuid, FK to children)
  - `goal_type` (text: better_sleep/better_feeding/routines/milestones)
  - `created_at` (timestamptz)

  ### 4. `logs_sleep`
  Sleep tracking logs
  - `id` (uuid, PK)
  - `child_id` (uuid, FK to children)
  - `start_time` (timestamptz)
  - `end_time` (timestamptz)
  - `type` (text: nap/night)
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 5. `logs_feed`
  Feeding tracking logs
  - `id` (uuid, PK)
  - `child_id` (uuid, FK to children)
  - `time` (timestamptz)
  - `type` (text: breast/formula/solid)
  - `side` (text: left/right/both, for breastfeeding)
  - `duration_minutes` (integer, for breastfeeding)
  - `quantity_ml` (integer, for formula)
  - `food_description` (text, for solids)
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 6. `logs_diaper`
  Diaper change tracking
  - `id` (uuid, PK)
  - `child_id` (uuid, FK to children)
  - `time` (timestamptz)
  - `type` (text: wet/dirty/both)
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 7. `logs_mood`
  Mood and event tracking
  - `id` (uuid, PK)
  - `child_id` (uuid, FK to children)
  - `time` (timestamptz)
  - `mood` (text: fussy/calm/happy/sick)
  - `event_type` (text: vaccination/travel/new_caregiver/other)
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 8. `milestones`
  Developmental milestones tracking
  - `id` (uuid, PK)
  - `child_id` (uuid, FK to children)
  - `milestone_type` (text)
  - `achieved_at` (timestamptz)
  - `notes` (text)
  - `created_at` (timestamptz)

  ### 9. `chat_sessions`
  AI chat conversations
  - `id` (uuid, PK)
  - `parent_id` (uuid, FK to parents)
  - `child_id` (uuid, FK to children)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 10. `chat_messages`
  Individual messages in chat sessions
  - `id` (uuid, PK)
  - `session_id` (uuid, FK to chat_sessions)
  - `role` (text: user/assistant)
  - `content` (text)
  - `created_at` (timestamptz)

  ### 11. `insights`
  Generated insights and recommendations
  - `id` (uuid, PK)
  - `child_id` (uuid, FK to children)
  - `insight_type` (text: sleep/feeding/digestive/activity)
  - `title` (text)
  - `description` (text)
  - `priority` (text: high/medium/low)
  - `valid_until` (timestamptz)
  - `created_at` (timestamptz)

  ### 12. `feedback`
  User feedback on features and insights
  - `id` (uuid, PK)
  - `parent_id` (uuid, FK to parents)
  - `event_type` (text)
  - `rating` (integer: 1-5)
  - `text` (text)
  - `created_at` (timestamptz)

  ### 13. `waitlist`
  Pre-launch waitlist signups
  - `id` (uuid, PK)
  - `email` (text, unique)
  - `parent_stage` (text)
  - `created_at` (timestamptz)

  ## Security
  - All tables have RLS enabled
  - Parents can only access their own data
  - Children data accessible only by their parent
  - All logs/data accessible only through proper parent-child relationship
  - Waitlist is public insert, admin read only
*/

-- Create parents table (linked to auth.users)
CREATE TABLE IF NOT EXISTS parents (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  country text DEFAULT '',
  timezone text DEFAULT 'UTC',
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own parent profile"
  ON parents FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own parent profile"
  ON parents FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own parent profile"
  ON parents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  name text NOT NULL,
  date_of_birth date NOT NULL,
  sex text DEFAULT '',
  birth_type text DEFAULT 'full-term',
  feeding_type text DEFAULT 'mixed',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own children"
  ON children FOR SELECT
  TO authenticated
  USING (parent_id = auth.uid());

CREATE POLICY "Parents can insert own children"
  ON children FOR INSERT
  TO authenticated
  WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can update own children"
  ON children FOR UPDATE
  TO authenticated
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can delete own children"
  ON children FOR DELETE
  TO authenticated
  USING (parent_id = auth.uid());

-- Create parent_goals table
CREATE TABLE IF NOT EXISTS parent_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  goal_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE parent_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own goals"
  ON parent_goals FOR SELECT
  TO authenticated
  USING (parent_id = auth.uid());

CREATE POLICY "Parents can insert own goals"
  ON parent_goals FOR INSERT
  TO authenticated
  WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can delete own goals"
  ON parent_goals FOR DELETE
  TO authenticated
  USING (parent_id = auth.uid());

-- Create logs_sleep table
CREATE TABLE IF NOT EXISTS logs_sleep (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  type text NOT NULL DEFAULT 'nap',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE logs_sleep ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own children sleep logs"
  ON logs_sleep FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_sleep.child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert own children sleep logs"
  ON logs_sleep FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update own children sleep logs"
  ON logs_sleep FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_sleep.child_id
      AND children.parent_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can delete own children sleep logs"
  ON logs_sleep FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_sleep.child_id
      AND children.parent_id = auth.uid()
    )
  );

-- Create logs_feed table
CREATE TABLE IF NOT EXISTS logs_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  time timestamptz NOT NULL,
  type text NOT NULL,
  side text DEFAULT '',
  duration_minutes integer DEFAULT 0,
  quantity_ml integer DEFAULT 0,
  food_description text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE logs_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own children feed logs"
  ON logs_feed FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_feed.child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert own children feed logs"
  ON logs_feed FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update own children feed logs"
  ON logs_feed FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_feed.child_id
      AND children.parent_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can delete own children feed logs"
  ON logs_feed FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_feed.child_id
      AND children.parent_id = auth.uid()
    )
  );

-- Create logs_diaper table
CREATE TABLE IF NOT EXISTS logs_diaper (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  time timestamptz NOT NULL,
  type text NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE logs_diaper ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own children diaper logs"
  ON logs_diaper FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_diaper.child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert own children diaper logs"
  ON logs_diaper FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update own children diaper logs"
  ON logs_diaper FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_diaper.child_id
      AND children.parent_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can delete own children diaper logs"
  ON logs_diaper FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_diaper.child_id
      AND children.parent_id = auth.uid()
    )
  );

-- Create logs_mood table
CREATE TABLE IF NOT EXISTS logs_mood (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  time timestamptz NOT NULL,
  mood text NOT NULL,
  event_type text DEFAULT '',
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE logs_mood ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own children mood logs"
  ON logs_mood FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_mood.child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert own children mood logs"
  ON logs_mood FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update own children mood logs"
  ON logs_mood FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_mood.child_id
      AND children.parent_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can delete own children mood logs"
  ON logs_mood FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_mood.child_id
      AND children.parent_id = auth.uid()
    )
  );

-- Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  milestone_type text NOT NULL,
  achieved_at timestamptz NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own children milestones"
  ON milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = milestones.child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert own children milestones"
  ON milestones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can update own children milestones"
  ON milestones FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = milestones.child_id
      AND children.parent_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can delete own children milestones"
  ON milestones FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = milestones.child_id
      AND children.parent_id = auth.uid()
    )
  );

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own chat sessions"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (parent_id = auth.uid());

CREATE POLICY "Parents can insert own chat sessions"
  ON chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can update own chat sessions"
  ON chat_sessions FOR UPDATE
  TO authenticated
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view messages in own chat sessions"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.parent_id = auth.uid()
    )
  );

CREATE POLICY "Parents can insert messages in own chat sessions"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = session_id
      AND chat_sessions.parent_id = auth.uid()
    )
  );

-- Create insights table
CREATE TABLE IF NOT EXISTS insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  insight_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  priority text DEFAULT 'medium',
  valid_until timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view insights for own children"
  ON insights FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = insights.child_id
      AND children.parent_id = auth.uid()
    )
  );

-- Create feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  rating integer,
  text text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (parent_id = auth.uid());

CREATE POLICY "Parents can insert own feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (parent_id = auth.uid());

-- Create waitlist table (public inserts for landing page)
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  parent_stage text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join waitlist"
  ON waitlist FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_children_parent_id ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_logs_sleep_child_id ON logs_sleep(child_id);
CREATE INDEX IF NOT EXISTS idx_logs_sleep_start_time ON logs_sleep(start_time);
CREATE INDEX IF NOT EXISTS idx_logs_feed_child_id ON logs_feed(child_id);
CREATE INDEX IF NOT EXISTS idx_logs_feed_time ON logs_feed(time);
CREATE INDEX IF NOT EXISTS idx_logs_diaper_child_id ON logs_diaper(child_id);
CREATE INDEX IF NOT EXISTS idx_logs_mood_child_id ON logs_mood(child_id);
CREATE INDEX IF NOT EXISTS idx_milestones_child_id ON milestones(child_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_parent_id ON chat_sessions(parent_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_insights_child_id ON insights(child_id);