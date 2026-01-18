import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";
import { useFavorites } from "@/hooks/useFavorites";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";

interface FavoritesModalProps {
  onProductSelect: (product: Product) => void;
}

export default function FavoritesModal({ onProductSelect }: FavoritesModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { favorites, removeFromFavorites, getFavoriteCount } = useFavorites();
  const favoriteCount = getFavoriteCount();

  // Fetch all products to get details for favorited items
  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Filter products to show only favorites
  const favoriteProducts = allProducts.filter(product =>
    favorites.some(fav => fav.productId === product.id)
  );

  const handleProductClick = (product: Product) => {
    setIsOpen(false);
    onProductSelect(product);
  };

  const handleRemoveFavorite = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    removeFromFavorites(productId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="View Favorites" className="relative">
          <Heart className="h-5 w-5" />
          {favoriteCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {favoriteCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-red-500" />
            <span>My Favorites ({favoriteCount})</span>
          </DialogTitle>
        </DialogHeader>
        
        {favoriteProducts.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-500">
              Start browsing products and click the heart icon to add them to your favorites!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer relative"
                onClick={() => handleProductClick(product)}
              >
                <div className="relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-t-lg"
                  />
                  <button
                    onClick={(e) => handleRemoveFavorite(e, product.id)}
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
                    title="Remove from favorites"
                  >
                    <X className="h-4 w-4 text-gray-500 hover:text-red-500" />
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">${product.price}</span>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}