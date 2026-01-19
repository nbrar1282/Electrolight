import { useLocation } from "wouter";
import type { Category } from "@shared/schema";
import { Zap } from "lucide-react";

interface CategoryNavProps {
  categories: Category[];
}

export default function CategoryNav({ categories }: CategoryNavProps) {
  const [, setLocation] = useLocation();

  const handleCategoryClick = (slug: string) => {
    setLocation(`/products?category=${slug}`);
    window.scrollTo(0, 0);
  };

  // Logic to filter and limit categories
  // 1. Get featured categories
  let displayCategories = categories.filter(cat => cat.featured);

  // 2. If no categories are marked featured, fall back to showing the first 8 of all categories
  if (displayCategories.length === 0) {
    displayCategories = categories;
  }

  // 3. Slice to ensure max 8
  displayCategories = displayCategories.slice(0, 8);

  return (
    <section className="py-20 bg-[#f8fafc] dark:bg-[#020617] relative overflow-hidden">
      {/* Decorative electrical background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-20" />
      <div className="absolute top-0 left-1/4 w-px h-20 bg-gradient-to-b from-primary/40 to-transparent opacity-10" />
      <div className="absolute top-0 right-1/4 w-px h-20 bg-gradient-to-b from-primary/40 to-transparent opacity-10" />

      <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col items-center mb-16">
          <div className="inline-flex items-center justify-center p-2 mb-4 rounded-full bg-primary/10 text-primary">
            <Zap className="h-5 w-5 animate-pulse" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-center tracking-tight text-slate-900 dark:text-white uppercase">
            Product <span className="text-primary">Categories</span>
          </h2>
          <div className="w-24 h-1 bg-primary mt-6 rounded-full" />
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              className="group relative cursor-pointer"
            >
              <div className="relative aspect-[1/1] overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-800 border-2 border-transparent group-hover:border-primary/50 transition-all duration-500 shadow-xl group-hover:shadow-primary/20">
                {/* Background Image */}
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700"
                />
                
                {/* Modern overlay system */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                
                {/* Circuit pattern overlay (simplified visual) */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                {/* Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end items-center text-center">
                  <div className="mb-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="inline-block px-3 py-1 bg-primary/90 text-[10px] font-bold text-white rounded uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      Explore
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white tracking-wide drop-shadow-md">
                    {category.name}
                  </h3>
                  <div className="w-0 group-hover:w-full h-0.5 bg-primary mt-3 transition-all duration-500" />
                </div>
                
                {/* Corner accents */}
                <div className="absolute top-4 right-4 h-8 w-8 border-t-2 border-r-2 border-white/20 group-hover:border-primary transition-colors duration-500" />
                <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-white/20 group-hover:border-primary transition-colors duration-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}