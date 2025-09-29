import { 
  integer, 
  pgTable, 
  varchar, 
  text, 
  boolean,
  serial,
  timestamp
} from "drizzle-orm/pg-core";

// Main product table - use consistent primary key approach
export const ProductTable = pgTable('product_table', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  productID: varchar('product_id', { length: 100 }).unique().notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  desc: text('desc'),
  logo: varchar('logo', { length: 500 }),
  banner: varchar('banner', { length: 500 }),
  isPaid: boolean('isPaid').default(false).notNull()
});

// Feature details - ADD CASCADE BEHAVIOR
export const FeatureDetailTable = pgTable('feature_detail_table', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  featureTitle: varchar('feature_title', { length: 255 }).notNull(),
  featureDesc: text('feature_desc'),
  productId: integer('product_id')
    .references(() => ProductTable.id, { onDelete: 'cascade' })
    .notNull()
});

// Feature cards - ADD CASCADE BEHAVIOR
export const FeatureCardTable = pgTable('feature_card_table', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  img: varchar('img', { length: 500 }),
  title: varchar('title', { length: 255 }).notNull(),
  desc: text('desc'),
  link: varchar('link', { length: 500 }),
  moreTitle: varchar('more_title', { length: 255 }),
  moreDesc: text('more_desc'),
  featureDetailId: integer('feature_detail_id')
    .references(() => FeatureDetailTable.id, { onDelete: 'cascade' })
    .notNull()
});

// Images - ADD CASCADE BEHAVIOR  
export const ImageTable = pgTable('image_table', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  url: varchar('url', { length: 1000 }).notNull(),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  productId: integer('product_id')
    .references(() => ProductTable.id, { onDelete: 'cascade' })
    .notNull()
});

// Tutorial links - ADD CASCADE BEHAVIOR
export const TutorialLinkTable = pgTable('tutorial_link_table', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 1000 }).notNull(),
  icon: varchar('icon', { length: 500 }),
  color: varchar('color', { length: 100 }),
  productId: integer('product_id')
    .references(() => ProductTable.id, { onDelete: 'cascade' })
    .notNull()
});

// Download card - ADD CASCADE BEHAVIOR (THIS FIXES YOUR SPECIFIC ERROR)
export const DownloadCardTable = pgTable('download_card_table', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  downloadLink: varchar('download_link', { length: 1000 }),
  title: varchar('title', { length: 255 }),
  desc: text('desc'),
  productId: integer('product_id')
    .references(() => ProductTable.id, { onDelete: 'cascade' })
    .notNull()
});

// License information - ADD CASCADE BEHAVIOR
export const LicenceInfoTable = pgTable('licence_info_table', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar('title', { length: 255 }),
  desc: text('desc'),
  whatsapp: varchar('whatsapp', { length: 500 }),
  instagram: varchar('instagram', { length: 500 }),
  telegram: varchar('telegram', { length: 500 }),
  downloadCardId: integer('download_card_id')
    .references(() => DownloadCardTable.id, { onDelete: 'cascade' })
    .notNull()
});

// Pricing plan - ADD CASCADE BEHAVIOR
export const PricingPlan = pgTable("pricing_plan", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  plan_key: varchar('plan_key', { length: 100 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  display_name: varchar('display_name', { length: 150 }).notNull(),
  description: text('description'),
  popular: boolean('popular').default(false).notNull(),
  product_id: integer('product_id')
    .references(() => ProductTable.id, { onDelete: 'cascade' })
    .notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
});

// Plan features - ADD CASCADE BEHAVIOR
export const PlanFeature = pgTable("plan_feature", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  pricing_plan_id: integer('pricing_plan_id')
    .references(() => PricingPlan.id, { onDelete: 'cascade' })
    .notNull(),
  feature_text: text('feature_text').notNull()
});

// Billing options - ADD CASCADE BEHAVIOR
export const BillingOption = pgTable("billing_option", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  pricing_plan_id: integer('pricing_plan_id')
    .references(() => PricingPlan.id, { onDelete: 'cascade' })
    .notNull(),
  billing_key: varchar('billing_key', { length: 100 }).notNull(),
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 10 }).notNull(),
  interval: varchar('interval', { length: 50 }).notNull(),
  interval_count: integer('interval_count').notNull(),
  display_price: varchar('display_price', { length: 100 }).notNull(),
  savings: integer('savings'),
  savings_percentage: integer('savings_percentage'),
  offer_price: varchar('offer_price', { length: 100 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
});

// Pricing metadata - ADD CASCADE BEHAVIOR
export const PricingMetadata = pgTable("pricing_metadata", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  product_id: integer('product_id')
    .references(() => ProductTable.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  default_currency: varchar('default_currency', { length: 10 }).notNull().default('USD'),
  tax_included: boolean('tax_included').default(false).notNull(),
  
  // Free trial
  free_trial_enabled: boolean('free_trial_enabled').default(false).notNull(),
  free_trial_days: integer('free_trial_days'),
  
  // Refund policy
  refund_enabled: boolean('refund_enabled').default(false).notNull(),
  refund_days: integer('refund_days'),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
});
