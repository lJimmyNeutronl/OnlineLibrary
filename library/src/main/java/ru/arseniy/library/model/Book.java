package ru.arseniy.library.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import lombok.EqualsAndHashCode;

@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "books")
@EqualsAndHashCode(exclude = {"categories", "favoritedBy", "readingHistory"})
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    private String description;

    private String isbn;

    @Column(name = "publication_year")
    private Integer publicationYear;

    private String publisher;

    private String language;

    @Column(name = "page_count")
    private Integer pageCount;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "cover_image_url")
    private String coverImageUrl;

    @Column(name = "upload_date", nullable = false)
    private LocalDateTime uploadDate;

    @ManyToMany
    @JoinTable(
            name = "book_categories",
            joinColumns = @JoinColumn(name = "book_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    @JsonManagedReference
    private Set<Category> categories = new HashSet<>();

    @ManyToMany(mappedBy = "favorites")
    @JsonBackReference
    private Set<User> favoritedBy = new HashSet<>();

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference
    private Set<ReadingHistory> readingHistory = new HashSet<>();
    
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getAuthor() {
        return author;
    }
    
    public void setAuthor(String author) {
        this.author = author;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getIsbn() {
        return isbn;
    }
    
    public void setIsbn(String isbn) {
        this.isbn = isbn;
    }
    
    public Integer getPublicationYear() {
        return publicationYear;
    }
    
    public void setPublicationYear(Integer publicationYear) {
        this.publicationYear = publicationYear;
    }
    
    public String getPublisher() {
        return publisher;
    }
    
    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public void setLanguage(String language) {
        this.language = language;
    }
    
    public Integer getPageCount() {
        return pageCount;
    }
    
    public void setPageCount(Integer pageCount) {
        this.pageCount = pageCount;
    }
    
    public String getFileUrl() {
        return fileUrl;
    }
    
    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }
    
    public String getCoverImageUrl() {
        return coverImageUrl;
    }
    
    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = coverImageUrl;
    }
    
    public LocalDateTime getUploadDate() {
        return uploadDate;
    }
    
    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }
    
    public Set<Category> getCategories() {
        return categories;
    }
    
    public void setCategories(Set<Category> categories) {
        this.categories = categories;
    }
    
    public Set<User> getFavoritedBy() {
        return favoritedBy;
    }
    
    public void setFavoritedBy(Set<User> favoritedBy) {
        this.favoritedBy = favoritedBy;
    }
    
    public Set<ReadingHistory> getReadingHistory() {
        return readingHistory;
    }
    
    public void setReadingHistory(Set<ReadingHistory> readingHistory) {
        this.readingHistory = readingHistory;
    }
}
