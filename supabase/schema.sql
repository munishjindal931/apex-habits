-- Apex Habits - Supabase SQL Schema & Row Level Security (RLS) Policies
-- Run this script in your Supabase SQL Editor (https://app.supabase.com -> SQL Editor)

-- 1. Profiles Table (Extends Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  onboarding_complete BOOLEAN DEFAULT false NOT NULL,
  sound_enabled BOOLEAN DEFAULT true NOT NULL,
  haptics_enabled BOOLEAN DEFAULT true NOT NULL,
  notifications_enabled BOOLEAN DEFAULT false NOT NULL
);

-- 2. Habits Table
CREATE TABLE IF NOT EXISTS public.habits (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('binary', 'count')),
  target_count INTEGER DEFAULT 1 NOT NULL,
  reminder_time TEXT,
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habit Logs Table (Daily Progress Counts)
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id TEXT REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  date TEXT NOT NULL, -- Format: YYYY-MM-DD
  count INTEGER DEFAULT 0 NOT NULL,
  UNIQUE(user_id, habit_id, date)
);

-- 4. Kickstart Challenges Table
CREATE TABLE IF NOT EXISTS public.challenges (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id TEXT REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  habit_name TEXT NOT NULL,
  length_days INTEGER NOT NULL,
  start_date TEXT NOT NULL, -- Format: YYYY-MM-DD
  status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'completed', 'lost')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Grant schema permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

-- Drop any existing conflicting policies
DROP POLICY IF EXISTS "Authenticated users full access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users full access to habits" ON public.habits;
DROP POLICY IF EXISTS "Authenticated users full access to habit_logs" ON public.habit_logs;
DROP POLICY IF EXISTS "Authenticated users full access to challenges" ON public.challenges;

DROP POLICY IF EXISTS "Users can select their own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can insert their own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can update their own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can delete their own habits" ON public.habits;

DROP POLICY IF EXISTS "Users can select their own habit logs" ON public.habit_logs;
DROP POLICY IF EXISTS "Users can insert their own habit logs" ON public.habit_logs;
DROP POLICY IF EXISTS "Users can update their own habit logs" ON public.habit_logs;
DROP POLICY IF EXISTS "Users can delete their own habit logs" ON public.habit_logs;

DROP POLICY IF EXISTS "Users can select their own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can insert their own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can update their own challenges" ON public.challenges;
DROP POLICY IF EXISTS "Users can delete their own challenges" ON public.challenges;

-- Unified Full Access RLS Policies for Authenticated Users
CREATE POLICY "Authenticated users full access to profiles" ON public.profiles
  FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users full access to habits" ON public.habits
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users full access to habit_logs" ON public.habit_logs
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users full access to challenges" ON public.challenges
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trigger to automatically create a profile record when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, onboarding_complete)
  VALUES (new.id, false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
