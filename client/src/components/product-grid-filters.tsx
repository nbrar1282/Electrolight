import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Grid, List } from "lucide-react";

interface ProductGridFiltersProps {
  onSortChange?: (sortBy: string) => void;
  onLayoutChange?: (layout: 'grid' | 'list') => void;
}

export default function ProductGridFilters({ onSortChange, onLayoutChange }: ProductGridFiltersProps) {
  const [selectedSort, setSelectedSort] = useState("featured");
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedSort(value);
    onSortChange?.(value);
  };

  const handleLayoutChange = (newLayout: 'grid' | 'list') => {
    setLayout(newLayout);
    onLayoutChange?.(newLayout);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-8">
      <div className="flex items-center space-x-4">
        <select 
          value={selectedSort}
          onChange={handleSortChange}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-2 sm:px-4 py-2 text-sm sm:text-base focus:ring-2 focus:ring-primary focus:border-transparent max-w-48 sm:max-w-none"
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest First</option>
          <option value="name">Name A-Z</option>
          <option value="brand">Brand A-Z</option>
        </select>
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`rounded-l-lg ${layout === 'grid' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => handleLayoutChange('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`rounded-r-lg ${layout === 'list' ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
            onClick={() => handleLayoutChange('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}