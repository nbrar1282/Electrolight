import { type Category, type Product, type ContactMessage, type AdminUser, type Brand, type HeroImage, type InsertCategory, type InsertProduct, type InsertContactMessage, type InsertAdminUser, type InsertBrand, type InsertHeroImage } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;
  clearAllCategories(): Promise<void>;
  
  // Brands
  getBrands(): Promise<Brand[]>;
  getBrand(id: string): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  updateBrand(id: string, brand: Partial<InsertBrand>): Promise<Brand | undefined>;
  deleteBrand(id: string): Promise<boolean>;
  
  // Products
  getProducts(categorySlug?: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Contact Messages
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getContactMessages(): Promise<ContactMessage[]>;
  
  // Admin Users
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(admin: InsertAdminUser): Promise<AdminUser>;
  verifyAdminPassword(username: string, password: string): Promise<boolean>;
  getAllAdmins(): Promise<AdminUser[]>;
  
  // Accessories
  getAccessories(): Promise<any[]>;
  getAccessory(id: string): Promise<any>;
  createAccessory(accessory: any): Promise<any>;
  updateAccessory(id: string, accessory: any): Promise<any>;
  deleteAccessory(id: string): Promise<boolean>;
  
  // Projects
  getProjects(): Promise<any[]>;
  getProject(id: string): Promise<any>;
  createProject(project: any): Promise<any>;
  updateProject(id: string, project: any): Promise<any>;
  deleteProject(id: string): Promise<boolean>;
  
  // Hero Images
  getHeroImages(): Promise<HeroImage[]>;
  getHeroImage(id: string): Promise<HeroImage | undefined>;
  createHeroImage(heroImage: InsertHeroImage): Promise<HeroImage>;
  updateHeroImage(id: string, heroImage: Partial<InsertHeroImage>): Promise<HeroImage | undefined>;
  deleteHeroImage(id: string): Promise<boolean>;
  
  // Data management
  clearAllData(): Promise<void>;
  populateSampleData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private categories: Map<string, Category> = new Map();
  private products: Map<string, Product> = new Map();
  private contactMessages: Map<string, ContactMessage> = new Map();
  private adminUsers: Map<string, AdminUser> = new Map();
  private brands: Map<string, Brand> = new Map();
  private heroImages: Map<string, HeroImage> = new Map();

  constructor() {
    this.seedData();
  }

  private async seedData() {
    // Seed admin user (owner access)
    // Seed admin user (dev only, from env)
    if (process.env.NODE_ENV !== "production") {
      const username = process.env.ADMIN_USERNAME || "admin";
      const password = process.env.ADMIN_PASSWORD;
      const email = process.env.ADMIN_EMAIL || "admin@electrolight.com";

      if (!password) {
        console.log("⚠️ ADMIN_PASSWORD not set; skipping MemStorage admin seed");
      } else {
        const hashedPassword = await bcrypt.hash(password, 12);
        const adminUser: AdminUser = {
          id: randomUUID(),
          username,
          password: hashedPassword,
          email,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        this.adminUsers.set(adminUser.username, adminUser);
      }
    }

    // Seed categories
    const categoriesData: InsertCategory[] = [
      { name: "Accessories", slug: "accessories", icon: "fas fa-plug" },
      { name: "Bamboo", slug: "bamboo", icon: "fas fa-seedling" },
      { name: "Baseboard Heater & Accessories", slug: "baseboard", icon: "fas fa-thermometer-half" },
      { name: "Construction", slug: "construction", icon: "fas fa-hard-hat" },
      { name: "Driver", slug: "driver", icon: "fas fa-microchip" },
      { name: "Extension Rings", slug: "extension-rings", icon: "fas fa-circle-notch" },
      { name: "Gangable Boxes", slug: "gangable-boxes", icon: "fas fa-cube" },
      { name: "GI Wire", slug: "gi-wire", icon: "fas fa-project-diagram" },
      { name: "Ground Plate", slug: "ground-plate", icon: "fas fa-square" },
      { name: "Light", slug: "light", icon: "fas fa-lightbulb" },
      { name: "Metal Box", slug: "metal-box", icon: "fas fa-box" },
      { name: "Metal Plates", slug: "metal-plates", icon: "fas fa-square-full" },
      { name: "Milk Carton", slug: "milk-carton", icon: "fas fa-archive" },
      { name: "Octagonal Box", slug: "octagonal-box", icon: "fas fa-stop" },
      { name: "Plastic Box", slug: "plastic-box", icon: "fas fa-cube" },
      { name: "Pot Light", slug: "pot-light", icon: "fas fa-circle" },
      { name: "Puck Light", slug: "puck-light", icon: "fas fa-dot-circle" },
      { name: "PVC Pipe", slug: "pvc-pipe", icon: "fas fa-grip-lines" },
      { name: "Smoke Alarm", slug: "smoke-alarm", icon: "fas fa-exclamation-triangle" },
    ];

    categoriesData.forEach(cat => {
      const category: Category = { ...cat, id: randomUUID() };
      this.categories.set(category.id, category);
    });

    // Seed products
    const productsData: InsertProduct[] = [
      {
        name: "Professional LED Light Fixture",
        description: "High-efficiency LED lighting for commercial applications",
        price: "149.99",
        categoryId: Array.from(this.categories.values()).find(c => c.slug === "light")?.id || "",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        specifications: ["Professional grade construction", "UL Listed for safety compliance", "5-year manufacturer warranty", "Easy installation design"],
        inStock: true,
        featured: true,
      },
      {
        name: "200A Electrical Panel",
        description: "Main electrical distribution panel for residential use",
        price: "299.99",
        categoryId: Array.from(this.categories.values()).find(c => c.slug === "construction")?.id || "",
        imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        specifications: ["200 amp capacity", "Weather resistant", "NEMA certified", "Complete installation kit"],
        inStock: true,
        featured: true,
      },
      {
        name: "Wire Connector Set",
        description: "Professional grade wire nuts and connectors",
        price: "24.99",
        categoryId: Array.from(this.categories.values()).find(c => c.slug === "accessories")?.id || "",
        imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        specifications: ["Multiple sizes included", "Copper conductor compatible", "UL Listed", "100-piece set"],
        inStock: true,
        featured: false,
      },
      {
        name: "4\" Metal Junction Box",
        description: "Heavy-duty steel junction box for commercial use",
        price: "18.99",
        categoryId: Array.from(this.categories.values()).find(c => c.slug === "metal-box")?.id || "",
        imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        specifications: ["Galvanized steel construction", "4-inch diameter", "Weather resistant coating", "Easy mounting design"],
        inStock: true,
        featured: false,
      },
      {
        name: "GFCI Ground Fault Outlet",
        description: "Safety outlet with ground fault circuit interruption",
        price: "34.99",
        categoryId: Array.from(this.categories.values()).find(c => c.slug === "ground-plate")?.id || "",
        imageUrl: "https://images.unsplash.com/photo-1608042314453-ae338d80c427?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        specifications: ["GFCI protection", "Tamper resistant", "15A rated", "White finish"],
        inStock: true,
        featured: true,
      },
      {
        name: "20A Circuit Breaker",
        description: "Single pole circuit breaker for electrical panels",
        price: "12.99",
        categoryId: Array.from(this.categories.values()).find(c => c.slug === "construction")?.id || "",
        imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        specifications: ["20 amp rating", "Single pole design", "Standard fit", "UL Listed"],
        inStock: true,
        featured: false,
      },
      {
        name: "Smart Smoke Detector",
        description: "Advanced smoke detection with mobile alerts",
        price: "89.99",
        categoryId: Array.from(this.categories.values()).find(c => c.slug === "smoke-alarm")?.id || "",
        imageUrl: "https://images.unsplash.com/photo-1558822011-d7c93255e78d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        specifications: ["WiFi connectivity", "Mobile app alerts", "10-year battery", "Voice alerts"],
        inStock: true,
        featured: true,
      },
      {
        name: "Heavy Duty Extension Cord",
        description: "50ft outdoor rated extension cord",
        price: "45.99",
        categoryId: Array.from(this.categories.values()).find(c => c.slug === "accessories")?.id || "",
        imageUrl: "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        specifications: ["50 feet length", "Outdoor rated", "SJTW cable", "Lighted end"],
        inStock: true,
        featured: false,
      },
    ];

    productsData.forEach(prod => {
      const product: Product = { 
        ...prod, 
        id: randomUUID(), 
        specifications: prod.specifications || null,
        inStock: prod.inStock ?? true,
        featured: prod.featured ?? false
      };
      this.products.set(product.id, product);
    });
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: string, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    const updated = { ...category, ...categoryData };
    this.categories.set(id, updated);
    return updated;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Brand methods
  async getBrands(): Promise<Brand[]> {
    return Array.from(this.brands.values()).filter(brand => brand.isActive);
  }

  async getBrand(id: string): Promise<Brand | undefined> {
    return this.brands.get(id);
  }

  async createBrand(brandData: InsertBrand): Promise<Brand> {
    const id = randomUUID();
    const brand: Brand = { 
      ...brandData, 
      id,
      createdAt: new Date().toISOString() 
    };
    this.brands.set(id, brand);
    return brand;
  }

  async updateBrand(id: string, brandData: Partial<InsertBrand>): Promise<Brand | undefined> {
    const brand = this.brands.get(id);
    if (!brand) return undefined;
    const updated = { ...brand, ...brandData };
    this.brands.set(id, updated);
    return updated;
  }

  async deleteBrand(id: string): Promise<boolean> {
    const brand = this.brands.get(id);
    if (!brand) return false;
    // Soft delete - mark as inactive
    const updated = { ...brand, isActive: false };
    this.brands.set(id, updated);
    return true;
  }

  async getProducts(categorySlug?: string): Promise<Product[]> {
    const products = Array.from(this.products.values());
    if (!categorySlug) return products;
    
    const category = await this.getCategoryBySlug(categorySlug);
    if (!category) return [];
    
    return products.filter(product => product.categoryId === category.id);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = { 
      ...product, 
      id,
      specifications: product.specifications || null,
      inStock: product.inStock ?? true,
      featured: product.featured ?? false
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existing = this.products.get(id);
    if (!existing) return undefined;
    
    const updated: Product = { ...existing, ...product };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    const newMessage: ContactMessage = { 
      ...message, 
      id, 
      phone: message.phone || null,
      createdAt: new Date().toISOString() 
    };
    this.contactMessages.set(id, newMessage);
    return newMessage;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }

  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    return this.adminUsers.get(username);
  }

  async createAdminUser(adminData: InsertAdminUser): Promise<AdminUser> {
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const id = randomUUID();
    const admin: AdminUser = {
      ...adminData,
      id,
      password: hashedPassword,
      isActive: adminData.isActive ?? true,
      createdAt: new Date().toISOString(),
    };
    this.adminUsers.set(admin.username, admin);
    return admin;
  }

  async verifyAdminPassword(username: string, password: string): Promise<boolean> {
    const admin = this.adminUsers.get(username);
    if (!admin || !admin.isActive) {
      return false;
    }
    return await bcrypt.compare(password, admin.password);
  }

  async getAllAdmins(): Promise<AdminUser[]> {
    return Array.from(this.adminUsers.values());
  }

  // Stub implementations for missing methods
  async deleteContactMessage(id: string): Promise<boolean> {
    return this.contactMessages.delete(id);
  }

  async getAccessories(): Promise<any[]> {
    return []; // Stub implementation
  }

  async getAccessory(id: string): Promise<any> {
    return undefined; // Stub implementation
  }

  async createAccessory(accessory: any): Promise<any> {
    const id = randomUUID();
    return { ...accessory, id }; // Stub implementation
  }

  async updateAccessory(id: string, accessory: any): Promise<any> {
    return undefined; // Stub implementation
  }

  async deleteAccessory(id: string): Promise<boolean> {
    return false; // Stub implementation
  }

  async getProjects(): Promise<any[]> {
    return []; // Stub implementation
  }

  async getProject(id: string): Promise<any> {
    return undefined; // Stub implementation
  }

  async createProject(project: any): Promise<any> {
    const id = randomUUID();
    return { ...project, id }; // Stub implementation
  }

  async updateProject(id: string, project: any): Promise<any> {
    return undefined; // Stub implementation
  }

  async deleteProject(id: string): Promise<boolean> {
    return false; // Stub implementation
  }

  async clearAllData(): Promise<void> {
    this.products.clear();
    this.contactMessages.clear();
    // Don't clear categories, admin users, or brands in development
  }

  // Hero Images
  async getHeroImages(): Promise<HeroImage[]> {
    return Array.from(this.heroImages.values()).sort((a, b) => a.order - b.order);
  }

  async getHeroImage(id: string): Promise<HeroImage | undefined> {
    return this.heroImages.get(id);
  }

  async createHeroImage(heroImageData: InsertHeroImage): Promise<HeroImage> {
    const id = randomUUID();
    const heroImage: HeroImage = {
      id,
      ...heroImageData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.heroImages.set(id, heroImage);
    return heroImage;
  }

  async updateHeroImage(id: string, heroImageData: Partial<InsertHeroImage>): Promise<HeroImage | undefined> {
    const existingHeroImage = this.heroImages.get(id);
    if (!existingHeroImage) {
      return undefined;
    }

    const updatedHeroImage: HeroImage = {
      ...existingHeroImage,
      ...heroImageData,
      updatedAt: new Date().toISOString(),
    };
    this.heroImages.set(id, updatedHeroImage);
    return updatedHeroImage;
  }

  async deleteHeroImage(id: string): Promise<boolean> {
    return this.heroImages.delete(id);
  }

  async populateSampleData(): Promise<void> {
    // Stub implementation - would add sample data
  }
}

export const storage = new MemStorage();
