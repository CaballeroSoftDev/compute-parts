export interface CatalogProduct {
  id: number;
  name: string;
  price: number;
  brand: string;
  category: string;
  image: string;
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
