import { Button } from "@/components/ui/button";
import { X, ChevronUp } from "lucide-react";
import type { Category } from "@shared/schema";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string | null;
  onCategorySelect: (categorySlug: string | null) => void;
}

export default function Sidebar({ 
  isOpen, 
  onClose, 
  categories, 
  selectedCategory, 
  onCategorySelect 
}: SidebarProps) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-80 bg-gradient-to-b from-gray-50 to-white shadow-xl border-r border-gray-200
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Product Categories</h2>
                <p className="text-sm text-gray-500 mt-1">Browse by category</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden hover:bg-gray-100"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              {/* All Categories Button */}
              <div className={`rounded-xl border-2 transition-all duration-200 ${
                !selectedCategory 
                  ? 'bg-gradient-to-r from-primary to-primary-dark border-primary shadow-lg shadow-primary/25' 
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}>
                <Button
                  variant="ghost"
                  className={`w-full justify-between px-5 py-4 font-semibold text-base ${
                    !selectedCategory 
                      ? 'text-white hover:bg-black/10' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => onCategorySelect(null)}
                >
                  <span className="flex items-center">
                    <i className="fas fa-th-large mr-3 text-lg" />
                    All Categories
                  </span>
                  <ChevronUp className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Category List */}
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className={`rounded-lg border transition-all duration-200 ${
                    selectedCategory === category.slug
                      ? 'bg-gradient-to-r from-primary/90 to-primary border-primary shadow-md'
                      : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                  }`}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start px-4 py-3 text-left font-medium transition-colors ${
                        selectedCategory === category.slug
                          ? 'text-white hover:bg-black/10'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => onCategorySelect(category.slug)}
                    >
                      <i className={`${category.icon} mr-3 text-base`} />
                      <span className="truncate">{category.name}</span>
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
