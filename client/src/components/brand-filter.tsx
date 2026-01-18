import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface BrandFilterProps {
  selectedBrand: string | null;
  onBrandSelect?: (brand: string | null) => void;
}

interface Brand {
  id: string;
  name: string;
  description: string;
  website: string;
  isActive: boolean;
}

export default function BrandFilter({ selectedBrand, onBrandSelect }: BrandFilterProps) {
  const [, setLocation] = useLocation();

  // Fetch brands from API
  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ['/api/brands'],
  });

  const handleBrandSelect = (brand: string | null) => {
    if (onBrandSelect) {
      // If we're on the products page, use the callback
      onBrandSelect(brand);
    } else {
      // If we're on the home page, redirect to products page
      if (brand) {
        setLocation(`/products?brand=${encodeURIComponent(brand)}`);
      } else {
        setLocation('/products');
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Building2 className="h-4 w-4" />
          {selectedBrand || "Brands"}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => handleBrandSelect(null)}>
          <span className={!selectedBrand ? "font-semibold" : ""}>All Brands</span>
        </DropdownMenuItem>
        {brands.map((brand) => (
          <DropdownMenuItem 
            key={brand.id} 
            onClick={() => handleBrandSelect(brand.name)}
          >
            <span className={selectedBrand === brand.name ? "font-semibold" : ""}>{brand.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}