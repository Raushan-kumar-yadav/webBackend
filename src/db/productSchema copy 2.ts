
import { 
  integer, 
  pgTable, 
  varchar, 
  text, 
  boolean,
  serial,
  timestamp
} from "drizzle-orm/pg-core";

// Main product table
export const ProductTable = pgTable('product_table', {
  id: serial('id').primaryKey(),
  productID: varchar('product_id', { length: 100 }).unique().notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  desc: text('desc'),
  logo: varchar('logo', { length: 500 }),
  banner: varchar('banner', { length: 500 }),
  isPaid: boolean('isPaid').default(false).notNull()
});


// Feature details for each product
export const FeatureDetailTable = pgTable('feature_detail_table', {
  id: serial('id').primaryKey(),
  featureTitle: varchar('feature_title', { length: 255 }).notNull(),
  featureDesc: text('feature_desc'),
  productId: integer('product_id').references(() => ProductTable.id).notNull()
});

// Feature cards under each feature detail
export const FeatureCardTable = pgTable('feature_card_table', {
  id: serial('id').primaryKey(),
  img: varchar('img', { length: 500 }),
  title: varchar('title', { length: 255 }).notNull(),
  desc: text('desc'),
  link: varchar('link', { length: 500 }),
  moreTitle: varchar('more_title', { length: 255 }),
  moreDesc: text('more_desc'),
  featureDetailId: integer('feature_detail_id').references(() => FeatureDetailTable.id).notNull()
});

// Images for products
export const ImageTable = pgTable('image_table', {
  id: serial('id').primaryKey(),
  url: varchar('url', { length: 1000 }).notNull(),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  productId: integer('product_id').references(() => ProductTable.id).notNull()
});

// Tutorial links for products
export const TutorialLinkTable = pgTable('tutorial_link_table', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 1000 }).notNull(),
  icon: varchar('icon', { length: 500 }),
  color: varchar('color', { length: 100 }),
  productId: integer('product_id').references(() => ProductTable.id).notNull()
});

// Download card for products
export const DownloadCardTable = pgTable('download_card_table', {
  id: serial('id').primaryKey(),
  downloadLink: varchar('download_link', { length: 1000 }),
  title: varchar('title', { length: 255 }),
  desc: text('desc'),
  productId: integer('product_id').references(() => ProductTable.id).notNull()
});

// License information for download cards
export const LicenceInfoTable = pgTable('licence_info_table', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }),
  desc: text('desc'),
  whatsapp: varchar('whatsapp', { length: 500 }),
  instagram: varchar('instagram', { length: 500 }),
  telegram: varchar('telegram', { length: 500 }),
  downloadCardId: integer('download_card_id').references(() => DownloadCardTable.id).notNull()
});

export const PricingPlan = pgTable("pricing_plan", {
  id: serial('id').primaryKey(),
  plan_key: varchar('plan_key', { length: 100 }).notNull().unique(), // e.g. 'basic','pro','max'
  name: varchar('name', { length: 100 }).notNull(),
  display_name: varchar('display_name', { length: 150 }).notNull(),
  description: text('description'),
  popular: boolean('popular').default(false).notNull(),
  product_id: integer('product_id').references(() => ProductTable.id).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
});

// Features for each plan (one row per feature string)
export const PlanFeature = pgTable("plan_feature", {
  id: serial('id').primaryKey(),
  pricing_plan_id: integer('pricing_plan_id').references(() => PricingPlan.id).notNull(),
  feature_text: text('feature_text').notNull()
});
 
// Billing options per plan (monthly, quarterly, halfYearly, yearly, etc.)
export const BillingOption = pgTable("billing_option", {
  id: serial('id').primaryKey(),
  pricing_plan_id: integer('pricing_plan_id').references(() => PricingPlan.id).notNull(),
  billing_key: varchar('billing_key', { length: 100 }).notNull(), // e.g. 'monthly','quarterly','halfYearly','yearly'
  amount: integer('amount').notNull(), // recommended: store smallest currency unit (e.g. cents) if you want precision
  currency: varchar('currency', { length: 10 }).notNull(),
  interval: varchar('interval', { length: 50 }).notNull(), // 'month' | 'year' etc.
  interval_count: integer('interval_count').notNull(), // e.g. 1,3,6
  display_price: varchar('display_price', { length: 100 }).notNull(),
  savings: integer('savings'),
  savings_percentage: integer('savings_percentage'),
  offer_price: varchar('offer_price', { length: 100 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
});

// Product-level pricing metadata (currency defaults, trial/refund policy, etc.)
export const PricingMetadata = pgTable("pricing_metadata", {
  id: serial('id').primaryKey(),
  product_id: integer('product_id').references(() => ProductTable.id).notNull().unique(),
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



