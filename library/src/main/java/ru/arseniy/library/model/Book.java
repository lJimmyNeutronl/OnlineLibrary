package ru.arseniy.library.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "books")
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
    private Set<Category> categories = new HashSet<>();

    @ManyToMany(mappedBy = "favorites")
    private Set<User> favoritedBy = new HashSet<>();

    @OneToMany(mappedBy = "book", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ReadingHistory> readingHistory = new HashSet<>();
}
