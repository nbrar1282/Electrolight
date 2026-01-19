import { useLocation } from "wouter";
import type { Category } from "@shared/schema";

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

  // 3. Slice to ensure max 8
  displayCategories = displayCategories.slice(0, 8);

  // 3. Slice to ensure max 8
  displayCategories = displayCategories.slice(0, 8);

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">Shop by category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayCategories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              className="group block cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Dark overlay for text readability */}
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-opacity duration-300" />
                  
                  {/* Text overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <h3 className="text-white text-lg font-semibold text-center">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}