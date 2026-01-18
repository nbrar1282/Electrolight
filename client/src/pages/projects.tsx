import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import MediaDisplay from "@/components/media-display";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ElectricalLoading } from "@/components/ui/electrical-loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Search, Filter, Eye } from "lucide-react";
import type { Project, Product } from "@shared/schema";

export default function Projects() {
  const [, setLocation] = useLocation();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState("");

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Filter projects based on category and search
  const filteredProjects = projects.filter(project => {
    const matchesCategory = categoryFilter === "all" || project.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch = !searchFilter || 
      project.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      project.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      project.location.toLowerCase().includes(searchFilter.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const categories = Array.from(new Set(projects.map(p => p.category)));

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setLocation(`/products?search=${encodeURIComponent(query)}`);
    }
  };

  const handleProjectClick = (projectId: string) => {
    setLocation(`/project/${projectId}`);
  };

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
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-transparent py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our Projects
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore ElectroLight's portfolio of successful electrical installations. From commercial buildings to 
              smart homes, see how we deliver innovative electrical solutions that meet our clients' unique needs.
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Input
                    placeholder="Search projects..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                </div>

                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-muted-foreground">
                Showing {filteredProjects.length} of {projects.length} projects
              </div>
            </div>
          </div>
        </section>

        {/* Projects Grid */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="p-6">
                    <ElectricalLoading 
                      variant="circuit" 
                      size="md" 
                      text="Loading projects..."
                    />
                  </Card>
                ))}
              </div>
            ) : filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project) => (
                  <Card 
                    key={project.id} 
                    className="group cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                    onClick={() => handleProjectClick(project.id)}
                  >
                    <div className="relative overflow-hidden rounded-t-lg">
                      <MediaDisplay
                        src={project.primaryMediaUrl || project.imageUrls?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop"}
                        alt={project.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        autoPlay={false}
                        muted={true}
                        controls={false}
                        showPlayButton={false}
                        hoverToPlay={true}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 right-4">
                          <Button size="sm" variant="secondary" className="bg-white/90 text-black hover:bg-white">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                      

                      
                      {project.featured && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-yellow-500 text-white">Featured</Badge>
                        </div>
                      )}
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {project.description}
                      </p>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{project.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Completed {new Date(project.completedDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long' 
                          })}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t">
                        <Badge variant="outline" className="text-xs">
                          {project.category}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your search or filter criteria to find more projects.
                </p>
                <Button onClick={() => {
                  setSearchFilter("");
                  setCategoryFilter("all");
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}