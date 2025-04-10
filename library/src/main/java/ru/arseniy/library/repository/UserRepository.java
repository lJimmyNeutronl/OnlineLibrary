package ru.arseniy.library.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.arseniy.library.model.User;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    
    Optional<User> findByEmail(String email);
    
    Boolean existsByEmail(String email);
}
