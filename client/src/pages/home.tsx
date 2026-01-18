import { useState } from "react";
import { useLocation } from "wouter"; // Removed 'Link' as we don't need it for the button anymore
import Header from "@/components/header";
import CategoryNav from "@/components/category-nav";
import HeroCarousel from "@/components/hero-carousel";
import ProductGrid from "@/components/product-grid";
import ProjectsCarousel from "@/components/projects-carousel";
import AboutSection from "@/components/about-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import ProductModal from "@/components/product-modal";
import { ElectricalLoading } from "@/components/ui/electrical-loading";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Category, Product } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Show only actual featured products on homepage
  const featuredProducts = products.filter(product => product.featured);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Don't auto-redirect - let the Header component handle search dropdown and redirect on Enter
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-inter">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onProductSelect={setSelectedProduct}
        selectedBrand={null}
        onBrandSelect={undefined}
      />
      
      <HeroCarousel />
      
      <CategoryNav categories={categories} />
      
      <main>
        <section id="products" className="py-12">
          <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Featured Products</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Discover our most popular electrical products and components
                </p>
              </div>
              
              {/* --- CHANGED SECTION START --- */}
              {/* Removed <Link> wrapper and added onClick handler */}
              <Button 
                className="bg-primary hover:bg-primary/90"
                onClick={() => {
                  setLocation('/products');
                  window.scrollTo(0, 0);
                }}
              >
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {/* --- CHANGED SECTION END --- */}

            </div>
            
            {productsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border shadow-sm">
                    <ElectricalLoading 
                      variant="circuit" 
                      size="md" 
                      text="Loading products..."
                    />
                  </div>
                ))}
              </div>
            ) : (
              <ProductGrid 
                products={featuredProducts}
                onProductSelect={setSelectedProduct}
              />
            )}

          </div>
        </section>
        
        <ProjectsCarousel />
        
        <AboutSection />
        <ContactSection />
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