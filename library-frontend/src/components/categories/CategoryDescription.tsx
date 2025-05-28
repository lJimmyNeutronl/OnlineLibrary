import { memo } from 'react';
import { pluralizeBooks } from '../../utils/pluralization';
import { categoryStyles } from '../../styles/categories';

interface CategoryDescriptionProps {
  name: string;
  bookCount: number;
  isSubcategory?: boolean;
}

const CategoryDescription = memo(({ name, bookCount, isSubcategory = false }: CategoryDescriptionProps) => (
  <div>
    <h3 style={isSubcategory ? categoryStyles.subcategoryTitle : categoryStyles.categoryTitle}>
      {name}
    </h3>
    <p style={isSubcategory ? categoryStyles.subcategoryBookCountText : categoryStyles.bookCountText}>
      {bookCount} {pluralizeBooks(bookCount)}
    </p>
  </div>
));

CategoryDescription.displayName = 'CategoryDescription';

export default CategoryDescription; 