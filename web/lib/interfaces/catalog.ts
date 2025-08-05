export interface CatalogProduct {
  id: string;
  name: string;
  price: number | string;
  brand: string;
  category: string;
  image: string;
  images?: string[];
}

export interface CatalogFilters {
  searchTerm: string;
  priceRange: [number, number];
  selectedCategories: string[];
  selectedBrands: string[];
}

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}
