package ru.arseniy.library.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Сущность отзыва к книге
 */
@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "creation_date", nullable = false, updatable = false)
    private LocalDateTime creationDate;

    @Column(name = "edited_date")
    private LocalDateTime editedDate;

    /**
     * Метод, вызываемый перед сохранением сущности.
     * Устанавливает дату создания, если она не установлена.
     */
    @PrePersist
    public void prePersist() {
        if (creationDate == null) {
            creationDate = LocalDateTime.now();
        }
    }

    /**
     * Метод, вызываемый перед обновлением сущности.
     * Устанавливает дату редактирования.
     */
    @PreUpdate
    public void preUpdate() {
        editedDate = LocalDateTime.now();
    }
} 