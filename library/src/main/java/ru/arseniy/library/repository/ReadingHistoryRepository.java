package ru.arseniy.library.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import ru.arseniy.library.model.ReadingHistory;

import java.util.Optional;

@Repository
public interface ReadingHistoryRepository extends JpaRepository<ReadingHistory, Integer> {
    
    Page<ReadingHistory> findByUserId(Integer userId, Pageable pageable);
    
    Optional<ReadingHistory> findByUserIdAndBookId(Integer userId, Integer bookId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM ReadingHistory rh WHERE rh.user.id = :userId")
    void deleteByUserId(@Param("userId") Integer userId);
}
