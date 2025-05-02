package ru.arseniy.library.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.arseniy.library.model.Category;

/**
 * DTO для категории с количеством книг
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryWithCountDTO {
    private Integer id;
    private String name;
    private Integer parentCategoryId;
    private Integer bookCount;

    /**
     * Создает DTO из сущности Category
     *
     * @param category сущность Category
     * @param bookCount количество книг в категории
     * @return CategoryWithCountDTO
     */
    public static CategoryWithCountDTO fromEntity(Category category, Integer bookCount) {
        CategoryWithCountDTO dto = new CategoryWithCountDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setParentCategoryId(category.getParentCategory() != null ? 
                               category.getParentCategory().getId() : null);
        dto.setBookCount(bookCount);
        return dto;
    }
} 