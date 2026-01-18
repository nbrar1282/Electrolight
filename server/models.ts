// @ts-nocheck
import mongoose, { Schema, Document } from 'mongoose';
import { randomUUID } from 'crypto';
import type { Category, Product, ContactMessage, AdminUser, Accessory } from '@shared/schema';

// Category Schema
const categorySchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  imageUrl: { type: String, required: true },
}, { 
  timestamps: false,
  _id: false 
});

categorySchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Product Schema
const productSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  specifications: { type: String, required: false }, // Separate specifications field
  specificationList: [{ type: String }], // Array for table specifications
  imageUrl: { type: String, required: true }, // Primary image
  imageUrls: [{ type: String }], // Additional images
  categorySlug: { type: String, required: true },
  brand: { type: String },
  inStock: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  accessories: [{ type: String }], // Array of accessory IDs
  similarProducts: [{ type: String }], // Array of similar product IDs
}, { 
  timestamps: false,
  _id: false 
});

productSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Contact Message Schema
const contactMessageSchema = new Schema({
  _id: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  message: { type: String, required: true },
  submittedAt: { type: String, required: true },
}, { 
  timestamps: false,
  _id: false 
});

contactMessageSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Admin User Schema
const adminUserSchema = new Schema({
  _id: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: String, required: true },
}, { 
  timestamps: false,
  _id: false 
});

adminUserSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Accessory Schema
const accessorySchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  modelNumber: { type: String },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  brand: { type: String },
  compatibleWith: [{ type: String }], // Product categories or types
  createdAt: { type: String, required: false, default: () => new Date().toISOString() },
}, { 
  timestamps: false,
  _id: false 
});

accessorySchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Project Schema  
const projectSchema = new Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  primaryMediaUrl: { type: String }, // Main image or video
  additionalMediaUrls: [{ type: String }], // Additional images/videos
  completedDate: { type: String, required: true },
  clientType: { type: String, required: true },
  imageUrls: [{ type: String }], // Legacy field for backward compatibility
  productsUsed: [{ type: String }],
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { 
  timestamps: false,
  _id: false 
});

projectSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Brand Schema
const brandSchema = new Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true, unique: true },
  description: { type: String },
  website: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: String, required: true },
}, { 
  timestamps: false,
  _id: false 
});

brandSchema.set('toJSON', {
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

// Export Models
export const CategoryModel = mongoose.model<Category & Document>('Category', categorySchema);
export const ProductModel = mongoose.model<Product & Document>('Product', productSchema);
export const ContactMessageModel = mongoose.model<ContactMessage & Document>('ContactMessage', contactMessageSchema);
export const AdminUserModel = mongoose.model<AdminUser & Document>('AdminUser', adminUserSchema);
export const AccessoryModel = mongoose.model('Accessory', accessorySchema);
export const ProjectModel = mongoose.model('Project', projectSchema);
export const BrandModel = mongoose.model('Brand', brandSchema);

// Hero Images Schema
const heroImageSchema = new mongoose.Schema({
  _id: { type: String, default: () => randomUUID() },
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() },
});

heroImageSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const HeroImageModel = mongoose.model('HeroImage', heroImageSchema);