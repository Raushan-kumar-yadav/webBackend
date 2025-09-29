import { boolean } from "drizzle-orm/gel-core";
import { 
  integer, 
  pgTable, 
  varchar, 
  text, 
  serial 
} from "drizzle-orm/pg-core";

// Main product table
export const ProductTable = pgTable('product_table', {
  id: serial('id').primaryKey(),
  productID: varchar('product_id', { length: 100 }).unique().notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  desc: text('desc'),
  logo: varchar('logo', { length: 500 }),
  banner: varchar('banner', { length: 500 }),
  isPaid:boolean("isPaid")
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
