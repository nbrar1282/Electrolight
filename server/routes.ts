import type { Express } from "express";
import { createServer, type Server } from "http";
import { MongoStorage } from "./mongoStorage";
import { insertProductSchema, insertContactMessageSchema, insertAccessorySchema, adminLoginSchema, insertProjectSchema, insertBrandSchema, insertCategorySchema } from "@shared/schema";
import { uploadToCloudinary, uploadMediaToCloudinary } from "./cloudinary";
import session from "express-session";
import multer from "multer";
import MemoryStore from "memorystore";
import { SiteSettingsModel } from "./models";

const storage = new MongoStorage();

// Middleware to check if user is authenticated as admin
const requireAdminAuth = (req: any, res: any, next: any) => {
  if (!req.session.adminId) {
    return res.status(401).json({ message: "Unauthorized - Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session configuration with MemoryStore
  app.get("/api/site-settings", async (req, res) => {
    try {
      // Find or create default settings
      let settings = await SiteSettingsModel.findOne({ _id: "default_settings" });
      if (!settings) {
        settings = new SiteSettingsModel({ _id: "default_settings" });
        await settings.save();
      }
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // UPDATE Settings (Admin only)
  app.post("/api/site-settings", async (req, res) => {
    // Note: Add auth middleware check here if strictly enforcing
    try {
      const settings = await SiteSettingsModel.findOneAndUpdate(
        { _id: "default_settings" },
        { ...req.body, updatedAt: new Date().toISOString() },
        { new: true, upsert: true }
      );
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to update settings" });
    }
  });
  const MemStore = MemoryStore(session);
  app.use(session({
    secret: 'electrolight-admin-secret-key-2024',
    store: new MemStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Upload for regular images (products, etc.)
  const uploadImages = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });

  // Upload for primary media (supports both images and videos)
  const uploadPrimaryMedia = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit for videos
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image and video files are allowed'));
      }
    }
  });

  // Upload for additional media (supports both images and videos, smaller limit)
  const uploadAdditionalMedia = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for additional media
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image and video files are allowed'));
      }
    }
  });

  // Admin Authentication Routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      console.log('Login attempt - Request body:', req.body);
      const { username, password } = adminLoginSchema.parse(req.body);
      console.log('Login attempt - Parsed:', { username, password: password ? '[HIDDEN]' : 'undefined' });
      
      const isValid = await storage.verifyAdminPassword(username, password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const admin = await storage.getAdminByUsername(username);
      if (!admin) {
        return res.status(401).json({ message: "Admin not found" });
      }

      req.session.adminId = admin.id;
      req.session.adminUsername = admin.username;
      console.log('Login - Session ID:', req.sessionID);
      
      // Ensure session is saved before responding
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.status(500).json({ message: "Session error" });
        }
        console.log('Session saved successfully');
        res.json({ 
          message: "Login successful", 
          admin: { id: admin.id, username: admin.username, email: admin.email }
        });
      });
    } catch (error: any) {
      console.error('Login validation error:', error);
      res.status(400).json({ message: "Invalid login data", error: error.message });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logout successful" });
    });
  });

  // Debug endpoint to check admin users in database
  app.get("/api/admin/users", async (req, res) => {
    try {
      // Remove this endpoint as getAllAdmins is not implemented
      res.json({ message: "Admin users endpoint not available" });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin users" });
    }
  });

  app.get("/api/admin/check", (req, res) => {
    console.log('Admin check - Session ID:', req.sessionID);
    console.log('Admin check - Session data:', req.session);
    console.log('Admin check - AdminId:', req.session.adminId);
    
    if (req.session.adminId) {
      res.json({ 
        authenticated: true, 
        admin: { 
          id: req.session.adminId, 
          username: req.session.adminUsername 
        }
      });
    } else {
      res.json({ authenticated: false });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Temporary endpoint to clear all categories for reseeding
  app.post("/api/categories/clear", async (req, res) => {
    try {
      await storage.clearAllCategories();
      res.json({ message: "Categories cleared successfully" });
    } catch (error) {
      console.error("Error clearing categories:", error);
      res.status(500).json({ message: "Failed to clear categories" });
    }
  });

  // Products
  app.get("/api/products", async (req, res) => {
    try {
      const { category } = req.query;
      const products = await storage.getProducts(category as string);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (product) {
        return res.json(product);
      }
      
      // If not found as product, try as accessory
      const accessory = await storage.getAccessory(req.params.id);
      if (accessory) {
        // Convert accessory to product format for detail page
        const productLikeAccessory = {
          id: accessory.id,
          name: accessory.name,
          description: accessory.description,
          brand: accessory.brand,
          imageUrl: accessory.imageUrl,
          imageUrls: [],
          categorySlug: 'accessories',
          specifications: accessory.modelNumber ? [`Model: ${accessory.modelNumber}`] : [],
          accessories: [],
          similarProducts: [],
          inStock: true,
          featured: false,
        };
        return res.json(productLikeAccessory);
      }
      
      res.status(404).json({ message: "Product not found" });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Image upload endpoint (for products and general images)
  app.post("/api/upload", requireAdminAuth, uploadImages.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      const fileName = `${Date.now()}-${req.file.originalname}`;
      const imageUrl = await uploadToCloudinary(req.file.buffer, fileName);
      
      res.json({ imageUrl });
    } catch (error: any) {
      console.error('Image upload error:', error);
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: "File too large. Maximum size is 5MB." });
      }
      if (error.message && error.message.includes('Only image files')) {
        return res.status(400).json({ message: "Only image files are allowed." });
      }
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Primary media upload endpoint (supports images and videos up to 100MB)
  app.post("/api/upload/primary-media", requireAdminAuth, uploadPrimaryMedia.single('media'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No media file provided" });
      }

      const fileName = `primary-${Date.now()}-${req.file.originalname}`;
      const mediaUrl = await uploadMediaToCloudinary(req.file.buffer, fileName, req.file.mimetype);
      
      res.json({ mediaUrl });
    } catch (error: any) {
      console.error('Primary media upload error:', error);
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: "File too large. Maximum size is 100MB for videos, 10MB for images." });
      }
      if (error.message && error.message.includes('Only image and video files')) {
        return res.status(400).json({ message: "Only image and video files are allowed." });
      }
      res.status(500).json({ message: "Failed to upload media" });
    }
  });

  // Additional media upload endpoint (supports images and videos up to 50MB)
  app.post("/api/upload/additional-media", requireAdminAuth, uploadAdditionalMedia.single('media'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No media file provided" });
      }

      const fileName = `additional-${Date.now()}-${req.file.originalname}`;
      const mediaUrl = await uploadMediaToCloudinary(req.file.buffer, fileName, req.file.mimetype);
      
      res.json({ mediaUrl });
    } catch (error: any) {
      console.error('Additional media upload error:', error);
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: "File too large. Maximum size is 50MB." });
      }
      if (error.message && error.message.includes('Only image and video files')) {
        return res.status(400).json({ message: "Only image and video files are allowed." });
      }
      res.status(500).json({ message: "Failed to upload media" });
    }
  });

  app.post("/api/products", requireAdminAuth, async (req, res) => {
    try {
      console.log('Product data received:', req.body);
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error: any) {
      console.error('Product creation error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid product data: " + error.message });
      }
      if (error.name === 'ValidationError') {
        const errorMessages = Object.values(error.errors).map((err: any) => err.message).join(', ');
        return res.status(400).json({ message: "Validation failed: " + errorMessages });
      }
      res.status(500).json({ message: "Failed to create product: " + (error.message || "Unknown error") });
    }
  });

  app.put("/api/products/:id", requireAdminAuth, async (req, res) => {
    try {
      const productId = req.params.id;
      if (!productId || productId === 'undefined') {
        return res.status(400).json({ message: "Invalid product ID provided" });
      }
      
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(productId, productData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      console.error('Product update error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid product data: " + error.message });
      }
      if (error.name === 'ValidationError') {
        const errorMessages = Object.values(error.errors).map((err: any) => err.message).join(', ');
        return res.status(400).json({ message: "Validation failed: " + errorMessages });
      }
      res.status(500).json({ message: "Failed to update product: " + (error.message || "Unknown error") });
    }
  });

  app.delete("/api/products/:id", requireAdminAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Accessories routes
  app.get("/api/accessories", async (req, res) => {
    try {
      const accessories = await storage.getAccessories();
      res.json(accessories);
    } catch (error) {
      console.error("Error fetching accessories:", error);
      res.status(500).json({ message: "Failed to fetch accessories" });
    }
  });

  app.get("/api/accessories/:id", async (req, res) => {
    try {
      const accessory = await storage.getAccessory(req.params.id);
      if (!accessory) {
        return res.status(404).json({ message: "Accessory not found" });
      }
      res.json(accessory);
    } catch (error) {
      console.error("Error fetching accessory:", error);
      res.status(500).json({ message: "Failed to fetch accessory" });
    }
  });

  app.post("/api/accessories", requireAdminAuth, async (req, res) => {
    try {
      console.log('Accessory data received:', req.body);
      const accessoryData = insertAccessorySchema.parse(req.body);
      const accessory = await storage.createAccessory(accessoryData);
      res.status(201).json(accessory);
    } catch (error: any) {
      console.error('Accessory creation error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid accessory data: " + error.message });
      }
      if (error.name === 'ValidationError') {
        const errorMessages = Object.values(error.errors).map((err: any) => err.message).join(', ');
        return res.status(400).json({ message: "Validation failed: " + errorMessages });
      }
      res.status(500).json({ message: "Failed to create accessory: " + (error.message || "Unknown error") });
    }
  });

  app.put("/api/accessories/:id", requireAdminAuth, async (req, res) => {
    try {
      const accessoryId = req.params.id;
      if (!accessoryId || accessoryId === 'undefined') {
        return res.status(400).json({ message: "Invalid accessory ID provided" });
      }
      
      const accessoryData = insertAccessorySchema.partial().parse(req.body);
      const accessory = await storage.updateAccessory(accessoryId, accessoryData);
      if (!accessory) {
        return res.status(404).json({ message: "Accessory not found" });
      }
      res.json(accessory);
    } catch (error: any) {
      console.error('Accessory update error:', error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid accessory data: " + error.message });
      }
      if (error.name === 'ValidationError') {
        const errorMessages = Object.values(error.errors).map((err: any) => err.message).join(', ');
        return res.status(400).json({ message: "Validation failed: " + errorMessages });
      }
      res.status(500).json({ message: "Failed to update accessory: " + (error.message || "Unknown error") });
    }
  });

  app.delete("/api/accessories/:id", requireAdminAuth, async (req, res) => {
    try {
      const deleted = await storage.deleteAccessory(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Accessory not found" });
      }
      res.json({ message: "Accessory deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete accessory" });
    }
  });

  // AI-powered similar products endpoint
  app.get("/api/products/:id/similar", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // AI logic for similar products based on category, brand, and specifications
      const allProducts = await storage.getProducts();
      const similarProducts = allProducts
        .filter(p => p.id !== product.id) // Exclude the current product
        .map(p => ({
          ...p,
          similarity: calculateSimilarityScore(product, p)
        }))
        .filter(p => p.similarity > 0.3) // Minimum similarity threshold
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3) // Return top 3 similar products
        .map(({ similarity, ...product }) => product); // Remove similarity score from response

      res.json(similarProducts);
    } catch (error) {
      console.error("Error fetching similar products:", error);
      res.status(500).json({ message: "Failed to fetch similar products" });
    }
  });

  // Combined search endpoint for products and accessories
  app.get("/api/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.json({ products: [], accessories: [] });
      }

      const searchTerm = q.toLowerCase().trim();
      
      // Search products
      const allProducts = await storage.getProducts();
      const matchingProducts = allProducts
        .filter(product => 
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          (product.brand && product.brand.toLowerCase().includes(searchTerm))
        )
        .slice(0, 3); // Limit to 3 products

      // Search accessories
      const allAccessories = await storage.getAccessories();
      const matchingAccessories = allAccessories
        .filter(accessory => 
          accessory.name.toLowerCase().includes(searchTerm) ||
          accessory.description.toLowerCase().includes(searchTerm) ||
          (accessory.brand && accessory.brand.toLowerCase().includes(searchTerm)) ||
          (accessory.modelNumber && accessory.modelNumber.toLowerCase().includes(searchTerm))
        )
        .slice(0, 2); // Limit to 2 accessories

      res.json({
        products: matchingProducts,
        accessories: matchingAccessories
      });
    } catch (error) {
      console.error("Error in search:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Contact messages
  app.post("/api/contact", async (req, res) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid contact message data" });
    }
  });

  app.get("/api/contact-messages", requireAdminAuth, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  // Project routes
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Admin project management routes
  app.post("/api/admin/projects", requireAdminAuth, async (req, res) => {
    try {
      // Map category to clientType for backward compatibility
      const projectData = {
        ...req.body,
        clientType: req.body.category || req.body.clientType,
      };
      
      const validatedData = insertProjectSchema.parse(projectData);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error: any) {
      console.error("Error creating project:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid project data: " + error.message });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/admin/projects/:id", requireAdminAuth, async (req, res) => {
    try {
      // Map category to clientType for backward compatibility
      const projectData = {
        ...req.body,
        clientType: req.body.category || req.body.clientType,
      };
      
      const validatedData = insertProjectSchema.partial().parse(projectData);
      const project = await storage.updateProject(req.params.id, validatedData);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error: any) {
      console.error("Error updating project:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid project data: " + error.message });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete("/api/admin/projects/:id", requireAdminAuth, async (req, res) => {
    try {
      const success = await storage.deleteProject(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Data management endpoints for admin
  app.post("/api/admin/clear-all-data", requireAdminAuth, async (req, res) => {
    try {
      await storage.clearAllData();
      res.json({ message: "All data cleared successfully" });
    } catch (error) {
      console.error("Error clearing data:", error);
      res.status(500).json({ message: "Failed to clear data" });
    }
  });

  // Bulk populate with sample data
  app.post("/api/admin/populate-sample-data", requireAdminAuth, async (req, res) => {
    try {
      await storage.populateSampleData();
      res.json({ message: "Sample data populated successfully" });
    } catch (error) {
      console.error("Error populating sample data:", error);
      res.status(500).json({ message: "Failed to populate sample data" });
    }
  });

  // Test endpoint to verify sample data structure (no auth required)
  app.get("/api/test-sample-data", async (req, res) => {
    try {
      const { sampleProducts } = await import("./sampleData");
      res.json({
        message: "Sample data structure is valid",
        productCount: sampleProducts.length,
        firstProduct: sampleProducts[0]
      });
    } catch (error) {
      console.error("Error testing sample data:", error);
      res.status(500).json({ message: "Sample data structure error", error: (error as Error).message });
    }
  });

  // Brand management routes
  app.get("/api/brands", async (req, res) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ message: "Failed to fetch brands" });
    }
  });

  app.post("/api/brands", requireAdminAuth, async (req, res) => {
    try {
      const brandData = insertBrandSchema.parse(req.body);
      const brand = await storage.createBrand(brandData);
      res.status(201).json(brand);
    } catch (error: any) {
      console.error("Error creating brand:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid brand data: " + error.message });
      }
      res.status(500).json({ message: "Failed to create brand" });
    }
  });

  app.put("/api/brands/:id", requireAdminAuth, async (req, res) => {
    try {
      const brandData = insertBrandSchema.partial().parse(req.body);
      const brand = await storage.updateBrand(req.params.id, brandData);
      if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
      }
      res.json(brand);
    } catch (error: any) {
      console.error("Error updating brand:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid brand data: " + error.message });
      }
      res.status(500).json({ message: "Failed to update brand" });
    }
  });

  app.delete("/api/brands/:id", requireAdminAuth, async (req, res) => {
    try {
      const success = await storage.deleteBrand(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Brand not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting brand:", error);
      res.status(500).json({ message: "Failed to delete brand" });
    }
  });

  // Category management routes (update existing categories)
  app.put("/api/categories/:id", requireAdminAuth, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(req.params.id, categoryData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error: any) {
      console.error("Error updating category:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid category data: " + error.message });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.post("/api/categories", requireAdminAuth, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error: any) {
      console.error("Error creating category:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid category data: " + error.message });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.delete("/api/categories/:id", requireAdminAuth, async (req, res) => {
    try {
      const success = await storage.deleteCategory(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Hero Images routes
  app.get("/api/hero-images", async (req, res) => {
    try {
      const heroImages = await storage.getHeroImages();
      res.json(heroImages);
    } catch (error) {
      console.error("Error fetching hero images:", error);
      res.status(500).json({ error: "Failed to fetch hero images" });
    }
  });

  app.get("/api/hero-images/:id", async (req, res) => {
    try {
      const heroImage = await storage.getHeroImage(req.params.id);
      if (heroImage) {
        res.json(heroImage);
      } else {
        res.status(404).json({ error: "Hero image not found" });
      }
    } catch (error) {
      console.error("Error fetching hero image:", error);
      res.status(500).json({ error: "Failed to fetch hero image" });
    }
  });

  app.post("/api/hero-images", requireAdminAuth, async (req, res) => {
    try {
      const heroImage = await storage.createHeroImage(req.body);
      res.status(201).json(heroImage);
    } catch (error) {
      console.error("Error creating hero image:", error);
      res.status(500).json({ error: "Failed to create hero image" });
    }
  });

  app.put("/api/hero-images/:id", requireAdminAuth, async (req, res) => {
    try {
      const heroImage = await storage.updateHeroImage(req.params.id, req.body);
      if (heroImage) {
        res.json(heroImage);
      } else {
        res.status(404).json({ error: "Hero image not found" });
      }
    } catch (error) {
      console.error("Error updating hero image:", error);
      res.status(500).json({ error: "Failed to update hero image" });
    }
  });

  app.delete("/api/hero-images/:id", requireAdminAuth, async (req, res) => {
    try {
      const result = await storage.deleteHeroImage(req.params.id);
      if (result) {
        res.json({ message: "Hero image deleted successfully" });
      } else {
        res.status(404).json({ error: "Hero image not found" });
      }
    } catch (error) {
      console.error("Error deleting hero image:", error);
      res.status(500).json({ error: "Failed to delete hero image" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// AI algorithm to calculate similarity between products
function calculateSimilarityScore(product1: any, product2: any): number {
  let score = 0;
  
  // Category similarity (highest weight - 40%)
  if (product1.categorySlug === product2.categorySlug) {
    score += 0.4;
  }
  
  // Brand similarity (30%)
  if (product1.brand && product2.brand && product1.brand === product2.brand) {
    score += 0.3;
  }
  
  // Specification similarity (20%)
  const specs1 = product1.specifications || [];
  const specs2 = product2.specifications || [];
  
  if (specs1.length > 0 && specs2.length > 0) {
    const commonSpecs = specs1.filter((spec: string) => 
      specs2.some((spec2: string) => 
        spec.toLowerCase().includes(spec2.toLowerCase().split(' ')[0]) ||
        spec2.toLowerCase().includes(spec.toLowerCase().split(' ')[0])
      )
    );
    const specSimilarity = commonSpecs.length / Math.max(specs1.length, specs2.length);
    score += 0.2 * specSimilarity;
  }
  
  // Name similarity (10%) - check for common keywords
  const name1Words = product1.name.toLowerCase().split(' ');
  const name2Words = product2.name.toLowerCase().split(' ');
  const commonWords = name1Words.filter((word: string) => 
    name2Words.includes(word) && word.length > 3 // Only meaningful words
  );
  if (commonWords.length > 0) {
    score += 0.1 * (commonWords.length / Math.max(name1Words.length, name2Words.length));
  }
  
  return Math.min(score, 1); // Cap at 1.0
}
