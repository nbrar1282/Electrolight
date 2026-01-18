import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ProductModal from "@/components/product-modal";
import MediaDisplay from "@/components/media-display";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ElectricalLoading } from "@/components/ui/electrical-loading";
import { 
  Calendar, 
  MapPin, 
  ArrowLeft, 
  Users, 
  Building, 
  ChevronLeft, 
  ChevronRight,
  Play,
  Eye
} from "lucide-react";
import type { Project, Product } from "@shared/schema";

export default function ProjectDetail() {
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: project, isLoading } = useQuery<Project>({
    queryKey: ['/api/projects', id],
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  // Get products used in this project
  const productsUsed = project?.productsUsed 
    ? products.filter(product => project.productsUsed.includes(product.id))
    : [];

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setLocation(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  // Get all available media (primary + additional + legacy)
  const getAllMedia = () => {
    const media = [];
    if (project?.primaryMediaUrl) {
      media.push(project.primaryMediaUrl);
    }
    if (project?.additionalMediaUrls) {
      media.push(...project.additionalMediaUrls);
    }
    // Fallback to legacy imageUrls for backward compatibility
    if (media.length === 0 && project?.imageUrls) {
      media.push(...project.imageUrls);
    }
    return media;
  };

  const allMedia = getAllMedia();

  const nextImage = () => {
    if (allMedia.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === allMedia.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (allMedia.length > 1) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? allMedia.length - 1 : prev - 1
      );
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-inter">
        <Header 
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onProductSelect={setSelectedProduct}
          selectedBrand={selectedBrand}
          onBrandSelect={setSelectedBrand}
        />
        <main className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="p-8 text-center">
              <ElectricalLoading 
                variant="spark" 
                size="lg" 
                text="Loading project details..."
              />
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-inter">
        <Header 
          searchQuery={searchQuery}
          onSearchChange={handleSearch}
          onProductSelect={setSelectedProduct}
          selectedBrand={selectedBrand}
          onBrandSelect={setSelectedBrand}
        />
        <main className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-6">The project you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation('/projects')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-inter">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        onProductSelect={setSelectedProduct}
        selectedBrand={selectedBrand}
        onBrandSelect={setSelectedBrand}
      />
      
      <main>
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/projects')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </div>

        {/* Project Header */}
        <section className="bg-gradient-to-b from-primary/5 to-transparent py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                {project.category}
              </Badge>

              {project.featured && (
                <Badge className="bg-yellow-500 text-white">Featured Project</Badge>
              )}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              {project.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{project.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>Completed {new Date(project.completedDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                <span>{project.category} Project</span>
              </div>
            </div>
          </div>
        </section>

        {/* Project Media Gallery */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Media Gallery */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Project Gallery</h2>
                <Card className="overflow-hidden">
                  <div className="relative aspect-video">
                    {allMedia.length > 0 ? (
                      <>
                        <MediaDisplay
                          src={allMedia[currentImageIndex]}
                          alt={`${project.title} - Media ${currentImageIndex + 1}`}
                          className="w-full h-full object-cover"
                          controls={true}
                          muted={false}
                          fallbackSrc="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop"
                        />
                        
                        {allMedia.length > 1 && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
                              onClick={prevImage}
                            >
                              <ChevronLeft className="w-6 h-6" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
                              onClick={nextImage}
                            >
                              <ChevronRight className="w-6 h-6" />
                            </Button>
                            
                            {/* Thumbnail Navigation */}
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                              <div className="flex gap-2 bg-black/50 rounded-lg p-2">
                                {allMedia.map((_, index) => (
                                  <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`w-3 h-3 rounded-full transition-all ${
                                      index === currentImageIndex
                                        ? "bg-white w-8"
                                        : "bg-white/50 hover:bg-white/75"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <img
                        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=450&fit=crop"
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </Card>
                
                {/* Media Counter */}
                {allMedia.length > 1 && (
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    {currentImageIndex + 1} of {allMedia.length} media files
                  </p>
                )}
              </div>

              {/* Project Details */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Project Details</h2>
                <Card>
                  <CardContent className="p-6 space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Project Description</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {project.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">
                          Category
                        </h4>
                        <p className="font-semibold">{project.category}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">
                          Location
                        </h4>
                        <p className="font-semibold">{project.location}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground mb-2">
                          Completion Date
                        </h4>
                        <p className="font-semibold">
                          {new Date(project.completedDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Products Used */}
        {productsUsed.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4">Products Used in This Project</h2>
                <p className="text-muted-foreground">
                  Explore the electrical products and components that made this project successful.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsUsed.map((product) => (
                  <Card 
                    key={product.id} 
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="relative overflow-hidden rounded-t-lg">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-2 right-2">
                          <Button size="sm" variant="secondary" className="bg-white/90 text-black hover:bg-white">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      {product.brand && (
                        <Badge variant="outline" className="text-xs">
                          {product.brand}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <Button onClick={() => setLocation('/products')}>
                  View All Products
                </Button>
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