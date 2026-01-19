import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Eye } from "lucide-react";
import MediaDisplay from "@/components/media-display";
import type { Project } from "@shared/schema";

export default function ProjectsCarousel() {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const { data: allProjects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Filter to featured projects only for the carousel
  const projects = allProjects.filter(project => project.featured);

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying || projects.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === projects.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, projects.length]);

  const goToPrevious = () => {
    if (projects.length === 0) return;
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === 0 ? projects.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    if (projects.length === 0) return;
    setIsAutoPlaying(false);
    setCurrentIndex(currentIndex === projects.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  // FIX: Handle navigation with a delayed scroll to ensure it works
  const handleViewAllProjects = () => {
    setLocation('/projects');
    
    // Small delay ensures the new page renders before we try to scroll
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 100);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Recent Projects
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Loading our latest electrical installations...
            </p>
          </div>
          <Card className="h-[500px] md:h-[600px] flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading projects...</p>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  if (projects.length === 0) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Recent Projects
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              No featured projects available at the moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Recent Projects
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our latest electrical installations and upgrades. From commercial buildings to smart homes, 
            see how ElectroLight delivers professional electrical solutions that power modern life.
          </p>
        </div>

        {/* Main Carousel */}
        <div className="relative">
          <Card className="overflow-hidden bg-card border shadow-lg">
            <div className="relative h-[500px] md:h-[600px]">
              {/* Project Media */}
              <div className="absolute inset-0">
                <MediaDisplay
                  src={projects[currentIndex].primaryMediaUrl || projects[currentIndex].imageUrls?.[0] || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop"}
                  alt={projects[currentIndex].title}
                  className="w-full h-full object-cover"
                  autoPlay={true}
                  muted={true}
                  controls={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              </div>

              {/* Project Content Overlay - Minimal on mobile */}
              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 text-white">
                <div className="max-w-4xl">
                  <h3 
                    className="text-lg md:text-3xl font-bold mb-1 md:mb-3 leading-tight cursor-pointer hover:text-primary-foreground/90 transition-colors"
                    onClick={() => setLocation(`/project/${projects[currentIndex].id}`)}
                  >
                    {projects[currentIndex].title}
                  </h3>

                  {/* Description hidden on mobile */}
                  <p className="hidden md:block text-lg text-gray-200 mb-4 leading-relaxed max-w-3xl">
                    {projects[currentIndex].description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4">
                    {/* Location and date hidden on mobile */}
                    <div className="hidden md:flex flex-wrap items-center gap-4 text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{projects[currentIndex].location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Completed {new Date(projects[currentIndex].completedDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setLocation(`/project/${projects[currentIndex].id}`)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm md:text-base"
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Project
                    </Button>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows */}
              {projects.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white border-white/20"
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white border-white/20"
                    onClick={goToNext}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* Slide Indicators */}
          {projects.length > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {projects.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-primary w-8"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Projects Button */}
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            onClick={handleViewAllProjects}
            className="bg-background hover:bg-muted"
          >
            View All Projects
          </Button>
        </div>
      </div>
    </section>
  );
}