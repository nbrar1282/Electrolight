import { Search, Menu, X, Phone } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import FavoritesModal from "@/components/favorites-modal";
import BrandFilter from "@/components/brand-filter";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Product, Accessory } from "@shared/schema";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onProductSelect: (product: any) => void;
  selectedBrand?: string | null;
  onBrandSelect?: (brand: string | null) => void;
}

export default function Header({ searchQuery, onSearchChange, onProductSelect, selectedBrand, onBrandSelect }: HeaderProps) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults } = useQuery<{products: Product[], accessories: Accessory[]}>({
    queryKey: [`/api/search?q=${encodeURIComponent(searchQuery.trim())}`],
    enabled: searchQuery.trim().length > 0,
  });

  const searchSuggestions = searchQuery.trim() && searchResults 
    ? [
        ...searchResults.products.map(item => ({ ...item, type: 'product' as const })),
        ...searchResults.accessories.map(item => ({ ...item, type: 'accessory' as const, categorySlug: 'accessories' }))
      ]
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchInput = (value: string) => {
    onSearchChange(value);
    setShowSearchDropdown(value.trim().length > 0);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchDropdown(false);
      window.scrollTo(0, 0); 
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    } else if (e.key === 'Escape') {
      setShowSearchDropdown(false);
    }
  };

  const handleProductSelect = (item: any) => {
    setLocation(`/product/${item.id}`);
    setShowSearchDropdown(false);
    onSearchChange('');
    window.scrollTo(0, 0); 
  };

  const handleBrandSelect = (brand: string | null) => {
    if (onBrandSelect && location.startsWith('/products')) {
      onBrandSelect(brand);
    } else {
      if (brand) {
        setLocation(`/products?brand=${encodeURIComponent(brand)}`);
      } else {
        setLocation('/products');
      }
    }
    window.scrollTo(0, 0);
  };

  // --- FIX 1: Manually calculate scroll position with Header Offset ---
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Header is 'h-20' (80px). We subtract 90px to give a 10px visible buffer above the heading.
      const headerOffset = 90; 
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const navigateAndScrollTop = (path: string) => {
    setLocation(path);
    window.scrollTo(0, 0);
  };

  const handleNavigation = (sectionId: string) => {
    if (window.location.pathname === '/') {
      scrollToSection(sectionId);
    } else {
      setLocation('/');
      setTimeout(() => scrollToSection(sectionId), 100);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <button 
              onClick={() => navigateAndScrollTop('/')} 
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img 
                src="/logo.png" 
                alt="ElectroLight" 
                className="w-24 h-18 object-contain"
              />
            </button>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex space-x-8">
              <button 
                onClick={() => handleNavigation('home')}
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => navigateAndScrollTop('/products')}
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Products
              </button>
              <button 
                onClick={() => navigateAndScrollTop('/projects')}
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Projects
              </button>
              <button 
                onClick={() => handleNavigation('about')}
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => handleNavigation('contact')}
                className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
              >
                Contact
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="hidden xl:flex items-center space-x-2 px-3 py-2 bg-primary/10 dark:bg-primary/20 rounded-full border border-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors">
                <Phone className="h-4 w-4 text-primary" />
                <span className="font-semibold text-primary text-sm">(555) 123-4567</span>
              </div>
              
              <div className="relative" ref={searchRef}>
                <form onSubmit={handleSearchSubmit}>
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-64 pl-10"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </form>
                
                {showSearchDropdown && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {searchSuggestions.map((item) => (
                      <button
                        key={`${item.type}-${item.id}`}
                        onClick={() => handleProductSelect(item)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                         <div className="flex items-center space-x-3">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-10 h-10 object-cover rounded-md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900 dark:text-white truncate">
                                {item.name}
                              </h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                item.type === 'product' 
                                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                                  : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                              }`}>
                                {item.type === 'product' ? 'Product' : 'Accessory'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {item.brand ? `${item.brand} | ` : ''}
                              {item.categorySlug?.replace(/-/g, ' ') || 'accessories'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                    
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full text-left px-4 py-3 bg-primary/5 hover:bg-primary/10 text-primary font-medium"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                )}
              </div>
              
              <BrandFilter selectedBrand={selectedBrand} onBrandSelect={handleBrandSelect} />
              
              <ThemeToggle />
              <FavoritesModal onProductSelect={onProductSelect} />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <FavoritesModal onProductSelect={onProductSelect} />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 dark:text-gray-300"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-4 space-y-4">
              <div className="relative">
                <form onSubmit={handleSearchSubmit}>
                  <Input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => handleSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </form>
                
                {/* Mobile Search Dropdown */}
                {showSearchDropdown && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {searchSuggestions.map((item) => (
                      <button
                        key={`mobile-${item.type}-${item.id}`}
                        onClick={() => {
                          handleProductSelect(item);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                      >
                         <div className="flex items-center space-x-3">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-8 h-8 object-cover rounded-md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                {item.name}
                              </h4>
                              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                                item.type === 'product' 
                                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                                  : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                              }`}>
                                {item.type === 'product' ? 'Product' : 'Accessory'}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {item.brand ? `${item.brand} | ` : ''}
                              {item.categorySlug?.replace(/-/g, ' ') || 'accessories'}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                    
                    <button
                      onClick={() => {
                        handleSearchSubmit();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 bg-primary/5 hover:bg-primary/10 text-primary font-medium text-sm"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                )}
              </div>
              
              <BrandFilter selectedBrand={selectedBrand} onBrandSelect={handleBrandSelect} />
              
              <nav className="space-y-2">
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    // --- FIX 2: Wait for menu to close before navigating ---
                    setTimeout(() => handleNavigation('home'), 100);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  Home
                </button>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigateAndScrollTop('/products');
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  Products
                </button>
                <button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigateAndScrollTop('/projects');
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  Projects
                </button>
                <button 
                  onClick={() => {
                    // --- FIX 2: Wait for menu to close before navigating ---
                    setIsMobileMenuOpen(false);
                    setTimeout(() => handleNavigation('about'), 100);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  About
                </button>
                <button 
                  onClick={() => {
                    // --- FIX 2: Wait for menu to close before navigating ---
                    setIsMobileMenuOpen(false);
                    setTimeout(() => handleNavigation('contact'), 100);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  Contact
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}