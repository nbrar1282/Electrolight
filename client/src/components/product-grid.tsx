import { Button } from "@/components/ui/button";
import { Grid, List, Heart, Eye } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import type { Product } from "@shared/schema";

interface ProductGridProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  layout?: 'grid' | 'list';
}

export default function ProductGrid({ products, onProductSelect, layout = 'grid' }: ProductGridProps) {
  const { toggleFavorite, isFavorite } = useFavorites();

  const handleFavoriteClick = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation(); // Prevent product modal from opening
    toggleFavorite(productId);
  };

  if (layout === 'list') {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="product-card bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer flex"
            onClick={() => onProductSelect(product)}
          >
            <div className="relative w-32 sm:w-48 h-24 sm:h-32 flex-shrink-0">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover rounded-l-lg"
              />
              <button
                onClick={(e) => handleFavoriteClick(e, product.id)}
                className="absolute top-2 right-2 p-1 bg-white dark:bg-gray-700 rounded-full shadow-md hover:shadow-lg transition-all group"
                title={isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart 
                  className={`h-4 w-4 transition-colors ${
                    isFavorite(product.id) 
                      ? 'text-red-500 fill-red-500' 
                      : 'text-gray-400 group-hover:text-red-500'
                  }`}
                />
              </button>
            </div>
            <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{product.name}</h3>
                
              {/* Brand and Category for List View */}
              <div className="flex items-center space-x-2 mb-2">
                {product.categorySlug && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 rounded-md">
                    {product.categorySlug.replace(/-/g, ' ')}
                  </span>
                )}
                {product.brand && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span className="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-400 tracking-widest italic">
                      {product.brand}
                    </span>
                  </>
                )}
              </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{product.description}</p>
              </div>
              <div className="flex justify-between items-center">
                {product.featured && (
                  <span className="text-sm bg-primary text-white px-2 py-1 rounded-md font-medium">Featured</span>
                )}
                <Button 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteClick(e, product.id);
                  }}
                  variant={isFavorite(product.id) ? "default" : "outline"}
                  className="bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/90"
                >
                  <Heart className={`mr-1 sm:mr-2 h-4 w-4 ${isFavorite(product.id) ? 'fill-white' : ''}`} />
                  <span className="hidden sm:inline">{isFavorite(product.id) ? 'Favorited' : 'Add to Favorites'}</span>
                  <span className="sm:hidden">{isFavorite(product.id) ? 'Saved' : 'Save'}</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="product-card bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer relative flex flex-col h-full"
            onClick={() => onProductSelect(product)}
          >
            <div className="relative">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <button
                onClick={(e) => handleFavoriteClick(e, product.id)}
                className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-700 rounded-full shadow-md hover:shadow-lg transition-all group"
                title={isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart 
                  className={`h-5 w-5 transition-colors ${
                    isFavorite(product.id) 
                      ? 'text-red-500 fill-red-500' 
                      : 'text-gray-400 group-hover:text-red-500'
                  }`}
                />
              </button>
            </div>
            <div className="p-4 flex flex-col flex-grow">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{product.name}</h3>
              
              {/* Brand and Category for Grid View */}
              <div className="flex items-center space-x-2 mb-2">
                {product.categorySlug && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 rounded-md">
                    {product.categorySlug.replace(/-/g, ' ')}
                  </span>
                )}
                {product.brand && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span className="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-400 tracking-widest italic">
                      {product.brand}
                    </span>
                  </>
                )}
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-3 flex-grow">{product.description}</p>
              
              {/* Action buttons at bottom */}
              <div className="flex justify-between items-center mt-auto">
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onProductSelect(product);
                    }}
                    className="p-2"
                    title="Quick look"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/product/${product.id}`;
                  }}
                  className="bg-primary hover:bg-primary-dark text-white px-2 sm:px-3 py-1 text-xs h-8"
                >
                  <span className="hidden sm:inline">View Details</span>
                  <span className="sm:hidden">Details</span>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>



      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
