import { Zap } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { SiteSettings, Category } from "@shared/schema";

export default function Footer() {
  const [, setLocation] = useLocation();

  // 1. Fetch Global Settings
  const { data: settings } = useQuery<SiteSettings>({
    queryKey: ['/api/site-settings'],
  });

  // 2. Fetch Categories (Dynamic)
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  // Scroll to specific section on the current page (Home/About/Contact)
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- NEW: Handle Category Click with Scroll Reset ---
  const handleCategoryClick = (slug: string) => {
    // 1. Navigate to the filtered products page
    setLocation(`/products?category=${slug}`);
    
    // 2. Force scroll to top immediately
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Helper to check if a link exists before rendering
  const renderSocialLink = (url: string | null | undefined, iconClass: string) => {
    if (!url) return null;
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-gray-300 hover:text-primary transition-colors"
      >
        <i className={iconClass}></i>
      </a>
    );
  };

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
      <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Socials Section */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="/logo.png" 
                alt="ElectroLight Logo" 
                className="w-8 h-8 object-contain"
              />
              <h3 className="text-xl font-bold">ElectroLight</h3>
            </div>
            
            {/* Dynamic Footer Text */}
            <p className="text-gray-300 dark:text-gray-400 mb-4 pr-4">
              {settings?.footerText || "Professional electrical products for every project."}
            </p>
            
            {/* Dynamic Social Links */}
            <div className="flex space-x-4">
              {renderSocialLink(settings?.facebookUrl, "fab fa-facebook")}
              {renderSocialLink(settings?.twitterUrl, "fab fa-twitter")}
              {renderSocialLink(settings?.linkedinUrl, "fab fa-linkedin")}
              {renderSocialLink(settings?.instagramUrl, "fab fa-instagram")}
            </div>
          </div>

          {/* Quick Links Section */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300 dark:text-gray-400">
              <li>
                <button 
                  onClick={() => scrollToSection('home')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('products')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Products
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('about')}
                  className="hover:text-primary transition-colors text-left"
                >
                  About
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('contact')}
                  className="hover:text-primary transition-colors text-left"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Categories Section (Dynamic - First 4) */}
          <div>
            <h4 className="font-semibold mb-4">Product Categories</h4>
            <ul className="space-y-2 text-gray-300">
              {categories.slice(0, 4).map((category) => (
                <li key={category.id}>
                  <button 
                    onClick={() => handleCategoryClick(category.slug)}
                    className="hover:text-primary transition-colors text-left"
                  >
                    {category.name}
                  </button>
                </li>
              ))}
              
              {/* Fallback if no categories exist yet */}
              {categories.length === 0 && (
                <li className="text-gray-500 text-sm">Loading categories...</li>
              )}
            </ul>
          </div>

          {/* Support Section (Static) */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-primary">Help Center</a></li>
              <li><a href="#" className="hover:text-primary">Returns</a></li>
              <li><a href="#" className="hover:text-primary">Shipping</a></li>
              <li><a href="#" className="hover:text-primary">FAQs</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>© {new Date().getFullYear()} ElectroLight. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}