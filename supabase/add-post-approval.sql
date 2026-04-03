-- Add approval field to posts table
-- Posts default to unapproved; only admin-approved posts appear in the public feed
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
