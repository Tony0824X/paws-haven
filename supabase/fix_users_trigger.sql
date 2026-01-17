-- Fix for foreign key constraint issue with anonymous users
-- Run this in Supabase SQL Editor

-- First, update the users table to allow null email (for anonymous users)
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to automatically insert user into users table on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, avatar_url, badge)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', COALESCE(split_part(NEW.email, '@', 1), 'Anonymous User')),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://picsum.photos/200/200?random=' || floor(random() * 100)::text),
    '新手領養人'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also insert any existing auth users that might not be in users table
INSERT INTO public.users (id, email, name, avatar_url, badge)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', COALESCE(split_part(email, '@', 1), 'Anonymous User')),
  'https://picsum.photos/200/200?random=' || floor(random() * 100)::text,
  '新手領養人'
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.users WHERE public.users.id = auth.users.id
);
