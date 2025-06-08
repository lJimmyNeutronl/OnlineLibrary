export interface Category {
  id: number;
  name: string;
  parentCategoryId: number | null;
}

export interface CategoryWithCount extends Category {
  bookCount: number;
}

export interface CategoryWithSubcategories extends Category {
  subcategories: Category[];
} 