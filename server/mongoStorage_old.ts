import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { CategoryModel, ProductModel, ContactMessageModel, AdminUserModel, AccessoryModel, ProjectModel } from "./models";
import type { 
  Category, 
  Product, 
  ContactMessage, 
  AdminUser, 
  Accessory,
  Project,
  InsertCategory, 
  InsertProduct, 
  InsertContactMessage, 
  InsertAdminUser,
  InsertAccessory,
  InsertProject 
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
          { name: "Bamboo", slug: "bamboo", icon: "fas fa-seedling" },
          { name: "Baseboard Heaters", slug: "baseboard", icon: "fas fa-thermometer-half" },
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

      // Products will be added manually via admin interface
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
  }

  // Add method to populate sample data
  async populateSampleData(): Promise<void> {
    try {
      // Clear existing data first
      await this.clearAllData();
      
      console.log("✅ Sample data population completed");
    } catch (error) {
      console.error("❌ Error populating sample data:", error);
    }
  }
            description: "This professional-grade LED light fixture represents the pinnacle of modern lighting technology, engineered for both commercial and residential applications where quality, efficiency, and longevity are paramount. The fixture features state-of-the-art LED technology that delivers exceptional illumination while consuming significantly less energy than traditional lighting solutions. Its sleek, contemporary design seamlessly integrates into any architectural style, from modern offices and retail spaces to elegant residential interiors. The fixture is constructed with premium materials and precision engineering, ensuring reliable performance in demanding environments. Whether you're lighting a workspace, retail display, or living area, this fixture provides consistent, high-quality illumination that enhances productivity and ambiance while reducing energy costs and maintenance requirements.",
            specifications: "Advanced LED technology provides 50,000+ hours of reliable lighting with 80% energy savings compared to traditional fixtures. Dimmable functionality and easy installation make it perfect for both commercial and residential applications.",
            imageUrl: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=400&fit=crop",
            imageUrls: [
              "https://images.unsplash.com/photo-1558618047-3c8c76d6d7ac?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=400&fit=crop"
            ],
            categorySlug: "light",
            brand: "Philips",
            inStock: true,
            featured: true, // Featured product
            specificationList: [
              "LED Technology - 50,000+ hour lifespan with high-quality diodes",
              "Energy Efficiency - 80% less power consumption than traditional fixtures", 
              "Dimming Capability - Compatible with most standard dimmer switches",
              "Installation - Easy mounting with standard electrical boxes",
              "Warranty Coverage - 5-year manufacturer warranty for peace of mind",
              "Light Output - 3000K warm white color temperature",
              "Beam Angle - 120-degree wide beam for optimal coverage",
              "Input Voltage - 120-277V AC for versatile installation",
              "Luminous Efficacy - 110 lumens per watt efficiency rating",
              "Color Rendering - CRI 90+ for excellent color accuracy"
            ],
            accessories: [], // Will be populated later
            similarProducts: [] // Will be populated later
          },
          {
            name: "Heavy Duty Extension Ring",
            description: "Durable metal extension ring for increasing box depth. Essential for modern electrical installations.",
            imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=400&fit=crop",
            imageUrls: [
              "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop"
            ],
            categorySlug: "extension-rings",
            brand: "Leviton",
            inStock: true,
            featured: false, // Regular product
            specificationList: [
              "Construction Material - Heavy-duty 16-gauge steel for maximum durability",
              "Coating - Corrosion-resistant powder coating for indoor/outdoor use", 
              "Compatibility - Standard electrical box mounting with universal fit",
              "Installation Grade - Professional-grade hardware and construction",
              "Safety Certification - UL Listed for electrical safety compliance",
              "Depth Extension - Adds 1/2 inch to 1-1/2 inch additional box depth",
              "Mounting - Secure screw-on attachment system",
              "Temperature Rating - -40°F to 200°F operating temperature range",
              "Thread Size - Standard 10-32 mounting screws included",
              "Box Compatibility - Works with 2x4, 3x2, and 4x4 electrical boxes"
            ],
            accessories: [],
            similarProducts: []
          },

          {
            name: "Premium Gangable Box Set",
            description: "Professional-grade gangable boxes for multiple switch installations. Perfect for modern electrical panels.",
            imageUrl: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&h=400&fit=crop",
            imageUrls: [
              "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop"
            ],
            categorySlug: "gangable-boxes",
            brand: "Square D",
            inStock: true,
            featured: false, // Regular product
            specificationList: [
              "Gang Configuration - 2, 3, 4, 5, and 6-gang options available",
              "Construction Material - Heavy-duty 18-gauge galvanized steel",
              "Assembly Method - Easy snap-together design with no tools required",
              "Installation Type - Professional-grade mounting with adjustable tabs",
              "Knockout Options - Pre-punched for 1/2, 3/4, and 1-inch conduit",
              "Depth Capacity - 3-1/2 inch depth for modern electrical devices",
              "Safety Rating - UL Listed and CSA certified for North America",
              "Mounting Hardware - Adjustable plaster ears for various wall thicknesses",
              "Wire Management - Internal cable management clips included"
            ],
            accessories: [],
            similarProducts: []
          },
          {
            name: "Commercial Grade PVC Pipe",
            description: "High-strength PVC conduit for commercial electrical installations. Weather-resistant and durable.",
            imageUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=400&fit=crop",
            imageUrls: [
              "https://images.unsplash.com/photo-1558618047-3c8c76d6d7ac?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&h=400&fit=crop"
            ],
            categorySlug: "pvc-pipe",
            brand: "Cantex",
            inStock: true,
            featured: false, // Regular product
            specificationList: [
              "Schedule 40 PVC construction",
              "UV resistant for outdoor use",
              "Smooth interior for easy wire pulling",
              "Standard electrical conduit sizing",
              "Corrosion and chemical resistant"
            ],
            accessories: [],
            similarProducts: []
          },
          {
            name: "Industrial Wire Management",
            description: "Professional wire management solution for complex electrical systems. Keeps installations organized and safe.",
            imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76d6d7ac?w=400&h=400&fit=crop",
            imageUrls: [
              "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"
            ],
            categorySlug: "gi-wire",
            brand: "Southwire",
            inStock: true,
            featured: true, // Featured product
            specificationList: [
              "Industrial-grade wire management system",
              "Cable tray and conduit organization",
              "Modular expandable design",
              "Corrosion-resistant materials",
              "Professional installation compatible"
            ],
            accessories: [],
            similarProducts: []
          },
          {
            name: "Electric Baseboard Heater 750W",
            description: "Efficient electric baseboard heater perfect for supplemental heating in small to medium rooms. Energy-friendly design with quiet operation.",
            imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
            imageUrls: [
              "https://images.unsplash.com/photo-1558618047-3c8c76d6d7ac?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=400&fit=crop"
            ],
            categorySlug: "baseboard",
            brand: "Cadet",
            inStock: true,
            featured: false, // Regular product
            specifications: [
              "750 watts of heating power",
              "Covers up to 100 square feet",
              "Silent convection operation",
              "Wall-mounted design",
              "Built-in thermostat control",
              "ETL certified for safety"
            ],
            accessories: [],
            similarProducts: []
          },
          {
            name: "Electric Baseboard Heater 1500W",
            description: "High-capacity electric baseboard heater for larger rooms. Features advanced heating elements and built-in safety controls.",
            imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
            imageUrls: [
              "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=400&fit=crop",
              "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=400&h=400&fit=crop"
            ],
            categorySlug: "baseboard",
            brand: "King Electric",
            inStock: true,
            featured: false, // Regular product
            specifications: [
              "1500 watts of heating power",
              "Covers up to 200 square feet",
              "Programmable thermostat",
              "Overheat protection",
              "Easy wall installation",
              "Energy Star certified"
            ],
            accessories: [],
            similarProducts: []
          },
          // Add accessories as searchable products in accessories category
          {
            name: "LED Dimmer Switch",
            description: "Smart LED dimmer switch with app control and voice activation compatibility.",
            specifications: "Compatible with LED, CFL, and halogen bulbs. Works with Alexa, Google Assistant, and mobile apps for remote control. Features smooth dimming control and energy monitoring capabilities.",
            categorySlug: "accessories",
            brand: "Lutron",
            imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76d6d7ac?w=400&h=400&fit=crop",
            imageUrls: ["https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&h=400&fit=crop"],
            inStock: true,
            featured: false,
            specificationList: [
              "Compatible Bulbs: LED, CFL, Halogen up to 600W",
              "Smart Features: App Control, Voice Commands",
              "Installation: Standard Wall Box",
              "Connectivity: WiFi 2.4GHz",
              "Certifications: UL Listed, FCC Approved"
            ],
            accessories: [],
            similarProducts: []
          },
          {
            name: "LED Driver Module",  
            description: "High-efficiency LED driver module for professional lighting installations.",
            specifications: "Constant current LED driver with dimming capability and overload protection for commercial applications. Designed for long-term reliability and optimal LED performance.",
            categorySlug: "accessories",
            brand: "Mean Well",
            imageUrl: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=400&fit=crop",
            imageUrls: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"],
            inStock: true,
            featured: false,
            specificationList: [
              "Input Voltage: 100-277V AC",
              "Output Current: 350mA-1400mA",
              "Power Factor: >0.95",
              "Dimming: 0-10V, PWM Compatible",
              "Protection: Overvoltage, Overcurrent, Short Circuit"
            ],
            accessories: [],
            similarProducts: []
          },
          {
            name: "Motion Sensor Override",
            description: "Professional motion sensor with manual override for commercial and residential lighting control.",  
            specifications: "PIR motion sensor with adjustable sensitivity and time delay settings. Manual override capability for security applications with tamper-resistant design.",
            categorySlug: "accessories",
            brand: "Leviton",
            imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
            imageUrls: ["https://images.unsplash.com/photo-1558618047-3c8c76d6d7ac?w=400&h=400&fit=crop"],
            inStock: true,
            featured: false,
            specificationList: [
              "Detection Range: 180° field of view",
              "Sensitivity: Adjustable 50%-100%",
              "Time Delay: 30 seconds to 30 minutes",  
              "Override: Manual on/off switch",
              "Installation: Standard wall box or ceiling mount"
            ],
            accessories: [],
            similarProducts: []
          }
        ];

        const products = productsData.map(prod => new ProductModel({
          _id: randomUUID(),
          ...prod
        }));

        await ProductModel.insertMany(products);
        console.log("✅ Products seeded");
      }

      // Only reseed accessories once (comment out the deleteMany after first run)
      // await AccessoryModel.deleteMany({});
      // console.log("✅ Cleared existing accessories");
      
      const existingAccessories = await AccessoryModel.countDocuments();
      if (existingAccessories === 0) {
        const accessoriesData: InsertAccessory[] = [
          // LED Light accessories
          {
            name: "LED Dimmer Switch",
            modelNumber: "LED-DIM-120",
            description: "Compatible dimmer switch for LED fixtures with smooth dimming control and memory function for optimal lighting control.",
            imageUrl: "https://res.cloudinary.com/dz5jnvqvg/image/upload/v1735842562/products/dimmer-switch.jpg",
            brand: "Leviton",
            compatibleWith: ["light"],
            specificationList: [
              "Load Capacity - 600W LED, 1000W incandescent maximum",
              "Dimming Range - 1% to 100% smooth control",
              "Memory Function - Recalls last brightness setting",
              "Installation - Standard single-pole wall box",
              "Compatibility - Dimmable LED and CFL bulbs",
              "Operating Temperature - 32°F to 104°F range"
            ],
            createdAt: new Date().toISOString(),
          },
          {
            name: "LED Driver Module",
            modelNumber: "DRV-24V-60W",
            description: "24V 60W constant voltage LED driver for professional lighting installations with overload protection.",
            imageUrl: "https://res.cloudinary.com/dz5jnvqvg/image/upload/v1735842562/products/led-driver.jpg",
            brand: "Phillips",
            compatibleWith: ["light"],
            specificationList: [
              "Input Voltage - 100-277V AC universal input",
              "Output Voltage - 24V DC constant voltage",
              "Power Rating - 60W maximum output capacity",
              "Efficiency - 90% power conversion efficiency",
              "Protection - Short circuit and overvoltage",
              "Operating Temperature - -20°C to 60°C range"
            ],
            createdAt: new Date().toISOString(),
          },
          {
            name: "Motion Sensor Override",
            modelNumber: "MS-OVR-15A",
            description: "Manual override switch for motion sensor lighting systems with adjustable sensitivity control.",
            imageUrl: "https://res.cloudinary.com/dz5jnvqvg/image/upload/v1735842562/products/override-switch.jpg",
            brand: "Cooper",
            compatibleWith: ["light"],
            specificationList: [
              "Detection Range - 180° coverage area",
              "Load Rating - 15A resistive, 500W LED",
              "Time Delay - 30 seconds to 30 minutes",
              "Override - Manual on/off/auto switch",
              "Mounting - Wall or ceiling installation",
              "Sensitivity - 3-level adjustable control"
            ],
            createdAt: new Date().toISOString(),
          },
          // Construction accessories
          {
            name: "Wire Nut Assortment",
            modelNumber: "WN-AST-20",
            description: "20-piece wire nut connector assortment for electrical connections in various wire gauge combinations.",
            imageUrl: "https://res.cloudinary.com/dz5jnvqvg/image/upload/v1735842562/products/wire-nuts.jpg",
            brand: "Ideal",
            compatibleWith: ["construction", "metal-box"],
            specificationList: [
              "Wire Gauge - 12-22 AWG compatibility",
              "Quantity - 20-piece assorted sizes",
              "Material - Flame-retardant nylon shell",
              "Insulation - Copper wire threading design",
              "Temperature - -65°F to 221°F rating",
              "Certifications - UL Listed and CSA approved"
            ],
            createdAt: new Date().toISOString(),
          },
          {
            name: "Junction Box Cover",
            modelNumber: "JB-CVR-4X4",
            description: "Weatherproof cover for 4x4 junction boxes with gasket seal for outdoor protection.",
            imageUrl: "https://res.cloudinary.com/dz5jnvqvg/image/upload/v1735842562/products/junction-cover.jpg",
            brand: "Leviton",
            compatibleWith: ["metal-box", "construction"],
            specificationList: [
              "Box Size - 4x4 inch square junction box",
              "Weather Rating - IP65 weatherproof seal",
              "Material - Die-cast aluminum construction",
              "Gasket - EPDM rubber weather seal",
              "Screws - Stainless steel mounting hardware",
              "Temperature Range - -40°F to 150°F rating"
            ],
            createdAt: new Date().toISOString(),
          },
          {
            name: "Conduit Coupling",
            modelNumber: "EMT-CPL-1/2",
            description: "1/2 inch EMT conduit coupling connector for joining electrical metallic tubing sections.",
            imageUrl: "https://res.cloudinary.com/dz5jnvqvg/image/upload/v1735842562/products/conduit-coupling.jpg",
            brand: "Hubbell",
            compatibleWith: ["construction", "metal-box"],
            specificationList: [
              "Conduit Size - 1/2 inch EMT compatibility",
              "Material - Zinc die-cast construction",
              "Connection - Compression fitting design",
              "Finish - Electroplated zinc coating",
              "Installation - No threading required",
              "Standards - UL Listed and NEMA compliant"
            ],
            createdAt: new Date().toISOString(),
          },
          // Baseboard heater accessories
          {
            name: "Thermostat Control",
            modelNumber: "THERMO-240V",
            description: "Digital thermostat control for baseboard heaters with programmable settings and precise temperature control.",
            imageUrl: "https://res.cloudinary.com/dz5jnvqvg/image/upload/v1735842562/products/thermostat.jpg",
            brand: "Honeywell",
            compatibleWith: ["baseboard"],
            specificationList: [
              "Voltage Rating - 240VAC single-phase",
              "Load Capacity - 4000W maximum heater load",
              "Temperature Range - 45°F to 85°F control",
              "Accuracy - ±1°F temperature precision",
              "Programming - 7-day schedule capability",
              "Display - LCD with backlight illumination"
            ],
            createdAt: new Date().toISOString(),
          },
          {
            name: "Heater End Caps",
            modelNumber: "BB-CAP-SET",
            description: "Protective end caps for baseboard heater units providing safety coverage and finished appearance.",
            imageUrl: "https://res.cloudinary.com/dz5jnvqvg/image/upload/v1735842562/products/end-caps.jpg",
            brand: "Marley",
            compatibleWith: ["baseboard"],
            specificationList: [
              "Material - High-temperature ABS plastic",
              "Color - White finish to match heater",
              "Installation - Snap-on design installation",
              "Safety - Covers sharp metal edges",
              "Temperature Rating - 200°F maximum",
              "Package - Left and right caps included"
            ],
            createdAt: new Date().toISOString(),
          }
        ];

        const accessories = accessoriesData.map(acc => new AccessoryModel({
          _id: randomUUID(),
          ...acc
        }));

        await AccessoryModel.insertMany(accessories);
        console.log("✅ Accessories seeded");

        // Update products with accessories relationships after accessories are created
        const lightAccessoryIds = accessories
          .filter(acc => acc.compatibleWith?.includes("light"))
          .map(acc => acc._id)
          .slice(0, 3); // Take first 3 light accessories

        const constructionAccessoryIds = accessories
          .filter(acc => acc.compatibleWith?.includes("construction"))
          .map(acc => acc._id)
          .slice(0, 2); // Take first 2 construction accessories

        const baseboardAccessoryIds = accessories
          .filter(acc => acc.compatibleWith?.includes("baseboard"))
          .map(acc => acc._id);

        // Update LED fixture with light accessories
        await ProductModel.updateOne(
          { name: "Professional LED Light Fixture" },
          { 
            accessories: lightAccessoryIds,
            similarProducts: products.filter(p => p.categorySlug === "light" && p.name !== "Professional LED Light Fixture").map(p => p._id).slice(0, 2)
          }
        );
        
        // Update Wire Management with construction accessories
        await ProductModel.updateOne(
          { name: "Industrial Wire Management" },
          {
            accessories: constructionAccessoryIds,
            similarProducts: products.filter(p => p.categorySlug === "gi-wire" && p.name !== "Industrial Wire Management").map(p => p._id).slice(0, 2)
          }
        );

        // Update Baseboard Heaters with baseboard accessories
        await ProductModel.updateOne(
          { name: "Electric Baseboard Heater 750W" },
          {
            accessories: baseboardAccessoryIds,
            similarProducts: products.filter(p => p.categorySlug === "baseboard" && p.name !== "Electric Baseboard Heater 750W").map(p => p._id).slice(0, 2)
          }
        );

        await ProductModel.updateOne(
          { name: "Electric Baseboard Heater 1500W" },
          {
            accessories: baseboardAccessoryIds,
            similarProducts: products.filter(p => p.categorySlug === "baseboard" && p.name !== "Electric Baseboard Heater 1500W").map(p => p._id).slice(0, 2)
          }
        );
        
        console.log("✅ Product-accessory relationships updated");
      }

      // Ensure ALL products have accessories (run this every time)
      const allAccessories = await AccessoryModel.find();
      
      // Update LED fixture with light accessories
      const lightAccessories = allAccessories.filter(acc => acc.compatibleWith?.includes("light"));
      if (lightAccessories.length > 0) {
        await ProductModel.updateOne(
          { name: "Professional LED Light Fixture" },
          { accessories: lightAccessories.map(acc => acc._id).slice(0, 3) }
        );
      }

      // Update Wire Management with construction accessories
      const constructionAccessories = allAccessories.filter(acc => acc.compatibleWith?.includes("construction") || acc.compatibleWith?.includes("metal-box"));
      if (constructionAccessories.length > 0) {
        await ProductModel.updateOne(
          { name: "Industrial Wire Management" },
          { accessories: constructionAccessories.map(acc => acc._id).slice(0, 2) }
        );
      }

      // Update Baseboard Heaters with baseboard accessories
      const baseboardAccessories = allAccessories.filter(acc => acc.compatibleWith?.includes("baseboard"));
      if (baseboardAccessories.length > 0) {
        await ProductModel.updateMany(
          { categorySlug: "baseboard" },
          { accessories: baseboardAccessories.map(acc => acc._id) }
        );
      }

      console.log("✅ All products updated with accessories");

      // Seed projects if none exist
      const existingProjects = await ProjectModel.countDocuments();
      if (existingProjects === 0) {
        const projectsData = [
          {
            title: "Downtown Office Complex LED Retrofit",
            description: "Complete LED lighting retrofit for a 50,000 sq ft office complex, including installation of energy-efficient fixtures, motion sensors, and smart controls. The project reduced energy consumption by 65% while improving workspace illumination quality.",
            category: "Commercial",
            location: "Toronto, ON",
            completedDate: "2024-11-15",
            clientType: "Commercial Office",
            imageUrls: [
              "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop",
              "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=450&fit=crop"
            ],
            productsUsed: [],
            featured: true,
          },
          {
            title: "Smart Home Electrical Installation",
            description: "Full electrical system installation for luxury residential home including smart switches, automated lighting controls, EV charging station, and comprehensive home monitoring system.",
            category: "Residential",
            location: "Mississauga, ON",
            completedDate: "2024-10-28",
            clientType: "Residential",
            imageUrls: [
              "https://images.unsplash.com/photo-1558618666-fbd6c327cd37?w=800&h=450&fit=crop",
              "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&h=450&fit=crop"
            ],
            productsUsed: [],
            featured: true,
          },
          {
            title: "Manufacturing Facility Power Distribution",
            description: "Industrial-grade power distribution system installation for automotive manufacturing facility. Project included high-capacity electrical panels, conduit systems, and specialized industrial lighting.",
            category: "Industrial",
            location: "Hamilton, ON",
            completedDate: "2024-09-20",
            clientType: "Manufacturing",
            imageUrls: [
              "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800&h=450&fit=crop"
            ],
            productsUsed: [],
            featured: false,
          },
          {
            title: "Retail Store Lighting Design",
            description: "Custom lighting design and installation for high-end retail boutique featuring track lighting systems, accent lighting, and energy-efficient display illumination.",
            category: "Commercial",
            location: "Yorkville, Toronto",
            completedDate: "2024-08-12",
            clientType: "Retail",
            imageUrls: [
              "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=450&fit=crop"
            ],
            productsUsed: [],
            featured: false,
          }
        ];

        const projects = projectsData.map(project => new ProjectModel({
          _id: randomUUID(),
          ...project
        }));

        await ProjectModel.insertMany(projects);
        console.log("✅ Projects seeded");
      }

      console.log("✅ Database seeding completed");
    } catch (error) {
      console.error("❌ Error seeding database:", error);
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const categories = await CategoryModel.find().lean();
    // Map MongoDB _id to id field for consistency
    return categories.map(category => ({
      ...category,
      id: category._id as string
    })) as unknown as Category[];
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const category = await CategoryModel.findOne({ slug }).lean();
    if (!category) return undefined;
    // Map MongoDB _id to id field for consistency
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
    // Map MongoDB _id to id field for consistency
    return {
      ...categoryData,
      id: categoryData._id
    } as Category;
  }

  // Products
  async getProducts(categorySlug?: string): Promise<Product[]> {
    const query = categorySlug && categorySlug !== 'undefined' ? { categorySlug } : {};
    const products = await ProductModel.find(query).lean();
    // Map MongoDB _id to id field for consistency
    return products.map(product => ({
      ...product,
      id: product._id as string
    })) as unknown as Product[];
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const product = await ProductModel.findOne({ _id: id }).lean();
    if (!product) return undefined;
    // Map MongoDB _id to id field for consistency
    return {
      ...product,
      id: product._id as string
    } as unknown as Product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const newProduct = new ProductModel({
      _id: randomUUID(),
      ...product,
      specifications: product.specifications || "", // Ensure specifications field is not undefined
    });
    const saved = await newProduct.save();
    const productData = saved.toJSON();
    // Map MongoDB _id to id field for consistency
    return {
      ...productData,
      id: productData._id as string
    } as unknown as Product;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const updated = await ProductModel.findOneAndUpdate(
      { _id: id },
      product,
      { new: true }
    ).lean();
    if (!updated) return undefined;
    // Map MongoDB _id to id field for consistency
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
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const newMessage = new ContactMessageModel({
      _id: randomUUID(),
      firstName: message.firstName,
      lastName: message.lastName,
      email: message.email,
      phone: message.phone,
      message: message.message,
      submittedAt: new Date().toISOString()
    });
    const saved = await newMessage.save();
    const messageData = saved.toJSON();
    // Map MongoDB _id to id field for consistency
    return {
      ...messageData,
      id: messageData._id
    } as ContactMessage;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    const messages = await ContactMessageModel.find().sort({ submittedAt: -1 }).lean();
    // Map MongoDB _id to id field for consistency
    return messages.map(message => ({
      ...message,
      id: message._id
    })) as ContactMessage[];
  }

  // Admin Users
  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const admin = await AdminUserModel.findOne({ username }).lean();
    if (!admin) return undefined;
    // Map MongoDB _id to id field for consistency
    return {
      ...admin,
      id: admin._id
    } as AdminUser;
  }

  async createAdminUser(admin: InsertAdminUser): Promise<AdminUser> {
    const hashedPassword = await bcrypt.hash(admin.password, 10);
    const newAdmin = new AdminUserModel({
      _id: randomUUID(),
      ...admin,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    });
    const saved = await newAdmin.save();
    const adminData = saved.toJSON();
    // Map MongoDB _id to id field for consistency
    return {
      ...adminData,
      id: adminData._id
    } as AdminUser;
  }

  async verifyAdminPassword(username: string, password: string): Promise<boolean> {
    const admin = await AdminUserModel.findOne({ username });
    if (!admin) return false;
    return await bcrypt.compare(password, admin.password);
  }

  async getAllAdmins(): Promise<AdminUser[]> {
    const admins = await AdminUserModel.find().lean();
    // Map MongoDB _id to id field for consistency
    return admins.map(admin => ({
      ...admin,
      id: admin._id
    })) as AdminUser[];
  }

  // Accessory methods
  async getAccessories(): Promise<Accessory[]> {
    const accessories = await AccessoryModel.find({}).lean();
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

  async createAccessory(accessoryData: InsertAccessory): Promise<Accessory> {
    const accessory = new AccessoryModel({
      _id: randomUUID(),
      ...accessoryData,
      createdAt: new Date().toISOString(),
    });
    const saved = await accessory.save();
    const savedData = saved.toJSON();
    return {
      ...savedData,
      id: savedData._id as string
    } as unknown as Accessory;
  }

  async updateAccessory(id: string, accessoryData: Partial<InsertAccessory>): Promise<Accessory | undefined> {
    const updated = await AccessoryModel.findOneAndUpdate(
      { _id: id },
      accessoryData,
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

  // Project methods
  async getProjects(): Promise<any[]> {
    const projects = await ProjectModel.find({}).sort({ featured: -1, createdAt: -1 });
    return projects.map(project => project.toJSON());
  }

  async getProject(id: string): Promise<any> {
    const project = await ProjectModel.findOne({ _id: id });
    return project ? project.toJSON() : undefined;
  }

  async createProject(projectData: any): Promise<any> {
    const project = new ProjectModel({
      _id: randomUUID(),
      ...projectData,
      primaryMediaUrl: projectData.primaryMediaUrl || null,
      additionalMediaUrls: projectData.additionalMediaUrls || [],
      imageUrls: projectData.imageUrls || [], // Legacy field for backward compatibility
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const saved = await project.save();
    return saved.toJSON();
  }

  async updateProject(id: string, projectData: any): Promise<any> {
    const updateData = {
      ...projectData,
      primaryMediaUrl: projectData.primaryMediaUrl || null,
      additionalMediaUrls: projectData.additionalMediaUrls || [],
      imageUrls: projectData.imageUrls || [], // Legacy field for backward compatibility
      updatedAt: new Date()
    };
    
    const updated = await ProjectModel.findOneAndUpdate(
      { _id: id },
      updateData,
      { new: true }
    );
    return updated ? updated.toJSON() : undefined;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await ProjectModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }


}