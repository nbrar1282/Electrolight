import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import Header from "@/components/header";
import ProductGrid from "@/components/product-grid";
import ProductGridFilters from "@/components/product-grid-filters";
import ProductModal from "@/components/product-modal";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Filter } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Category, Product } from "@shared/schema";

export default function Products() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("featured");
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAccessories, setShowAccessories] = useState(false);

  // Get URL parameters
  const urlParams = new URLSearchParams(search);
  const categorySlug = urlParams.get('category');
  const brandParam = urlParams.get('brand');
  const searchParam = urlParams.get('search');

  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    if (brandParam) {
      setSelectedBrand(brandParam);
    }
    if (categorySlug) {
      setSelectedCategory(categorySlug);
    }
  }, [searchParam, brandParam, categorySlug]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Fetch accessories as a separate section
  const { data: accessories = [] } = useQuery<any[]>({
    queryKey: ['/api/accessories'],
  });

  // Always fetch all products to enable proper filtering
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Create a mapping function to determine which category an accessory belongs to
  const getAccessoryCategory = (accessory: any) => {
    const compatibleWith = accessory.compatibleWith || [];
    
    // Map accessory compatibility to actual product categories in the system
    if (compatibleWith.includes('light')) return 'light';
    if (compatibleWith.includes('baseboard')) return 'baseboard';
    if (compatibleWith.includes('construction')) return 'construction';
    if (compatibleWith.includes('metal-box')) return 'metal-box';
    if (compatibleWith.includes('smoke-alarm')) return 'smoke-alarm';
    if (compatibleWith.includes('pvc-pipe')) return 'pvc-pipe';
    if (compatibleWith.includes('pot-light')) return 'pot-light';
    if (compatibleWith.includes('puck-light')) return 'puck-light';
    if (compatibleWith.includes('octagonal-box')) return 'octagonal-box';
    if (compatibleWith.includes('plastic-box')) return 'plastic-box';
    if (compatibleWith.includes('metal-plates')) return 'metal-plates';
    if (compatibleWith.includes('milk-carton')) return 'milk-carton';
    if (compatibleWith.includes('ground-plate')) return 'ground-plate';
    if (compatibleWith.includes('gi-wire')) return 'gi-wire';
    if (compatibleWith.includes('gangable-boxes')) return 'gangable-boxes';
    if (compatibleWith.includes('extension-rings')) return 'extension-rings';
    if (compatibleWith.includes('driver')) return 'driver';
    if (compatibleWith.includes('bamboo')) return 'bamboo';
    
    return 'accessories'; // Default fallback
  };

  // Convert accessories to product-like format
  const accessoriesAsProducts = accessories.map(accessory => ({
    ...accessory,
    id: accessory._id,
    categorySlug: getAccessoryCategory(accessory), // Map to appropriate category
    brand: accessory.brand || 'ElectroLight',
    inStock: true,
    featured: false,
    specificationList: [],
    accessories: [],
    similarProducts: []
  }));

  // Combine products with accessories based on checkbox state
  const allProductsWithAccessories = showAccessories 
    ? [...allProducts, ...accessoriesAsProducts]
    : allProducts;

  // Check if we're viewing accessories specifically
  const isAccessoriesView = categorySlug === 'accessories';

  // Filter products based on category URL parameter if present
  const products = categorySlug 
    ? (isAccessoriesView 
        ? accessoriesAsProducts 
        : allProductsWithAccessories.filter(product => product.categorySlug === categorySlug))
    : allProductsWithAccessories;

  // Get product counts for each category based on current filters (including accessories if checkbox is checked)
  const categoryProductCounts = categories.reduce((acc, category) => {
    // Regular products count
    const productsCount = allProducts.filter(product => {
      const matchesCategory = product.categorySlug === category.slug;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = !selectedBrand || 
        (product.brand && product.brand.toLowerCase() === selectedBrand.toLowerCase());
      
      return matchesCategory && matchesSearch && matchesBrand;
    }).length;

    // Accessories count for this category (if checkbox is checked)
    const accessoriesCount = showAccessories ? accessories.filter(accessory => {
      const matchesCategory = getAccessoryCategory(accessory) === category.slug;
      const matchesSearch = accessory.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        accessory.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = !selectedBrand || 
        (accessory.brand && accessory.brand.toLowerCase() === selectedBrand.toLowerCase());
      
      return matchesCategory && matchesSearch && matchesBrand;
    }).length : 0;

    acc[category.slug] = productsCount + accessoriesCount;
    return acc;
  }, {} as Record<string, number>);

  // Get total filtered products count for "All Categories" (using allProductsWithAccessories)
  const totalFilteredCount = allProductsWithAccessories.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = !selectedBrand || 
      (product.brand && product.brand.toLowerCase() === selectedBrand.toLowerCase());
    
    return matchesSearch && matchesBrand;
  }).length;

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesBrand = !selectedBrand || 
        (product.brand && product.brand.toLowerCase() === selectedBrand.toLowerCase());
      
      const matchesCategory = !selectedCategory || product.categorySlug === selectedCategory;
      
      return matchesSearch && matchesBrand && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
          // Assuming newer products have higher IDs or could use a createdAt field
          return b.id.localeCompare(a.id);
        case 'featured':
        default:
          return 0; // Keep original order
      }
    });

  const currentCategory = categories.find(c => c.slug === categorySlug);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-inter">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          if (query) {
            setLocation(`/products?search=${encodeURIComponent(query)}`);
          }
        }}
        onProductSelect={setSelectedProduct}
        selectedBrand={selectedBrand}
        onBrandSelect={setSelectedBrand}
      />
      
      <main className="py-8">
        <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <Button
              onClick={() => setIsSidebarOpen(true)}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters & Categories</span>
            </Button>
          </div>

          <div className="flex gap-8">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
                <div className="absolute left-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSidebarOpen(false)}
                        className="text-gray-500 dark:text-gray-400"
                      >
                        ✕
                      </Button>
                    </div>
                    
                    <Button
                      variant="ghost"
                      onClick={() => setLocation('/')}
                      className="mb-6 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white w-full justify-start"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Home
                    </Button>



                    {/* Show Accessories Checkbox */}
                    <div className="mb-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showAccessories}
                          onChange={(e) => setShowAccessories(e.target.checked)}
                          className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            Include Accessories in Categories
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({accessories.length} accessories available)
                          </span>
                        </div>
                      </label>
                    </div>

                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product Categories</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          setSelectedCategory(null);
                          setLocation('/products');
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors flex justify-between items-center ${
                          !selectedCategory 
                            ? 'bg-primary text-white' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span>All Categories</span>
                        <span className={`text-sm ${!selectedCategory ? 'text-white/80' : 'text-gray-500'}`}>
                          {totalFilteredCount}
                        </span>
                      </button>
                      

                      
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.slug);
                            setLocation(`/products?category=${category.slug}`);
                            setIsSidebarOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md transition-colors flex justify-between items-center ${
                            selectedCategory === category.slug 
                              ? 'bg-primary text-white' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <span>{category.name}</span>
                          <span className={`text-sm ${selectedCategory === category.slug ? 'text-white/80' : 'text-gray-500'}`}>
                            {categoryProductCounts[category.slug] || 0}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-4">
                <Button
                  variant="ghost"
                  onClick={() => setLocation('/')}
                  className="mb-6 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white w-full justify-start"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>



                {/* Show Accessories Checkbox */}
                <div className="mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAccessories}
                      onChange={(e) => setShowAccessories(e.target.checked)}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Include Accessories in Categories
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({accessories.length} accessories available)
                      </span>
                    </div>
                  </label>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Product Categories</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      setLocation('/products');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors flex justify-between items-center ${
                      !selectedCategory 
                        ? 'bg-primary text-white' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>All Categories</span>
                    <span className={`text-sm ${!selectedCategory ? 'text-white/80' : 'text-gray-500'}`}>
                      {totalFilteredCount}
                    </span>
                  </button>
                  

                  
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.slug);
                        setLocation(`/products?category=${category.slug}`);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors flex justify-between items-center ${
                        selectedCategory === category.slug 
                          ? 'bg-primary text-white' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className={`text-sm ${selectedCategory === category.slug ? 'text-white/80' : 'text-gray-500'}`}>
                        {categoryProductCounts[category.slug] || 0}
                      </span>
                    </button>
                  ))}
                </div>

                {(selectedBrand || searchQuery || selectedCategory) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBrand(null);
                      setSearchQuery("");
                      setSelectedCategory(null);
                      setLocation('/products');
                    }}
                    className="mt-6 w-full"
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {isAccessoriesView ? 'Accessories' :
                   currentCategory ? currentCategory.name : 
                   searchParam ? `Search Results for "${searchParam}"` : 
                   selectedBrand ? `${selectedBrand} Products` :
                   'All Products'}
                </h1>
                
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {isAccessoriesView ? `Browse our complete accessories collection` :
                   currentCategory ? `Browse our ${currentCategory.name.toLowerCase()} collection` :
                   searchParam ? `Found ${filteredAndSortedProducts.length} products matching your search` :
                   selectedBrand ? `Showing ${filteredAndSortedProducts.length} products from ${selectedBrand}` :
                   `Showing ${filteredAndSortedProducts.length} products`}
                </p>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {filteredAndSortedProducts.length} products found
                </p>
              </div>
              
              {/* Grid Controls */}
              <ProductGridFilters 
                onSortChange={setSortBy}
                onLayoutChange={setLayout}
              />
              
              {/* Products Grid */}
              <ProductGrid 
                products={filteredAndSortedProducts}
                onProductSelect={setSelectedProduct}
                layout={layout}
              />
              
              {filteredAndSortedProducts.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Filter className="mx-auto h-12 w-12" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
                  <p className="text-gray-600 dark:text-gray-300">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
}