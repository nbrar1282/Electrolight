import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { CategoryModel, ProductModel, ContactMessageModel, AdminUserModel, AccessoryModel, ProjectModel, BrandModel, HeroImageModel } from "./models";
import { sampleProducts, sampleAccessories, sampleProjects } from "./sampleData";
import type { 
  Category, 
  Product, 
  ContactMessage, 
  AdminUser, 
  Accessory,
  Project,
  Brand,
  InsertCategory, 
  InsertProduct, 
  InsertContactMessage, 
  InsertAdminUser,
  InsertAccessory,
  InsertProject,
  InsertBrand,
  HeroImage,
  InsertHeroImage
} from "@shared/schema";
import type { IStorage } from "./storage";

export class MongoStorage implements IStorage {
  constructor() {
    this.seedBasicData(); // Only seed admin and categories
  }

  private async seedBasicData() {
    try {
      // Check if admin user already exists
      const existingAdmin = await AdminUserModel.findOne({ username: "admin" });
      if (!existingAdmin) {
        // Seed admin user (owner access)
        const hashedPassword = await bcrypt.hash("admin123", 10);
        const adminUser = new AdminUserModel({
          _id: randomUUID(),
          username: "admin",
          password: hashedPassword,
          email: "admin@electrolight.com",
          isActive: true,
          createdAt: new Date().toISOString(),
        });
        await adminUser.save();
        console.log("✅ Admin user seeded");
      }

      // Only seed categories if none exist
      const existingCategories = await CategoryModel.countDocuments();
      if (existingCategories === 0) {
        // Seed categories
      const categoriesData: InsertCategory[] = [
          { name: "Bamboo", slug: "bamboo", imageUrl: "/assets/generated_images/Electrical_conduit_system_5cd4a390.png" },
          { name: "Baseboard Heaters", slug: "baseboard", imageUrl: "/assets/generated_images/Electric_baseboard_heater_ecae6e6c.png" },
          { name: "Construction", slug: "construction", imageUrl: "/assets/generated_images/Construction_electrical_tools_a5330c95.png" },
          { name: "Driver", slug: "driver", imageUrl: "/assets/generated_images/Electrical_motor_driver_e5e72683.png" },
          { name: "Extension Rings", slug: "extension-rings", imageUrl: "/assets/generated_images/Electrical_extension_rings_db1d0bae.png" },
          { name: "Gangable Boxes", slug: "gangable-boxes", imageUrl: "/assets/generated_images/Gangable_electrical_boxes_16e94c10.png" },
          { name: "GI Wire", slug: "gi-wire", imageUrl: "/assets/generated_images/Electrical_wire_products_a2ddbf86.png" },
          { name: "Ground Plate", slug: "ground-plate", imageUrl: "/assets/generated_images/Electrical_ground_plate_a2a5a263.png" },
          { name: "Light", slug: "light", imageUrl: "/assets/generated_images/LED_lighting_fixtures_733f3606.png" },
          { name: "Metal Box", slug: "metal-box", imageUrl: "/assets/generated_images/Metal_electrical_box_8aaad2e8.png" },
          { name: "Metal Plates", slug: "metal-plates", imageUrl: "/assets/generated_images/Metal_electrical_plates_276ba39c.png" },
          { name: "Milk Carton", slug: "milk-carton", imageUrl: "/assets/generated_images/Electrical_outlet_plates_c156e9f7.png" },
          { name: "Octagonal Box", slug: "octagonal-box", imageUrl: "/assets/generated_images/Octagonal_electrical_box_69767a40.png" },
          { name: "Plastic Box", slug: "plastic-box", imageUrl: "/assets/generated_images/Plastic_electrical_box_3c998bd5.png" },
          { name: "Pot Light", slug: "pot-light", imageUrl: "/assets/generated_images/Recessed_pot_light_feee68af.png" },
          { name: "Puck Light", slug: "puck-light", imageUrl: "/assets/generated_images/LED_puck_lights_0a5a3eae.png" },
          { name: "PVC Pipe", slug: "pvc-pipe", imageUrl: "/assets/generated_images/PVC_electrical_pipes_c72db40b.png" },
          { name: "Smoke Alarm", slug: "smoke-alarm", imageUrl: "/assets/generated_images/Smoke_alarm_detector_2b0e0ae0.png" },
      ];

      const categories = categoriesData.map(cat => new CategoryModel({
        _id: randomUUID(),
        ...cat
      }));

        await CategoryModel.insertMany(categories);
        console.log("✅ Categories seeded");
      }

      // Remove the "Accessories" category if it exists
      const accessoriesCategory = await CategoryModel.findOne({ slug: "accessories" });
      if (accessoriesCategory) {
        await CategoryModel.deleteOne({ slug: "accessories" });
        console.log("✅ Removed 'Accessories' category");
      }

      // Seed initial brands if none exist
      const brandCount = await BrandModel.countDocuments();
      if (brandCount === 0) {
        const brandsData = [
          { name: "King Electric", description: "Premium electrical heating solutions", website: "https://www.king-electric.com", isActive: true },
          { name: "Schneider Electric", description: "Global leader in energy management", website: "https://www.se.com", isActive: true },
          { name: "Leviton", description: "Electrical wiring devices and lighting controls", website: "https://www.leviton.com", isActive: true },
          { name: "Hubbell", description: "Electrical and electronic products", website: "https://www.hubbell.com", isActive: true },
          { name: "Eaton", description: "Power management solutions", website: "https://www.eaton.com", isActive: true },
          { name: "Legrand", description: "Electrical and digital building infrastructure", website: "https://www.legrand.com", isActive: true },
        ];

        const brands = brandsData.map(brand => new BrandModel({
          _id: randomUUID(),
          ...brand,
          createdAt: new Date().toISOString()
        }));

        await BrandModel.insertMany(brands);
        console.log(`✅ ${brands.length} brands seeded`);
      }

      console.log("✅ Basic seeding completed - Products, accessories and projects will be added via admin interface");
    } catch (error) {
      console.error("❌ Error seeding database:", error);
    }
  }

  // Add method to clear all data
  async clearAllData(): Promise<void> {
    await Promise.all([
      ProductModel.deleteMany({}),
      AccessoryModel.deleteMany({}),
      ProjectModel.deleteMany({})
    ]);
    console.log("✅ All products, accessories, and projects cleared");
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const categories = await CategoryModel.find().lean();
    return categories.map(category => ({
      ...category,
      id: category._id as string
    })) as unknown as Category[];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const category = await CategoryModel.findOne({ slug }).lean();
    if (!category) return undefined;
    return {
      ...category,
      id: category._id as string
    } as unknown as Category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory = new CategoryModel({
      _id: randomUUID(),
      ...category
    });
    const saved = await newCategory.save();
    const categoryData = saved.toJSON();
    return {
      ...categoryData,
      id: categoryData._id
    } as Category;
  }

  async updateCategory(id: string, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const updated = await CategoryModel.findOneAndUpdate(
      { _id: id },
      categoryData,
      { new: true }
    ).lean();
    if (!updated) return undefined;
    return {
      ...updated,
      id: updated._id as string
    } as unknown as Category;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await CategoryModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async clearAllCategories(): Promise<void> {
    await CategoryModel.deleteMany({});
  }

  // Brand methods
  async getBrands(): Promise<Brand[]> {
    const brands = await BrandModel.find({ isActive: true }).sort({ name: 1 }).lean();
    return brands.map(brand => ({
      ...brand,
      id: brand._id as string
    })) as unknown as Brand[];
  }

  async getBrand(id: string): Promise<Brand | undefined> {
    const brand = await BrandModel.findOne({ _id: id }).lean();
    if (!brand) return undefined;
    return {
      ...brand,
      id: brand._id as string
    } as unknown as Brand;
  }

  async createBrand(brandData: InsertBrand): Promise<Brand> {
    const newBrand = new BrandModel({
      _id: randomUUID(),
      ...brandData,
      createdAt: new Date().toISOString(),
    });
    const saved = await newBrand.save();
    const brand = saved.toJSON();
    return {
      ...brand,
      id: brand._id
    } as Brand;
  }

  async updateBrand(id: string, brandData: Partial<InsertBrand>): Promise<Brand | undefined> {
    const updated = await BrandModel.findOneAndUpdate(
      { _id: id },
      brandData,
      { new: true }
    ).lean();
    if (!updated) return undefined;
    return {
      ...updated,
      id: updated._id as string
    } as unknown as Brand;
  }

  async deleteBrand(id: string): Promise<boolean> {
    // Soft delete - just mark as inactive
    const result = await BrandModel.updateOne({ _id: id }, { isActive: false });
    return result.modifiedCount > 0;
  }

  // Products
  async getProducts(categorySlug?: string): Promise<Product[]> {
    const query = categorySlug && categorySlug !== 'undefined' ? { categorySlug } : {};
    const products = await ProductModel.find(query).lean();
    return products.map(product => ({
      ...product,
      id: product._id as string
    })) as unknown as Product[];
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const product = await ProductModel.findOne({ _id: id }).lean();
    if (!product) return undefined;
    return {
      ...product,
      id: product._id as string
    } as unknown as Product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct = new ProductModel({
      _id: randomUUID(),
      ...product
    });
    const saved = await newProduct.save();
    const productData = saved.toJSON();
    return {
      ...productData,
      id: productData._id
    } as Product;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const updated = await ProductModel.findOneAndUpdate(
      { _id: id }, 
      product, 
      { new: true }
    ).lean();
    if (!updated) return undefined;
    return {
      ...updated,
      id: updated._id as string
    } as unknown as Product;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await ProductModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  // Contact Messages
  async getContactMessages(): Promise<ContactMessage[]> {
    const messages = await ContactMessageModel.find()
      .sort({ submittedAt: -1 })
      .lean();
    return messages.map(message => ({
      ...message,
      id: message._id as string
    })) as unknown as ContactMessage[];
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const newMessage = new ContactMessageModel({
      _id: randomUUID(),
      ...message,
      submittedAt: new Date().toISOString()
    });
    const saved = await newMessage.save();
    const messageData = saved.toJSON();
    return {
      ...messageData,
      id: messageData._id
    } as ContactMessage;
  }

  async deleteContactMessage(id: string): Promise<boolean> {
    const result = await ContactMessageModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  // Admin Users
  async createAdminUser(user: InsertAdminUser): Promise<AdminUser> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = new AdminUserModel({
      _id: randomUUID(),
      ...user,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    });
    const saved = await newUser.save();
    const userData = saved.toJSON();
    return {
      ...userData,
      id: userData._id
    } as AdminUser;
  }

  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const user = await AdminUserModel.findOne({ username, isActive: true }).lean();
    if (!user) return undefined;
    return {
      ...user,
      id: user._id as string
    } as unknown as AdminUser;
  }

  async getAllAdmins(): Promise<AdminUser[]> {
    const admins = await AdminUserModel.find({ isActive: true }).sort({ username: 1 }).lean();
    return admins.map(admin => ({
      ...admin,
      id: admin._id as string
    })) as unknown as AdminUser[];
  }

  async validateAdminCredentials(username: string, password: string): Promise<AdminUser | undefined> {
    const user = await AdminUserModel.findOne({ username, isActive: true }).lean();
    if (!user) return undefined;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return undefined;
    
    return {
      ...user,
      id: user._id as string
    } as unknown as AdminUser;
  }

  async verifyAdminPassword(username: string, password: string): Promise<boolean> {
    const user = await AdminUserModel.findOne({ username, isActive: true }).lean();
    if (!user) return false;
    
    return await bcrypt.compare(password, user.password);
  }

  // Accessories
  async getAccessories(): Promise<Accessory[]> {
    const accessories = await AccessoryModel.find().lean();
    return accessories.map(accessory => ({
      ...accessory,
      id: accessory._id as string
    })) as unknown as Accessory[];
  }

  async getAccessory(id: string): Promise<Accessory | undefined> {
    const accessory = await AccessoryModel.findOne({ _id: id }).lean();
    if (!accessory) return undefined;
    return {
      ...accessory,
      id: accessory._id as string
    } as unknown as Accessory;
  }

  async createAccessory(accessory: InsertAccessory): Promise<Accessory> {
    const newAccessory = new AccessoryModel({
      _id: randomUUID(),
      ...accessory,
      createdAt: new Date().toISOString()
    });
    const saved = await newAccessory.save();
    const accessoryData = saved.toJSON();
    return {
      ...accessoryData,
      id: accessoryData._id
    } as Accessory;
  }

  async updateAccessory(id: string, accessory: Partial<InsertAccessory>): Promise<Accessory | undefined> {
    const updated = await AccessoryModel.findOneAndUpdate(
      { _id: id }, 
      accessory, 
      { new: true }
    ).lean();
    if (!updated) return undefined;
    return {
      ...updated,
      id: updated._id as string
    } as unknown as Accessory;
  }

  async deleteAccessory(id: string): Promise<boolean> {
    const result = await AccessoryModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    const projects = await ProjectModel.find()
      .sort({ createdAt: -1 })
      .lean();
    return projects.map(project => ({
      ...project,
      id: project._id as string
    })) as unknown as Project[];
  }

  async getProject(id: string): Promise<Project | undefined> {
    const project = await ProjectModel.findOne({ _id: id }).lean();
    if (!project) return undefined;
    return {
      ...project,
      id: project._id as string
    } as unknown as Project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const newProject = new ProjectModel({
      _id: randomUUID(),
      ...project,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const saved = await newProject.save();
    const projectData = saved.toJSON();
    return {
      ...projectData,
      id: projectData._id
    } as Project;
  }

  async updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined> {
    const updated = await ProjectModel.findOneAndUpdate(
      { _id: id }, 
      { ...project, updatedAt: new Date() }, 
      { new: true }
    ).lean();
    if (!updated) return undefined;
    return {
      ...updated,
      id: updated._id as string
    } as unknown as Project;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await ProjectModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async clearAllData(): Promise<void> {
    // Clear all products, accessories, and projects
    // Keep categories and admin users
    await ProductModel.deleteMany({});
    await AccessoryModel.deleteMany({});
    await ProjectModel.deleteMany({});
    console.log("✅ All data cleared successfully");
  }

  // Hero Images
  async getHeroImages(): Promise<HeroImage[]> {
    const heroImages = await HeroImageModel.find().sort({ order: 1, createdAt: -1 });
    return heroImages.map(heroImage => heroImage.toJSON());
  }

  async getHeroImage(id: string): Promise<HeroImage | undefined> {
    const heroImage = await HeroImageModel.findById(id);
    return heroImage ? heroImage.toJSON() : undefined;
  }

  async createHeroImage(heroImageData: InsertHeroImage): Promise<HeroImage> {
    const heroImage = new HeroImageModel({
      _id: randomUUID(),
      ...heroImageData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await heroImage.save();
    return heroImage.toJSON();
  }

  async updateHeroImage(id: string, heroImageData: Partial<InsertHeroImage>): Promise<HeroImage | undefined> {
    const heroImage = await HeroImageModel.findByIdAndUpdate(
      id,
      { ...heroImageData, updatedAt: new Date().toISOString() },
      { new: true }
    );
    return heroImage ? heroImage.toJSON() : undefined;
  }

  async deleteHeroImage(id: string): Promise<boolean> {
    const result = await HeroImageModel.findByIdAndDelete(id);
    return !!result;
  }

  async populateSampleData(): Promise<void> {
    try {
      // Create products
      const productPromises = sampleProducts.map(productData => {
        const product = new ProductModel({
          _id: randomUUID(),
          ...productData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        return product.save();
      });

      // Create accessories
      const accessoryPromises = sampleAccessories.map(accessoryData => {
        const accessory = new AccessoryModel({
          _id: randomUUID(),
          ...accessoryData,
          createdAt: new Date()
        });
        return accessory.save();
      });

      // Create projects
      const projectPromises = sampleProjects.map(projectData => {
        const project = new ProjectModel({
          _id: randomUUID(),
          ...projectData,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        return project.save();
      });

      // Execute all promises in parallel
      await Promise.all([
        ...productPromises,
        ...accessoryPromises,
        ...projectPromises
      ]);

      console.log("✅ Sample data populated successfully");
      console.log(`- ${sampleProducts.length} products created`);
      console.log(`- ${sampleAccessories.length} accessories created`);
      console.log(`- ${sampleProjects.length} projects created`);
    } catch (error) {
      console.error("Error populating sample data:", error);
      throw error;
    }
  }
}