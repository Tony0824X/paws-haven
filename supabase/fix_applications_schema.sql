-- Add missing columns to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS reviewer_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.users(id);

-- Update RLS for reviewed_by column if needed
-- (Since we already have admin policies, we just need the columns to exist for the update to succeed)
