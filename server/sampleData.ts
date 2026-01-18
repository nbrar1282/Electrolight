export const sampleProducts = [
  {
    name: "LED Strip Light Kit - 16.4ft",
    description: "Professional-grade LED strip lighting with remote control and power adapter. Perfect for under-cabinet, accent, and decorative lighting applications.",
    categorySlug: "light",
    brand: "Philips",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800",
    imageUrls: [
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800"
    ],
    specificationList: [
      "Length: 16.4 feet (5 meters)",
      "LED Count: 300 LEDs", 
      "Color Temperature: 3000K Warm White",
      "Voltage: 12V DC",
      "Power Consumption: 24W",
      "Waterproof Rating: IP65"
    ],
    accessories: [],
    similarProducts: [],
    inStock: true,
    featured: true
  },
  {
    name: "Motion Sensor Switch - PIR",
    description: "Automatic motion sensor switch for indoor and outdoor lighting. Energy-efficient with adjustable sensitivity and timer settings.",
    categorySlug: "light",
    brand: "Leviton",
    imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800",
    imageUrls: [
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800",
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800"
    ],
    specificationList: [
      "Detection Range: 180° field of view",
      "Distance: Up to 40 feet",
      "Timer Settings: 30 seconds to 15 minutes", 
      "Load Capacity: 500W incandescent, 150W LED",
      "Installation: Standard wall switch box",
      "Operating Temperature: -20°C to 50°C"
    ],
    accessories: [],
    similarProducts: [],
    inStock: true,
    featured: true
  },
  {
    name: "Wire Management System Kit",
    description: "Complete cable management solution including conduits, junction boxes, and mounting hardware for clean electrical installations.",
    categorySlug: "construction",
    brand: "Arlington",
    imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800",
    imageUrls: [
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800"
    ],
    specificationList: [
      "Conduit Size: 1/2 inch to 1 inch diameter",
      "Material: High-grade PVC",
      "Junction Boxes: 4 included",
      "Mounting Hardware: Complete screw set", 
      "Length: 10 feet total conduit",
      "Bend Radius: Flexible design"
    ],
    accessories: [],
    similarProducts: [],
    inStock: true,
    featured: true
  },
  {
    name: "Smart Dimmer Switch",
    description: "WiFi-enabled smart dimmer switch compatible with Alexa and Google Home. App control and voice activation supported.",
    categorySlug: "light",
    brand: "Lutron",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800",
    imageUrls: [
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800"
    ],
    specificationList: [
      "Compatibility: LED, CFL, Incandescent",
      "Load Rating: 150W LED, 600W Incandescent",
      "Connectivity: 2.4GHz WiFi",
      "Voice Control: Alexa, Google Assistant",
      "App: iOS and Android compatible", 
      "Installation: Standard wall box, neutral required"
    ],
    accessories: [],
    similarProducts: [],
    inStock: true,
    featured: false
  },
  {
    name: "Recessed LED Downlight - 6 inch",
    description: "Energy-efficient 6-inch recessed LED downlight with adjustable color temperature and dimming capability.",
    categorySlug: "pot-light",
    brand: "Cree",
    imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800",
    imageUrls: [
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800"
    ],
    specificationList: [
      "Diameter: 6 inches",
      "Wattage: 15W",
      "Lumens: 1000 lm",
      "Color Temperature: 2700K-5000K adjustable",
      "Dimming: 0-10V compatible",
      "Lifespan: 50,000 hours"
    ],
    accessories: [],
    similarProducts: [],
    inStock: true,
    featured: false
  },
  {
    name: "GFCI Outlet - 15A",
    description: "Ground Fault Circuit Interrupter outlet for bathroom, kitchen, and outdoor applications. Meets all safety codes.",
    categorySlug: "plastic-box",
    brand: "Hubbell",
    imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800",
    imageUrls: [
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800"
    ],
    specificationList: [
      "Amperage: 15A, 125V", 
      "GFCI Protection: 5mA trip threshold",
      "Test/Reset: Built-in buttons",
      "Weather Resistance: Outdoor rated",
      "Wiring: Back and side terminals",
      "Compliance: UL Listed, NEC compliant"
    ],
    accessories: [],
    similarProducts: [],
    inStock: true,
    featured: false
  }
];

export const sampleAccessories = [
  {
    name: "Wire Nuts Assortment",
    modelNumber: "WN-100",
    description: "Professional wire connector kit with various sizes for different gauge wires",
    imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800",
    imageUrls: [
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800"
    ],
    brand: "Ideal",
    compatibleWith: ["construction", "light", "plastic-box", "metal-box"]
  },
  {
    name: "Electrical Tape Set",
    modelNumber: "ET-200",
    description: "High-quality electrical tape in multiple colors for wire marking and insulation",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800",
    imageUrls: [
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800"
    ],
    brand: "3M",
    compatibleWith: ["construction", "light", "plastic-box", "metal-box", "gi-wire"]
  },
  {
    name: "Junction Box Cover Plates",
    modelNumber: "JB-CP-4",
    description: "Standard cover plates for electrical junction boxes in various configurations",
    imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800",
    imageUrls: [
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800"
    ],
    brand: "Leviton",
    compatibleWith: ["plastic-box", "metal-box", "octagonal-box"]
  },
  {
    name: "LED Driver Module",
    modelNumber: "LD-24V-60W",
    description: "Constant voltage LED driver for strip lights and LED modules",
    imageUrl: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800",
    imageUrls: [
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800"
    ],
    brand: "Mean Well",
    compatibleWith: ["light", "pot-light", "puck-light", "driver"]
  },
  {
    name: "Smoke Detector Battery",
    modelNumber: "9V-ALK",
    description: "Long-lasting alkaline battery specifically designed for smoke detectors",
    imageUrl: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800",
    imageUrls: [
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800"
    ],
    brand: "Duracell",
    compatibleWith: ["smoke-alarm"]
  }
];

export const sampleProjects = [
  {
    title: "Modern Office Building Renovation",
    description: "Complete electrical upgrade for a 5-story office building including LED lighting conversion, smart switches, and emergency systems. This project involved replacing all fluorescent fixtures with energy-efficient LED panels and installing a comprehensive building automation system.",
    category: "Commercial",
    location: "Downtown Toronto, ON",
    primaryMediaUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200",
    additionalMediaUrls: [
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
      "https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800"
    ],
    completedDate: "2024-03-15",
    clientType: "Commercial",
    productsUsed: [],
    featured: true
  },
  {
    title: "Luxury Home Smart Lighting",
    description: "Installation of comprehensive smart home lighting system with automated controls, dimming, and voice activation throughout a 4,000 sq ft residence. Features include scene control, energy monitoring, and integration with home security systems.",
    category: "Residential",
    location: "Oakville, ON",
    primaryMediaUrl: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200",
    additionalMediaUrls: [
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800"
    ],
    completedDate: "2024-02-28",
    clientType: "Residential",
    productsUsed: [],
    featured: true
  },
  {
    title: "Industrial Warehouse Lighting Upgrade",
    description: "High-bay LED lighting installation for a 50,000 sq ft warehouse facility. Improved lighting levels by 300% while reducing energy consumption by 60%. Includes motion sensors and daylight harvesting controls.",
    category: "Industrial",
    location: "Mississauga, ON",
    primaryMediaUrl: "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=1200",
    additionalMediaUrls: [
      "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=800"
    ],
    completedDate: "2024-01-20",
    clientType: "Industrial",
    productsUsed: [],
    featured: false
  },
  {
    title: "Restaurant Kitchen Electrical",
    description: "Complete electrical system for a new restaurant kitchen including specialized outlets for commercial equipment, exhaust fan controls, and emergency lighting. All installations meet commercial kitchen safety standards.",
    category: "Commercial",
    location: "King Street West, Toronto",
    primaryMediaUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200",
    additionalMediaUrls: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"
    ],
    completedDate: "2023-12-10",
    clientType: "Commercial",
    productsUsed: [],
    featured: false
  }
];