import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url").notNull(),
  featured: boolean("featured").default(false),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  specifications: text("specifications"), // Optional field for legacy compatibility
  categorySlug: text("category_slug").notNull(),
  brand: text("brand"),
  imageUrl: text("image_url").notNull(), // Primary image (required)
  imageUrls: text("image_urls").array(), // Additional images (optional)
  specificationList: text("specification_list").array(), // Array for table specs
  accessories: text("accessories").array(), // Accessory IDs that go with this product
  inStock: boolean("in_stock").default(true),
  featured: boolean("featured").default(false),
});

// Separate accessories table for dedicated accessory products
export const accessories = pgTable("accessories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  modelNumber: text("model_number"),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(), // Primary image (required)
  imageUrls: text("image_urls").array(), // Additional images (optional)
  brand: text("brand"),
  compatibleWith: text("compatible_with").array(), // Product categories or types
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  submittedAt: text("submitted_at").default(sql`CURRENT_TIMESTAMP`),
});

export const adminUsers = pgTable("admin_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  isActive: boolean("is_active").default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const brands = pgTable("brands", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  description: text("description"),
  website: text("website"),
  isActive: boolean("is_active").default(true),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// For local storage favorites (client-side only)
export const favoriteSchema = z.object({
  productId: z.string(),
  addedAt: z.string(),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  specifications: true, // Exclude the legacy specifications field from validation
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  submittedAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
});

export const insertAccessorySchema = createInsertSchema(accessories).omit({
  id: true,
  createdAt: true,
});

export const insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
  createdAt: true,
});

export const adminLoginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Types
export type Accessory = typeof accessories.$inferSelect;
export type InsertAccessory = typeof insertAccessorySchema._type;

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type Brand = typeof brands.$inferSelect;

// Hero Images table
export const heroImages = pgTable("hero_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  order: integer("order").default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertHeroImageSchema = createInsertSchema(heroImages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type HeroImage = typeof heroImages.$inferSelect;
export type InsertHeroImage = z.infer<typeof insertHeroImageSchema>;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type AdminLogin = z.infer<typeof adminLoginSchema>;
export type Favorite = z.infer<typeof favoriteSchema>;

// Projects schema
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  category: varchar("category").notNull(), // Commercial, Industrial, Residential, etc.
  location: varchar("location").notNull(),
  primaryMediaUrl: varchar("primary_media_url"), // Main image or video
  additionalMediaUrls: text("additional_media_urls").array().default([]), // Additional images/videos
  completedDate: varchar("completed_date").notNull(),
  clientType: varchar("client_type").notNull(),
  imageUrls: text("image_urls").array().default([]), // Legacy field for backward compatibility
  productsUsed: varchar("products_used").array().default([]), // Product IDs used in project
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
