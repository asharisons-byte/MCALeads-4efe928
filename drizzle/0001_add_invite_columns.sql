-- Add invite token columns to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS invite_expires_at TIMESTAMP;

-- Create index for faster invite token lookups
CREATE INDEX IF NOT EXISTS idx_users_invite_token ON users(invite_token);
