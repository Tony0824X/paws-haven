-- Use this script in Supabase SQL Editor to elevate a user to Admin
-- Replace 'USER_EMAIL_HERE' with the email of the account you want to make admin

-- Example:
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@example.com';

-- You can also create a specific admin account manually in Auth first, then run:
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@pawshaven.com';

-- For quick setup if you know the ID:
-- UPDATE public.users SET role = 'admin' WHERE id = 'user-uuid-here';
