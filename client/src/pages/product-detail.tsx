import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProductModal from "@/components/product-modal";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useQuery } from "@tanstack/react-query";
import type { Product, Accessory } from "@shared/schema";

export default function ProductDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['/api/products', id],
    enabled: !!id,
  });

  // Get accessories for this product
  const { data: accessoriesData = [] } = useQuery<Accessory[]>({
    queryKey: ['/api/accessories'],
    enabled: !!product,
  });

  // Get AI-generated similar products
  const { data: aiSimilarProducts = [] } = useQuery<Product[]>({
    queryKey: ['/api/products', id, 'similar'],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header 
          searchQuery=""
          onSearchChange={() => {}}
          onProductSelect={setSelectedProduct}
          selectedBrand={null}
          onBrandSelect={undefined}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header 
          searchQuery=""
          onSearchChange={() => {}}
          onProductSelect={setSelectedProduct}
          selectedBrand={null}
          onBrandSelect={undefined}
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Product Not Found</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">The product you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation('/products')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.some(fav => fav.productId === product.id);
  const allImages = [product.imageUrl, ...(product.imageUrls || [])];

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  // Get accessories that are compatible with this product
  const compatibleAccessories = accessoriesData.filter(accessory => {
    // First check if accessory is specifically assigned to this product
    if (product.accessories?.includes(accessory.id)) {
      return true;
    }
    
    // Also check if accessory is compatible with this product's category
    const compatibleWith = accessory.compatibleWith || [];
    return compatibleWith.includes(product.categorySlug);
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        searchQuery=""
        onSearchChange={() => {}}
        onProductSelect={setSelectedProduct}
        selectedBrand={null}
        onBrandSelect={undefined}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/products')}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images - Left Side */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
              <img
                src={allImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index 
                        ? 'border-primary' 
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} - View ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information - Right Side */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 transition-all px-3 py-1 text-xs uppercase tracking-wider font-bold rounded-md">
                  {product.categorySlug.replace(/-/g, ' ')}
                </Badge>
                {product.brand && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">|</span>
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                      {product.brand}
                    </span>
                  </>
                )}
                <div className="flex-1"></div>
                {product.featured && (
                  <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none shadow-sm px-3 py-1 rounded-md text-xs uppercase font-black tracking-tighter italic">
                    Featured
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
                {product.name}
              </h1>
              
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleFavoriteToggle}
                variant={isFavorite ? "default" : "outline"}
                size="lg"
                className="flex-1"
              >
                <Heart className={`mr-2 h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </Button>
              
              <Button
                onClick={() => setSelectedProduct(product)}
                variant="outline"
                size="lg"
              >
                <Eye className="mr-2 h-5 w-5" />
                Quick Look
              </Button>
            </div>
          </div>
        </div>

        {/* Technical Specifications Section - Full Width Below */}
        <section className="mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Technical Specifications</h2>
            </div>
            
            <div className="p-0">
              {/* Specifications table */}
              {product.specificationList && product.specificationList.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <tbody>
                      {product.specificationList.map((spec, index) => {
                        const [label, value] = spec.includes(' - ') 
                          ? spec.split(' - ', 2) 
                          : spec.includes(': ')
                          ? spec.split(': ', 2)
                          : [spec, '✓'];
                        return (
                          <tr 
                            key={index} 
                            className={`border-b border-gray-200 dark:border-gray-600 ${
                              index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'
                            }`}
                          >
                            <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white w-1/3">
                              {label.trim()}
                            </td>
                            <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                              {value.trim()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Compatible Accessories Section */}
        {compatibleAccessories.length > 0 && (
          <section className="mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Compatible Accessories</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Product</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Model</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compatibleAccessories.map((accessory, index) => (
                      <tr 
                        key={accessory.id} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                          index !== compatibleAccessories.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                        }`}
                        onClick={() => setLocation(`/product/${accessory.id}`)}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                              <img 
                                src={accessory.imageUrl} 
                                alt={accessory.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{accessory.name}</h4>
                              {accessory.brand && (
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{accessory.brand}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{accessory.modelNumber}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-600 dark:text-gray-300">{accessory.description}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* AI-Generated Similar Products Section */}
        {aiSimilarProducts.length > 0 && (
          <section>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Similar Products</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Product</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Category</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiSimilarProducts.map((similarProduct, index) => (
                      <tr 
                        key={similarProduct.id} 
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                          index !== aiSimilarProducts.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''
                        }`}
                        onClick={() => setLocation(`/product/${similarProduct.id}`)}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                              <img 
                                src={similarProduct.imageUrl} 
                                alt={similarProduct.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{similarProduct.name}</h4>
                              {similarProduct.brand && (
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{similarProduct.brand}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge variant="outline" className="text-xs">
                            {similarProduct.categorySlug.replace(/-/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-600 dark:text-gray-300">{similarProduct.description}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
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