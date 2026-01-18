import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { HeroImage } from "@shared/schema";

// Fallback images in case no hero images are uploaded
const defaultHeroImages = [
  {
    url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800",
    alt: "Professional electrical equipment display"
  },
  {
    url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800",
    alt: "Modern electronics and components"
  },
  {
    url: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=800",
    alt: "Electrical components and wiring"
  }
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch hero images from the database
  const { data: dbHeroImages = [], isLoading } = useQuery<HeroImage[]>({
    queryKey: ['/api/hero-images'],
  });

  // Use uploaded images if available, otherwise fallback to default images
  // But wait for loading to complete to prevent image switching
  const heroImages = !isLoading && dbHeroImages.length > 0 
    ? dbHeroImages
        .filter(img => img.isActive)
        .sort((a, b) => a.order - b.order)
        .map(img => ({
          url: img.imageUrl,
          alt: img.title
        }))
    : defaultHeroImages;

  useEffect(() => {
    if (heroImages.length > 0) {
      // Reset to first slide when images change
      setCurrentSlide(0);
      
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroImages.length);
      }, 4000);

      return () => clearInterval(timer);
    }
  }, [heroImages.length]);

  const scrollToProducts = () => {
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="py-6 md:py-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-r from-gray-900 to-gray-700 text-white group">
          {/* Carousel Images */}
          <div className="relative h-96 md:h-[600px] overflow-hidden">
            {heroImages.map((image, index) => (
              <div
                key={`${image.url}-${index}`}
                className={`carousel-slide absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  backgroundImage: `url(${image.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center 25%',
                  backgroundRepeat: 'no-repeat',
                  minHeight: '100%',
                  height: '100%'
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-700"></div>
              </div>
            ))}
          </div>
          
          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-4 max-w-5xl pointer-events-auto">
              <div className="flex flex-col items-center justify-center mb-4 md:mb-6">
                <h1 className="text-5xl md:text-8xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl italic select-none">
                  ELECTRO<span className="text-orange-500 relative inline-block">
                    LIGHT
                    <span className="absolute inset-0 bg-orange-500 blur-3xl opacity-20 animate-pulse pointer-events-none"></span>
                    <span className="absolute -inset-1 bg-orange-400 blur-lg opacity-10 animate-pulse pointer-events-none"></span>
                  </span>
                </h1>
                <div className="w-32 md:w-48 h-1.5 bg-orange-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.9)] animate-pulse relative">
                  <div className="absolute inset-0 bg-white blur-[2px] opacity-30 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                </div>
              </div>
              
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-2xl md:text-5xl font-extrabold mb-2 tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-400 drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
                  Professional Electrical Solutions
                </h2>
                
                <p className="text-lg md:text-2xl text-gray-100 font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-lg relative">
                  Empowering your projects with premium components and industrial-grade reliability. 
                  <span className="block mt-2 text-orange-400 font-bold tracking-widest text-sm md:text-base uppercase drop-shadow-[0_0_12px_rgba(249,115,22,0.5)]">
                    Residential • Commercial • Industrial
                  </span>
                </p>

                <div className="pt-6">
                  <Button 
                    size="lg"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-6 md:text-xl font-bold uppercase tracking-wider rounded-lg border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 transition-all shadow-[0_10px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_15px_25px_rgba(249,115,22,0.4)]"
                    onClick={scrollToProducts}
                  >
                    Browse Catalog
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
