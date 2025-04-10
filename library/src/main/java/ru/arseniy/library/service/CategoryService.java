package ru.arseniy.library.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.arseniy.library.model.Category;
import ru.arseniy.library.repository.CategoryRepository;

import java.util.List;

@Service
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    public List<Category> getRootCategories() {
        return categoryRepository.findByParentCategoryIsNull();
    }
    
    public List<Category> getSubcategories(Integer parentId) {
        return categoryRepository.findByParentCategoryId(parentId);
    }
    
    public Category getCategoryById(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Категория с ID " + id + " не найдена"));
    }
    
    public Category createCategory(Category category, Integer parentId) {
        if (parentId != null) {
            Category parentCategory = categoryRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Родительская категория с ID " + parentId + " не найдена"));
            category.setParentCategory(parentCategory);
        }
        
        return categoryRepository.save(category);
    }
    
    public Category updateCategory(Integer id, Category categoryDetails, Integer parentId) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Категория с ID " + id + " не найдена"));
        
        category.setName(categoryDetails.getName());
        
        if (parentId != null) {
            Category parentCategory = categoryRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Родительская категория с ID " + parentId + " не найдена"));
            category.setParentCategory(parentCategory);
        } else {
            category.setParentCategory(null);
        }
        
        return categoryRepository.save(category);
    }
    
    public void deleteCategory(Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Категория с ID " + id + " не найдена"));
        
        categoryRepository.delete(category);
    }
}
