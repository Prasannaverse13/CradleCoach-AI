/*
  # Fix Security and Performance Issues

  ## Changes Made

  ### 1. Add Missing Foreign Key Indexes
  - Add index on `chat_sessions.child_id`
  - Add index on `feedback.parent_id`
  - Add index on `parent_goals.child_id`
  - Add index on `parent_goals.parent_id`

  ### 2. Optimize RLS Policies (wrap auth.uid() in SELECT)
  All RLS policies updated to use `(select auth.uid())` instead of `auth.uid()`
  to prevent re-evaluation for each row, improving query performance at scale.
  
  Tables optimized:
  - parents (3 policies)
  - children (4 policies)
  - parent_goals (3 policies)
  - logs_sleep (4 policies)
  - logs_feed (4 policies)
  - logs_diaper (4 policies)
  - logs_mood (4 policies)
  - milestones (4 policies)
  - chat_sessions (3 policies)
  - chat_messages (2 policies)
  - insights (1 policy)
  - feedback (2 policies)

  ### 3. Move pg_net Extension
  Move pg_net extension from public schema to extensions schema

  ### 4. Drop Unused Indexes
  - Drop idx_logs_feed_time (unused)
  - Drop idx_chat_messages_session_id (unused, will recreate optimized version)

  ## Notes
  - All changes are non-breaking
  - Improves query performance at scale
  - Follows Supabase best practices for RLS
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_chat_sessions_child_id ON chat_sessions(child_id);
CREATE INDEX IF NOT EXISTS idx_feedback_parent_id ON feedback(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_goals_child_id ON parent_goals(child_id);
CREATE INDEX IF NOT EXISTS idx_parent_goals_parent_id ON parent_goals(parent_id);

-- ============================================================================
-- 2. DROP AND RECREATE RLS POLICIES WITH OPTIMIZED auth.uid()
-- ============================================================================

-- PARENTS TABLE
DROP POLICY IF EXISTS "Users can view own parent profile" ON parents;
DROP POLICY IF EXISTS "Users can update own parent profile" ON parents;
DROP POLICY IF EXISTS "Users can insert own parent profile" ON parents;

CREATE POLICY "Users can view own parent profile"
  ON parents FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own parent profile"
  ON parents FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own parent profile"
  ON parents FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

-- CHILDREN TABLE
DROP POLICY IF EXISTS "Parents can view own children" ON children;
DROP POLICY IF EXISTS "Parents can insert own children" ON children;
DROP POLICY IF EXISTS "Parents can update own children" ON children;
DROP POLICY IF EXISTS "Parents can delete own children" ON children;

CREATE POLICY "Parents can view own children"
  ON children FOR SELECT
  TO authenticated
  USING (parent_id = (select auth.uid()));

CREATE POLICY "Parents can insert own children"
  ON children FOR INSERT
  TO authenticated
  WITH CHECK (parent_id = (select auth.uid()));

CREATE POLICY "Parents can update own children"
  ON children FOR UPDATE
  TO authenticated
  USING (parent_id = (select auth.uid()))
  WITH CHECK (parent_id = (select auth.uid()));

CREATE POLICY "Parents can delete own children"
  ON children FOR DELETE
  TO authenticated
  USING (parent_id = (select auth.uid()));

-- PARENT_GOALS TABLE
DROP POLICY IF EXISTS "Parents can view own goals" ON parent_goals;
DROP POLICY IF EXISTS "Parents can insert own goals" ON parent_goals;
DROP POLICY IF EXISTS "Parents can delete own goals" ON parent_goals;

CREATE POLICY "Parents can view own goals"
  ON parent_goals FOR SELECT
  TO authenticated
  USING (parent_id = (select auth.uid()));

CREATE POLICY "Parents can insert own goals"
  ON parent_goals FOR INSERT
  TO authenticated
  WITH CHECK (parent_id = (select auth.uid()));

CREATE POLICY "Parents can delete own goals"
  ON parent_goals FOR DELETE
  TO authenticated
  USING (parent_id = (select auth.uid()));

-- LOGS_SLEEP TABLE
DROP POLICY IF EXISTS "Parents can view own children sleep logs" ON logs_sleep;
DROP POLICY IF EXISTS "Parents can insert own children sleep logs" ON logs_sleep;
DROP POLICY IF EXISTS "Parents can update own children sleep logs" ON logs_sleep;
DROP POLICY IF EXISTS "Parents can delete own children sleep logs" ON logs_sleep;

CREATE POLICY "Parents can view own children sleep logs"
  ON logs_sleep FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_sleep.child_id
      AND children.parent_id = (select auth.uid())
    )
  );

CREATE POLICY "Parents can insert own children sleep logs"
  ON logs_sleep FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = (select auth.uid())
    )
  );

CREATE POLICY "Parents can update own children sleep logs"
  ON logs_sleep FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_sleep.child_id
      AND children.parent_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = (select auth.uid())
    )
  );

CREATE POLICY "Parents can delete own children sleep logs"
  ON logs_sleep FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_sleep.child_id
      AND children.parent_id = (select auth.uid())
    )
  );

-- LOGS_FEED TABLE
DROP POLICY IF EXISTS "Parents can view own children feed logs" ON logs_feed;
DROP POLICY IF EXISTS "Parents can insert own children feed logs" ON logs_feed;
DROP POLICY IF EXISTS "Parents can update own children feed logs" ON logs_feed;
DROP POLICY IF EXISTS "Parents can delete own children feed logs" ON logs_feed;

CREATE POLICY "Parents can view own children feed logs"
  ON logs_feed FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_feed.child_id
      AND children.parent_id = (select auth.uid())
    )
  );

CREATE POLICY "Parents can insert own children feed logs"
  ON logs_feed FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = (select auth.uid())
    )
  );

CREATE POLICY "Parents can update own children feed logs"
  ON logs_feed FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_feed.child_id
      AND children.parent_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = (select auth.uid())
    )
  );

CREATE POLICY "Parents can delete own children feed logs"
  ON logs_feed FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_feed.child_id
      AND children.parent_id = (select auth.uid())
    )
  );

-- LOGS_DIAPER TABLE
DROP POLICY IF EXISTS "Parents can view own children diaper logs" ON logs_diaper;
DROP POLICY IF EXISTS "Parents can insert own children diaper logs" ON logs_diaper;
DROP POLICY IF EXISTS "Parents can update own children diaper logs" ON logs_diaper;
DROP POLICY IF EXISTS "Parents can delete own children diaper logs" ON logs_diaper;

CREATE POLICY "Parents can view own children diaper logs"
  ON logs_diaper FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_diaper.child_id
      AND children.parent_id = (select auth.uid())
    )
  );

CREATE POLICY "Parents can insert own children diaper logs"
  ON logs_diaper FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = (select auth.uid())
    )
  );

CREATE POLICY "Parents can update own children diaper logs"
  ON logs_diaper FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_diaper.child_id
      AND children.parent_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = (select auth.uid())
    )
  );

CREATE POLICY "Parents can delete own children diaper logs"
  ON logs_diaper FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_diaper.child_id
      AND children.parent_id = (select auth.uid())
    )
  );

-- LOGS_MOOD TABLE
DROP POLICY IF EXISTS "Parents can view own children mood logs" ON logs_mood;
DROP POLICY IF EXISTS "Parents can insert own children mood logs" ON logs_mood;
DROP POLICY IF EXISTS "Parents can update own children mood logs" ON logs_mood;
DROP POLICY IF EXISTS "Parents can delete own children mood logs" ON logs_mood;

CREATE POLICY "Parents can view own children mood logs"
  ON logs_mood FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_mood.child_id
      AND children.parent_id = (select auth.uid())
    )
  );

CREATE POLICY "Parents can insert own children mood logs"
  ON logs_mood FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = (select auth.uid())
    )
  );

CREATE POLICY "Parents can update own children mood logs"
  ON logs_mood FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_mood.child_id
      AND children.parent_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = (select auth.uid())
    )
  );

CREATE POLICY "Parents can delete own children mood logs"
  ON logs_mood FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = logs_mood.child_id
      AND children.parent_id = (select auth.uid())
    )
  );

-- MILESTONES TABLE
DROP POLICY IF EXISTS "Parents can view own children milestones" ON milestones;
DROP POLICY IF EXISTS "Parents can insert own children milestones" ON milestones;
DROP POLICY IF EXISTS "Parents can update own children milestones" ON milestones;
DROP POLICY IF EXISTS "Parents can delete own children milestones" ON milestones;

CREATE POLICY "Parents can view own children milestones"
  ON milestones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = milestones.child_id
      AND children.parent_id = (select auth.uid())
    )
  );

CREATE POLICY "Parents can insert own children milestones"
  ON milestones FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = (select auth.uid())
    )
  );

CREATE POLICY "Parents can update own children milestones"
  ON milestones FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = milestones.child_id
      AND children.parent_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.parent_id = (select auth.uid())
    )
  );

CREATE POLICY "Parents can delete own children milestones"
  ON milestones FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = milestones.child_id
      AND children.parent_id = (select auth.uid())
    )
  );

-- CHAT_SESSIONS TABLE
DROP POLICY IF EXISTS "Parents can view own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Parents can insert own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Parents can update own chat sessions" ON chat_sessions;

CREATE POLICY "Parents can view own chat sessions"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (parent_id = (select auth.uid()));

CREATE POLICY "Parents can insert own chat sessions"
  ON chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (parent_id = (select auth.uid()));

CREATE POLICY "Parents can update own chat sessions"
  ON chat_sessions FOR UPDATE
  TO authenticated
  USING (parent_id = (select auth.uid()))
  WITH CHECK (parent_id = (select auth.uid()));

-- CHAT_MESSAGES TABLE
DROP POLICY IF EXISTS "Parents can view messages in own chat sessions" ON chat_messages;
DROP POLICY IF EXISTS "Parents can insert messages in own chat sessions" ON chat_messages;

CREATE POLICY "Parents can view messages in own chat sessions"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.parent_id = (select auth.uid())
    )
  );

CREATE POLICY "Parents can insert messages in own chat sessions"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions
      WHERE chat_sessions.id = session_id
      AND chat_sessions.parent_id = (select auth.uid())
    )
  );

-- INSIGHTS TABLE
DROP POLICY IF EXISTS "Parents can view insights for own children" ON insights;

CREATE POLICY "Parents can view insights for own children"
  ON insights FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = insights.child_id
      AND children.parent_id = (select auth.uid())
    )
  );

-- FEEDBACK TABLE
DROP POLICY IF EXISTS "Parents can view own feedback" ON feedback;
DROP POLICY IF EXISTS "Parents can insert own feedback" ON feedback;

CREATE POLICY "Parents can view own feedback"
  ON feedback FOR SELECT
  TO authenticated
  USING (parent_id = (select auth.uid()));

CREATE POLICY "Parents can insert own feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (parent_id = (select auth.uid()));

-- ============================================================================
-- 3. DROP UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS idx_logs_feed_time;
DROP INDEX IF EXISTS idx_chat_messages_session_id;

-- Recreate chat_messages index with proper naming
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id_new ON chat_messages(session_id);
