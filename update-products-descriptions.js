// Script to update product descriptions and specifications without reseeding
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://electrolight:ZSyqBLrAjkTNx3Gv@electrolight.ikzyr.mongodb.net/electrolight?retryWrites=true&w=majority";

const productUpdates = [
  {
    name: "Professional LED Light Fixture",
    description: "Premium commercial-grade LED lighting fixture engineered for demanding industrial and commercial applications. Features advanced thermal management, superior light distribution, and exceptional energy efficiency. Built with aircraft-grade aluminum housing and rated for continuous 24/7 operation in harsh environments. Delivers consistent, flicker-free illumination with excellent color rendering (CRI >90) perfect for retail spaces, warehouses, manufacturing facilities, and office environments.",
    specificationList: [
      "LED Technology - High-efficiency Samsung LM301B diodes with 50,000+ hour lifespan",
      "Light Output - 15,000 lumens at 4000K neutral white color temperature", 
      "Energy Efficiency - 130 lumens per watt, 80% energy savings vs fluorescent",
      "Power Consumption - 115W actual draw with integrated LED driver",
      "Color Rendering - CRI >90 for excellent color accuracy and visual comfort",
      "Dimming Capability - 0-10V dimming compatible, smooth 1-100% range",
      "Housing Material - Extruded aluminum with integrated heat sink design",
      "Mounting Options - Surface mount, pendant, or chain suspension ready",
      "Environmental Rating - IP65 rated for dust and water resistance",
      "Operating Temperature - -40°F to 140°F ambient temperature range",
      "Certifications - UL Listed, DLC Premium certified, ENERGY STAR qualified",
      "Warranty Coverage - 7-year comprehensive manufacturer warranty"
    ]
  },
  {
    name: "4-Gang Metal Extension Ring",
    description: "Heavy-duty galvanized steel extension ring designed for professional electrical installations requiring additional box depth. Precision-manufactured with smooth edges and pre-punched knockouts for various conduit sizes. Ideal for accommodating GFCI outlets, smart switches, or multiple wire connections in residential and commercial applications. Corrosion-resistant finish ensures long-term durability in indoor and outdoor environments.",
    specificationList: [
      "Construction Material - 16-gauge galvanized steel with zinc coating",
      "Gang Configuration - 4-gang rectangular design for multiple devices",
      "Extension Depth - 1/2 inch additional mounting depth capacity",
      "Knockout Options - Pre-punched 1/2 inch and 3/4 inch trade size openings",
      "Mounting System - Universal compatibility with standard electrical boxes",
      "Finish Type - Hot-dipped galvanized coating for corrosion resistance",
      "Wire Management - Internal cable management clips and routing guides",
      "Installation Method - Secure screw mounting with included hardware",
      "Environmental Rating - Indoor/outdoor use with proper weatherproofing",
      "Load Capacity - Supports up to 4 standard electrical devices safely",
      "Compliance Standards - UL Listed and meets NEC electrical code requirements",
      "Professional Grade - Contractor-preferred choice for commercial installations"
    ]
  },
  {
    name: "Electric Baseboard Heater - 2500W",
    description: "High-performance electric baseboard heater engineered for efficient zone heating in residential and light commercial applications. Features advanced convection design with integrated thermal protection and whisper-quiet operation. Constructed with heavy-gauge steel housing and precision-wound heating elements for reliable, long-lasting performance. Ideal for supplemental heating, additions, or primary heating in well-insulated spaces.",
    specificationList: [
      "Heating Capacity - 2500 watts at 240V for up to 250 square feet",
      "Voltage Rating - 240V single-phase with hardwired connection",
      "Thermal Efficiency - 99% electrical energy conversion to heat output",
      "Heating Element - Precision-wound nichrome wire with ceramic supports",
      "Housing Construction - Heavy-gauge steel with powder-coat finish",
      "Safety Features - Built-in thermal cutoff and tip-over protection",
      "Noise Level - Ultra-quiet convection design under 35dB operation",
      "Installation Type - Wall-mounted baseboard with floor clearance",
      "Control Options - Compatible with line and low-voltage thermostats",
      "Environmental Rating - Indoor use with IPX1 moisture resistance",
      "Operating Temperature - Maintains consistent heat in -10°F to 90°F ambient",
      "Warranty Coverage - 5-year limited manufacturer warranty"
    ]
  }
];

async function updateProductDescriptions() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    const db = client.db('electrolight');
    const products = db.collection('products');
    
    for (const update of productUpdates) {
      const result = await products.updateOne(
        { name: { $regex: update.name, $options: 'i' } },
        { 
          $set: { 
            description: update.description,
            specificationList: update.specificationList
          }
        }
      );
      console.log(`Updated ${update.name}: ${result.modifiedCount} document(s)`);
    }
    
  } finally {
    await client.close();
  }
}

updateProductDescriptions().catch(console.error);