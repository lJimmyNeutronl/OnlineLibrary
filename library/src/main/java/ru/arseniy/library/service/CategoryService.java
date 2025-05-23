package ru.arseniy.library.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import ru.arseniy.library.model.Category;
import ru.arseniy.library.repository.CategoryRepository;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

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
    
    /**
     * Получает все категории с подсчитанным количеством книг в каждой категории
     * @return Список категорий
     */
    public List<Category> getAllCategoriesWithBookCount() {
        List<Category> categories = categoryRepository.findAll();
        
        // Чтобы не перегружать канал передачи данных, мы возвращаем те же объекты категорий,
        // поскольку количество книг можно получить через getBooks().size()
        return categories;
    }
    
    /**
     * Получает карту с id категорий и количеством книг в каждой категории, включая книги из подкатегорий
     * @return Карта id категории -> количество книг
     */
    public Map<Integer, Integer> getCategoriesBookCount() {
        List<Category> categories = categoryRepository.findAll();
        Map<Integer, Integer> result = new HashMap<>();
        
        // Для каждой категории вычисляем общее количество книг, включая все подкатегории
        for (Category category : categories) {
            // Получаем все книги категории и её подкатегорий (без дубликатов)
            Set<Integer> bookIds = new HashSet<>();
            
            // Сначала добавляем книги из текущей категории
            category.getBooks().forEach(book -> bookIds.add(book.getId()));
            
            // Затем рекурсивно добавляем книги из всех подкатегорий
            getAllSubcategoryBooks(category, bookIds);
            
            // Сохраняем результат
            result.put(category.getId(), bookIds.size());
        }
        
        return result;
    }
    
    /**
     * Рекурсивно собирает ID всех книг из подкатегорий
     *
     * @param category родительская категория
     * @param bookIds множество для накопления ID книг
     */
    private void getAllSubcategoryBooks(Category category, Set<Integer> bookIds) {
        List<Category> subcategories = categoryRepository.findByParentCategoryId(category.getId());
        
        for (Category subcategory : subcategories) {
            // Добавляем книги из текущей подкатегории
            subcategory.getBooks().forEach(book -> bookIds.add(book.getId()));
            
            // Рекурсивно обрабатываем вложенные подкатегории
            getAllSubcategoryBooks(subcategory, bookIds);
        }
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
