package ru.arseniy.library.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.arseniy.library.model.ReadingHistory;

import java.util.Optional;

@Repository
public interface ReadingHistoryRepository extends JpaRepository<ReadingHistory, Integer> {
    
    Page<ReadingHistory> findByUserId(Integer userId, Pageable pageable);
    
    Optional<ReadingHistory> findByUserIdAndBookId(Integer userId, Integer bookId);
}
