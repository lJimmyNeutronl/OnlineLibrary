package ru.arseniy.library.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

import lombok.EqualsAndHashCode;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "categories")
@EqualsAndHashCode(exclude = {"parentCategory", "childCategories", "books"})
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @ManyToOne
    @JoinColumn(name = "parent_category_id")
    @JsonBackReference
    private Category parentCategory;

    @OneToMany(mappedBy = "parentCategory")
    @JsonManagedReference
    private Set<Category> childCategories = new HashSet<>();

    @ManyToMany(mappedBy = "categories")
    @JsonBackReference
    private Set<Book> books = new HashSet<>();
    
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Category getParentCategory() {
        return parentCategory;
    }
    
    public void setParentCategory(Category parentCategory) {
        this.parentCategory = parentCategory;
    }
    
    public Set<Category> getChildCategories() {
        return childCategories;
    }
    
    public void setChildCategories(Set<Category> childCategories) {
        this.childCategories = childCategories;
    }
    
    public Set<Book> getBooks() {
        return books;
    }
    
    public void setBooks(Set<Book> books) {
        this.books = books;
    }
}
