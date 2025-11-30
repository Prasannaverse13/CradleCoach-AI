import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Parent {
  id: string;
  name: string;
  email: string;
  country: string;
  timezone: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  date_of_birth: string;
  sex: string;
  birth_type: string;
  feeding_type: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ParentGoal {
  id: string;
  parent_id: string;
  child_id: string;
  goal_type: string;
  created_at: string;
}

export interface SleepLog {
  id: string;
  child_id: string;
  start_time: string;
  end_time: string | null;
  type: 'nap' | 'night';
  notes: string;
  created_at: string;
}

export interface FeedLog {
  id: string;
  child_id: string;
  time: string;
  type: 'breast' | 'formula' | 'solid';
  side?: string;
  duration_minutes?: number;
  quantity_ml?: number;
  food_description?: string;
  notes: string;
  created_at: string;
}

export interface DiaperLog {
  id: string;
  child_id: string;
  time: string;
  type: 'wet' | 'dirty' | 'both';
  notes: string;
  created_at: string;
}

export interface MoodLog {
  id: string;
  child_id: string;
  time: string;
  mood: 'fussy' | 'calm' | 'happy' | 'sick';
  event_type?: string;
  notes: string;
  created_at: string;
}

export interface Milestone {
  id: string;
  child_id: string;
  milestone_type: string;
  achieved_at: string;
  notes: string;
  created_at: string;
}

export interface ChatSession {
  id: string;
  parent_id: string;
  child_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Insight {
  id: string;
  child_id: string;
  insight_type: 'sleep' | 'feeding' | 'digestive' | 'activity';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  valid_until: string | null;
  created_at: string;
}
