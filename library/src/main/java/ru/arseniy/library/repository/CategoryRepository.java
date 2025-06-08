package ru.arseniy.library.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.arseniy.library.model.Category;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Integer> {
    
    Optional<Category> findByName(String name);
    
    List<Category> findByParentCategoryIsNull();
    
    List<Category> findByParentCategoryId(Integer parentCategoryId);
    
    List<Category> findByParentCategoryIsNotNull();
}
