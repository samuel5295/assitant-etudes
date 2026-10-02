import { boolean, date, index, integer, pgTable, primaryKey, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull(),
  subject: text('subject').notNull(),
  kind: text('kind', { enum: ['course', 'td', 'exercise'] }).notNull().default('course'),
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(),
  textContent: text('text_content'),
  favorite: boolean('favorite').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('documents_owner_idx').on(table.ownerId)])

export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: text('owner_id').notNull(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  kind: text('kind', { enum: ['summary', 'exercise', 'explain'] }).notNull(),
  content: text('content').notNull(),
  prompt: text('prompt'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('notes_owner_idx').on(table.ownerId)])

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  ownerId: text('owner_id').notNull(),
  documentId: uuid('document_id').references(() => documents.id, { onDelete: 'cascade' }),
  role: text('role', { enum: ['user', 'assistant'] }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index('messages_owner_document_idx').on(table.ownerId, table.documentId)])

export const aiUsage = pgTable('ai_usage', {
  ownerId: text('owner_id').notNull(),
  day: date('day').notNull(),
  count: integer('count').notNull().default(1),
}, (table) => [primaryKey({ columns: [table.ownerId, table.day] })])
