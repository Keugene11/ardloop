-- SECURITY FIX: Lock down purchases table RLS policies
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/qpjzpgzwzyudeubklvzs/sql)
--
-- The old policies allowed ANY authenticated user to insert/update purchases,
-- meaning someone could create fake purchase records or mark purchases as completed.
-- The API routes use the service_role key which bypasses RLS, so they still work.

-- Drop the overly permissive policies
DROP POLICY IF EXISTS "System can insert purchases" ON public.purchases;
DROP POLICY IF EXISTS "System can update purchases" ON public.purchases;

-- Create restrictive policies that block all direct client access
-- (service_role key used by API routes bypasses RLS entirely)
CREATE POLICY "No direct insert purchases" ON public.purchases
  FOR INSERT WITH CHECK (false);

CREATE POLICY "No direct update purchases" ON public.purchases
  FOR UPDATE USING (false);
