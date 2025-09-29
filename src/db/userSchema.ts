import { integer, pgTable, varchar, text } from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const usersTable = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  role: varchar({ length: 255 }).notNull().default('user'),
  name: varchar({ length: 255 }),
  address: text(),
});

// Create manual schema instead of using createInsertSchema
export const createUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(255),
  name: z.string().max(255).optional(),
  address: z.string().optional(),
});

// Create manual schema instead of using createInsertSchema
export const loginUserSchema = z.object({
  email: z.string(),
  password: z.string().min(1).max(255)
});