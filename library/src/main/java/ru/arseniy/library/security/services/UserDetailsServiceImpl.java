package ru.arseniy.library.security.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.arseniy.library.model.User;
import ru.arseniy.library.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // В Spring Security метод называется loadUserByUsername, но мы используем email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Пользователь с email " + email + " не найден"));

        return UserDetailsImpl.build(user);
    }
}
