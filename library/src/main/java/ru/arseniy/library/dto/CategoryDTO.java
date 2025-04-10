package ru.arseniy.library.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.arseniy.library.model.Category;

/**
 * DTO для модели Category, исключающее циклические ссылки
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {
    private Integer id;
    private String name;
    private Integer parentCategoryId;
    
    /**
     * Конвертирует модель Category в CategoryDTO
     *
     * @param category модель категории
     * @return DTO категории
     */
    public static CategoryDTO fromEntity(Category category) {
        if (category == null) {
            return null;
        }
        
        CategoryDTO categoryDTO = new CategoryDTO();
        categoryDTO.setId(category.getId());
        categoryDTO.setName(category.getName());
        
        // Избегаем циклической ссылки, сохраняя только ID родительской категории
        if (category.getParentCategory() != null) {
            categoryDTO.setParentCategoryId(category.getParentCategory().getId());
        }
        
        return categoryDTO;
    }
    
    /**
     * Конвертирует CategoryDTO в модель Category
     *
     * @param categoryDTO DTO категории
     * @return модель категории
     */
    public static Category toEntity(CategoryDTO categoryDTO) {
        if (categoryDTO == null) {
            return null;
        }
        
        Category category = new Category();
        category.setId(categoryDTO.getId());
        category.setName(categoryDTO.getName());
        
        // Родительская категория должна быть установлена отдельно
        return category;
    }
} 