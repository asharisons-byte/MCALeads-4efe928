import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Migration to add invite_token and invite_expires_at to users table
// This is a reference schema showing the new columns added to the existing users table

export const usersWithInvite = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  displayName: text('display_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  role: text('role').notNull().default('Admin'),
  avatarUrl: text('avatar_url'),
  status: text('status').notNull().default('active'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  // NEW COLUMNS FOR INVITE FLOW
  inviteToken: text('invite_token').unique(),
  inviteExpiresAt: timestamp('invite_expires_at'),
});

// SQL migration statement (to be run via drizzle-kit or manually):
export const migrationSQL = `
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS invite_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS invite_expires_at TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_users_invite_token ON users(invite_token);
`;
