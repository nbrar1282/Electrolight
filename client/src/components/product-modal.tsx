import { Button } from "@/components/ui/button";
import { X, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import type { Product } from "@shared/schema";
import { useState } from "react";

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Combine primary image with additional images
  const allImages = [product.imageUrl, ...(product.imageUrls || [])];

  const handleFavoriteClick = () => {
    toggleFavorite(product.id);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Product Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {/* Main Image Display */}
              <div className="relative group">
                <img 
                  src={allImages[currentImageIndex]} 
                  alt={`${product.name} - Image ${currentImageIndex + 1}`}
                  className="w-full rounded-lg"
                />
                
                {/* Navigation arrows (only show if multiple images) */}
                {allImages.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Thumbnail Gallery (only show if multiple images) */}
              {allImages.length > 1 && (
                <div className="flex gap-2 mt-4 overflow-x-auto">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-blue-500' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`${product.name} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{product.name}</h3>
              
              {/* Brand and Category Info */}
              <div className="flex items-center space-x-2 mb-4">
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
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">{product.description}</p>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Specifications</h4>
                  {product.specificationList && product.specificationList.length > 0 ? (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <tbody>
                          {product.specificationList.slice(0, 5).map((spec, index) => {
                            const [label, value] = spec.includes(' - ') 
                              ? spec.split(' - ', 2) 
                              : spec.includes(': ')
                              ? spec.split(': ', 2)
                              : [spec, '✓'];
                            return (
                              <tr 
                                key={index} 
                                className={`${
                                  index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
                                }`}
                              >
                                <td className="py-2 px-3 font-medium text-gray-900 dark:text-white text-sm">
                                  {label.trim()}
                                </td>
                                <td className="py-2 px-3 text-gray-600 dark:text-gray-300 text-sm">
                                  {value.trim()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      {product.specificationList.length > 5 && (
                        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-center">
                          <span className="text-xs text-gray-600 dark:text-gray-300">
                            +{product.specificationList.length - 5} more specifications - View full details
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Professional grade electrical product with standard industry specifications.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <Button 
                    size="lg"
                    onClick={handleFavoriteClick}
                    className={`flex items-center space-x-2 transition-colors ${
                      isFavorite(product.id) 
                        ? 'bg-red-500 hover:bg-red-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <Heart 
                      className={`h-5 w-5 ${
                        isFavorite(product.id) ? 'fill-white' : ''
                      }`}
                    />
                    <span>
                      {isFavorite(product.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.location.href = `/product/${product.id}`}
                  >
                    View Full Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
