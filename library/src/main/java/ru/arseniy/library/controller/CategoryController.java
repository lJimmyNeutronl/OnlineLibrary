package ru.arseniy.library.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import ru.arseniy.library.dto.CategoryDTO;
import ru.arseniy.library.dto.CategoryWithCountDTO;
import ru.arseniy.library.model.Category;
import ru.arseniy.library.service.CategoryService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    
    @Autowired
    private CategoryService categoryService;
    
    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String isRoot) {
        
        List<Category> categories;
        
        // Фильтрация по типу категории
        if ("true".equals(isRoot)) {
            categories = categoryService.getRootCategories();
        } else if ("false".equals(isRoot)) {
            categories = categoryService.getAllSubcategories();
        } else {
            categories = categoryService.getAllCategories();
        }
        
        // Фильтрация по поисковому запросу
        if (q != null && !q.trim().isEmpty()) {
            String searchQuery = q.toLowerCase().trim();
            categories = categories.stream()
                    .filter(category -> category.getName().toLowerCase().contains(searchQuery))
                    .collect(Collectors.toList());
        }
        
        List<CategoryDTO> categoryDTOs = categories.stream()
                .map(CategoryDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categoryDTOs);
    }
    
    @GetMapping("/book-count")
    public ResponseEntity<List<CategoryWithCountDTO>> getCategoriesWithBookCount(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String isRoot) {
        
        Map<Integer, Integer> bookCountMap = categoryService.getCategoriesBookCount();
        List<Category> categories;
        
        // Фильтрация по типу категории
        if ("true".equals(isRoot)) {
            categories = categoryService.getRootCategories();
        } else if ("false".equals(isRoot)) {
            categories = categoryService.getAllSubcategories();
        } else {
            categories = categoryService.getAllCategories();
        }
        
        // Фильтрация по поисковому запросу
        if (q != null && !q.trim().isEmpty()) {
            String searchQuery = q.toLowerCase().trim();
            categories = categories.stream()
                    .filter(category -> category.getName().toLowerCase().contains(searchQuery))
                    .collect(Collectors.toList());
        }
        
        List<CategoryWithCountDTO> result = categories.stream()
                .map(category -> CategoryWithCountDTO.fromEntity(
                    category, 
                    bookCountMap.getOrDefault(category.getId(), 0))
                )
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/root")
    public ResponseEntity<List<CategoryDTO>> getRootCategories() {
        List<Category> rootCategories = categoryService.getRootCategories();
        List<CategoryDTO> categoryDTOs = rootCategories.stream()
                .map(CategoryDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categoryDTOs);
    }
    
    @GetMapping("/{id}/subcategories")
    public ResponseEntity<List<CategoryDTO>> getSubcategories(@PathVariable Integer id) {
        List<Category> subcategories = categoryService.getSubcategories(id);
        List<CategoryDTO> categoryDTOs = subcategories.stream()
                .map(CategoryDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(categoryDTOs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Integer id) {
        Category category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(CategoryDTO.fromEntity(category));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<CategoryDTO> createCategory(
            @RequestBody CategoryDTO categoryDTO,
            @RequestParam(required = false) Integer parentId) {
        
        Category category = CategoryDTO.toEntity(categoryDTO);
        Category createdCategory = categoryService.createCategory(category, parentId);
        return ResponseEntity.ok(CategoryDTO.fromEntity(createdCategory));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<CategoryDTO> updateCategory(
            @PathVariable Integer id,
            @RequestBody CategoryDTO categoryDTO,
            @RequestParam(required = false) Integer parentId) {
        
        Category category = CategoryDTO.toEntity(categoryDTO);
        Category updatedCategory = categoryService.updateCategory(id, category, parentId);
        return ResponseEntity.ok(CategoryDTO.fromEntity(updatedCategory));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERADMIN')")
    public ResponseEntity<?> deleteCategory(@PathVariable Integer id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }
}
