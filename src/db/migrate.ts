import { 
  integer, 
  pgTable, 
  varchar, 
  text, 
  serial, 
} from "drizzle-orm/pg-core";

// Main products table
export const ProductsTable = pgTable('products_table', {
  id: serial('id').primaryKey(),
  titlehead: varchar('titlehead', { length: 255 }),
  titleText: text('title_text')
});

// Individual products
export const ProductTable = pgTable('product', {
  id: serial('id').primaryKey(),
  productID: varchar('product_id', { length: 100 }).unique(),
  title: varchar('title', { length: 255 }).notNull(),
  desc: text('desc'),
  img: varchar('img', { length: 500 }),
  icon: varchar('icon', { length: 500 }),
  logo: varchar('logo', { length: 500 }),
  productsTableId: integer('products_table_id').references(() => ProductsTable.id)
});

// Feature details for each product
export const FeatureDetailTable = pgTable('feature_detail', {
  id: serial('id').primaryKey(),
  featureTitle: varchar('feature_title', { length: 255 }).notNull(),
  featureDesc: text('feature_desc'),
  productId: integer('product_id').references(() => ProductTable.id)
});

// Feature cards under each feature detail
export const FeatureCardTable = pgTable('feature_card', {
  id: serial('id').primaryKey(),
  img: varchar('img', { length: 500 }),
  title: varchar('title', { length: 255 }).notNull(),
  desc: text('desc'),
  link: varchar('link', { length: 500 }),
  moreTitle: varchar('more_title', { length: 255 }),
  moreDesc: text('more_desc'),
  featureDetailId: integer('feature_detail_id').references(() => FeatureDetailTable.id)
});

// Images for products
export const ImageTable = pgTable('image', {
  id: serial('id').primaryKey(),
  url: varchar('url', { length: 1000 }).notNull(),
  title: varchar('title', { length: 255 }),
  description: text('description'),
  productId: integer('product_id').references(() => ProductTable.id)
});

// Tutorial links for products
export const TutorialLinkTable = pgTable('tutorial_link', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  url: varchar('url', { length: 1000 }).notNull(),
  icon: varchar('icon', { length: 500 }),
  color: varchar('color', { length: 100 }),
  productId: integer('product_id').references(() => ProductTable.id)
});

// Download card for products
export const DownloadCardTable = pgTable('download_card', {
  id: serial('id').primaryKey(),
  downloadLink: varchar('download_link', { length: 1000 }),
  title: varchar('title', { length: 255 }),
  desc: text('desc'),
  productId: integer('product_id').references(() => ProductTable.id)
});

// License information for download cards
export const LicenceInfoTable = pgTable('licence_info', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }),
  desc: text('desc'),
  whatsapp: varchar('whatsapp', { length: 500 }),
  instagram: varchar('instagram', { length: 500 }),
  telegram: varchar('telegram', { length: 500 }),
  downloadCardId: integer('download_card_id').references(() => DownloadCardTable.id)
});
