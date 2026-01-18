# ElectroLight - Electrical Products Catalog

## Overview

ElectroLight is a modern e-commerce web application for electrical products and components. It provides a comprehensive catalog with category-based browsing, product search, and a secure admin panel for inventory management. The application serves both customers looking for electrical supplies and administrators managing the product catalog and customer inquiries.

## Recent Changes (January 2025)

✓ **Brand & Category Management System**: Complete CRUD operations for brands and categories with database persistence and UI synchronization
✓ **FontAwesome Icon Search**: Comprehensive searchable icon library with 150+ electrical-themed icons and smart keyword matching
✓ **Brand Synchronization**: Perfect brand consistency across admin, product forms, homepage, and filtering systems
✓ **Dynamic Brand Integration**: Replaced hardcoded brands with database-driven system supporting King Electric, Schneider Electric, etc.
✓ **Advanced Icon Filtering**: Smart search with electrical keywords (light, electric, wire, safety, tool, etc.) and multi-category organization
✓ **Projects System Implementation**: Complete projects showcase system with individual project pages, media galleries, product relationships, and admin management
✓ **Projects Navigation Fixed**: Corrected routing issues for both header navigation and "View Project" buttons across the site
✓ **Projects API & Database**: Full CRUD operations for projects with MongoDB backend and proper seeding system
✓ **Product-Project Integration**: Projects now show which electrical products were used, linking to product detail pages
✓ **Project Filtering & Search**: Projects page includes category filtering and search functionality
✓ **Product Detail Pages & No-Price Architecture**: Completely removed all pricing from the application and created comprehensive product detail pages with specifications, accessories, and similar product recommendations
✓ **Schema Restructuring**: Major database schema update - removed price field entirely and added accessories/similarProducts arrays for product relationships
✓ **Enhanced Product Navigation**: Added dedicated product detail pages accessible via /product/:id with full specifications, multiple images, and related products
✓ **Accessories System**: Created product relationship system where products can have associated accessories and similar product recommendations
✓ **Professional Accessories Tables**: Implemented table-based layout for accessories and related products matching professional specification sheets with product images, names, model numbers, and descriptions
✓ **Admin Accessories Management**: Added comprehensive accessories and similar products management in admin panel with dropdown selection and visual tag management
✓ **Product Modal Cleanup**: Removed redundant Featured badges, brand names, and In Stock status from product popup for cleaner interface
✓ **Eye Icon Quick Look**: Added small eye icon for quick product preview functionality near favorites button
✓ **Category Terminology**: Replaced all "client type" references with "category" throughout entire application for consistency
✓ **Projects Category Filter**: Added category dropdown filter back to projects page alongside search functionality  
✓ **Clean Project Images**: Removed category badge overlays from project carousel images for cleaner visual presentation
✓ **Wider Layout for Big Screens**: Updated max-width from 1280px to 1400px across all components for better use of large displays
✓ **Contact Number in Header**: Added phone number (555) 123-4567 with phone icon in top right header for easy customer contact
✓ **Admin Dashboard Mobile Optimization**: Complete mobile responsiveness with condensed tables, stacked layouts, and touch-friendly controls
✓ **Mobile Table Design**: Smart column hiding and info consolidation for mobile-friendly admin product and contact management
✓ **Admin Login Fixed**: Resolved MongoDB ID mapping issue - admin authentication now works perfectly
✓ **Admin Product Management Enhanced**: Complete filtering, search, and featured product management system
✓ **Featured Products System**: Only selected products (LED Fixture, Motion Sensor, Wire Management) are featured
✓ **Database Persistence Fixed**: Resolved critical seeding issue - uploaded images and custom product data now persist through application restarts
✓ **Removed Stock Tracking**: Eliminated "In Stock" displays and replaced with Featured/Regular status system
✓ **Admin Filtering & Search**: Advanced product filtering by brand, category, and search with live count updates
✓ **Enhanced File Upload**: Improved 5MB limit handling with proper error messages and validation
✓ **Product Update Issues Fixed**: Resolved "PUT /api/products/undefined" error with proper ID mapping
✓ **Smart Product Counts**: Category sidebar now shows filtered counts based on current brand/search selection
✓ **Enhanced Brand System**: Complete brand integration with exact filtering and admin brand column
✓ **Brand Display Fix**: Product page titles now show selected brand name instead of "All Products"
✓ **Admin Brand Management**: Added brand field to admin form and brand column to products table
✓ **Dynamic Filtering**: Product counts update correctly when filtering by category, brand, or search
✓ **Professional Brand Names**: All products assigned authentic electrical manufacturer brands
✓ **Schema Validation Fixed**: Made specifications field optional in schema to prevent admin form validation errors
✓ **Specification Table System**: Complete implementation of clean 2-column specification tables for all products and accessories
✓ **Admin Dashboard Streamlined**: Removed redundant Technical Specifications text field, now only manages specification table items
✓ **Comprehensive Accessories Specs**: Added detailed specification table data for all 8 accessories with 6-7 specifications each
✓ **Product Detail Layout**: Product images positioned on left with descriptions on right as requested
✓ **Admin Interface Enhanced**: Clear helper text for "Feature - Detail" format specification table entry
✓ **Separate Products Page**: Created dedicated /products page for comprehensive product browsing
✓ **Featured Products Homepage**: Homepage now shows only featured products with "Load More" button
✓ **Fixed Categories Grid**: Categories displayed as permanent grid (not expandable) with direct links
✓ **Brand Filtering**: Added brand selection dropdown in header with popular electrical brands
✓ **Search Navigation**: Search results redirect to dedicated products page with filters
✓ **Logo Integration**: Beautiful ElectroLight logo integrated throughout website (header, hero, admin, footer)
✓ **Cloudinary Integration**: Professional image upload system for real product photos via admin panel
✓ **Enhanced Admin Panel**: File upload functionality with image preview and Cloudinary cloud storage
✓ **Google Maps Integration**: Embedded interactive map showing actual business location in contact section
✓ **Admin Authentication System**: Added session-based authentication to secure admin portal access
✓ **Admin Login Page**: Created dedicated login page with demo credentials for owner access
✓ **Protected Routes**: All admin functionality now requires authentication (product management, contact messages)
✓ **Session Management**: Implemented secure session handling with logout functionality
✓ **Admin User Management**: Created admin user schema and password hashing with bcryptjs
✓ **Favorites System**: Replaced cart functionality with favorites using heart icons and local storage
✓ **Favorites Modal**: Added comprehensive favorites management with product grid view
✓ **Product Modal Update**: Replaced "Add to Cart" with "Add to Favorites" button
✓ **MongoDB Integration**: Connected application to MongoDB Atlas database for persistent data storage
✓ **Real-time Favorites**: Implemented React Context for instant favorites updates across all components

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The client is built as a React Single Page Application (SPA) using:
- **React 18** with TypeScript for component development
- **Wouter** for lightweight client-side routing (Home, Admin, 404 pages)
- **TanStack Query** for server state management and API caching
- **shadcn/ui** component library built on Radix UI primitives for consistent design
- **Tailwind CSS** for utility-first styling with custom design tokens
- **Vite** as the build tool and development server

The frontend follows a component-based architecture with separate pages for public catalog browsing and admin management. State management is handled through React Query for server data and local component state for UI interactions.

### Backend Architecture
The server uses a minimal Express.js setup with:
- **Express.js** RESTful API with JSON endpoints
- **TypeScript** throughout the entire stack
- **Zod** for runtime schema validation and type generation
- **In-memory storage** with a seeded data implementation for development
- Structured routing with proper error handling and request logging

The backend implements a clean separation between route handlers, storage abstraction, and schema validation. The storage layer uses an interface pattern to allow easy swapping between in-memory and database implementations.

### Data Layer
Now uses MongoDB Atlas cloud database with:
- **MongoDB Atlas Integration**: Connected to cloud-hosted MongoDB cluster for persistent data storage
- **Mongoose ODM**: Object Document Mapping for schema definition and data validation
- **Automatic Seeding**: Seeds initial data for categories, products, and admin users on startup
- **Type-Safe Operations**: Full storage interface implementation with TypeScript types
- **Session Storage**: Secure admin authentication with MongoDB session persistence

The schema is defined using Mongoose with proper TypeScript integration, including collections for categories, products, contact messages, and admin users. All data persists between application restarts.

### Component Architecture
The UI is built with reusable, accessible components:
- **Radix UI primitives** for complex interactive components (dialogs, dropdowns, etc.)
- **Custom business components** for domain-specific functionality (ProductGrid, Sidebar, etc.)
- **shadcn/ui components** for consistent styling and behavior
- **Responsive design** with mobile-first approach using Tailwind breakpoints

### API Design
RESTful endpoints following standard conventions:
- `GET /api/categories` - Retrieve all product categories
- `GET /api/products` - Retrieve products with optional category filtering
- `GET /api/products/:id` - Retrieve specific product details
- `POST /api/products` - Create new products (admin)
- `POST /api/contact` - Submit customer contact messages

All endpoints use JSON for request/response bodies with proper HTTP status codes and error handling.

## External Dependencies

### Database Integration
- **Drizzle ORM** for database schema definition and migrations
- **@neondatabase/serverless** for PostgreSQL connection (configured but not actively used)
- **PostgreSQL** database support configured through environment variables

### UI Framework
- **Radix UI** primitives for accessible, unstyled components
- **Lucide React** for consistent iconography
- **Tailwind CSS** for utility-first styling
- **class-variance-authority** for component variant management

### Development Tools
- **Vite** for fast development and optimized builds
- **TypeScript** for type safety across the full stack
- **ESBuild** for server-side bundling in production
- **PostCSS** with Autoprefixer for CSS processing

### File Upload
- **Multer** middleware for handling multipart form data and file uploads

### Session Management
- **connect-pg-simple** for PostgreSQL session storage (configured for future use)

### Validation & Forms
- **Zod** for runtime schema validation
- **React Hook Form** with **@hookform/resolvers** for form state management
- **drizzle-zod** for automatic schema to validation conversion