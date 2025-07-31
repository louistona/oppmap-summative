import { createClient } from '@supabase/supabase-js'

const REACT_APP_SUPABASE_URL='https://thspjfrhfmpeexkwwmok.supabase.co'
const REACT_APP_SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoc3BqZnJoZm1wZWV4a3d3bW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDM4MTMsImV4cCI6MjA2OTUxOTgxM30.J7hkMcWOWgEHevyu8CHMP7hAFECWG0vcu1JTBIuV3SA'

const supabaseUrl = 'https://thspjfrhfmpeexkwwmok.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoc3BqZnJoZm1wZWV4a3d3bW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5NDM4MTMsImV4cCI6MjA2OTUxOTgxM30.J7hkMcWOWgEHevyu8CHMP7hAFECWG0vcu1JTBIuV3SA'

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database schema setup queries (run these in Supabase SQL editor)
export const SCHEMA_QUERIES = `
-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  severity INTEGER CHECK (severity >= 1 AND severity <= 5),
  location GEOGRAPHY(POINT, 4326),
  region_name TEXT,
  population_affected INTEGER,
  statistics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_bookmarks table
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Create solutions table
CREATE TABLE IF NOT EXISTS solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_challenges_category ON challenges(category);
CREATE INDEX IF NOT EXISTS idx_challenges_severity ON challenges(severity);
CREATE INDEX IF NOT EXISTS idx_challenges_location ON challenges USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_solutions_challenge_id ON solutions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_solutions_status ON solutions(status);

-- Enable RLS (Row Level Security)
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Challenges are readable by everyone, writable by admins
CREATE POLICY "Challenges are viewable by everyone" ON challenges FOR SELECT USING (true);
CREATE POLICY "Challenges are editable by admins" ON challenges FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  )
);

-- User profiles
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON user_bookmarks FOR ALL USING (auth.uid() = user_id);

-- Solutions
CREATE POLICY "Solutions are viewable by everyone if approved" ON solutions FOR SELECT USING (
  status = 'approved' OR user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  )
);
CREATE POLICY "Users can insert their own solutions" ON solutions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own solutions" ON solutions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all solutions" ON solutions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role = 'admin'
  )
);

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;