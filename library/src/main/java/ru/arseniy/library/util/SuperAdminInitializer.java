package ru.arseniy.library.util;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.arseniy.library.model.Role;
import ru.arseniy.library.model.RoleType;
import ru.arseniy.library.model.User;
import ru.arseniy.library.repository.RoleRepository;
import ru.arseniy.library.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * Инициализатор для создания единственного суперадмина в системе.
 * Выполняется при старте приложения с высоким приоритетом.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(1) // Выполняется перед другими CommandLineRunner
public class SuperAdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        initializeSuperAdmin();
    }

    /**
     * Создает единственного суперадмина в системе, если он еще не существует
     */
    private void initializeSuperAdmin() {
        try {
            // Проверяем, существует ли уже суперадмин
            Role superAdminRole = roleRepository.findByName(RoleType.ROLE_SUPERADMIN.getName())
                    .orElseThrow(() -> new RuntimeException("Роль SUPERADMIN не найдена в базе данных"));

            boolean superAdminExists = userRepository.findAll().stream()
                    .anyMatch(user -> user.getRoles().contains(superAdminRole));

            if (superAdminExists) {
                log.info("Суперадмин уже существует в системе");
                return;
            }

            // Создаем суперадмина
            User superAdmin = new User();
            superAdmin.setEmail("superadmin@library.com");
            superAdmin.setPassword(passwordEncoder.encode("SuperAdmin123!"));
            superAdmin.setFirstName("Super");
            superAdmin.setLastName("Admin");
            superAdmin.setRegistrationDate(LocalDateTime.now());
            superAdmin.setRoles(Set.of(superAdminRole));

            userRepository.save(superAdmin);

            log.info("Суперадмин успешно создан:");
            log.info("Email: superadmin@library.com");
            log.info("Password: SuperAdmin123!");
            log.warn("ВАЖНО: Обязательно смените пароль суперадмина после первого входа!");

        } catch (Exception e) {
            log.error("Ошибка при создании суперадмина: {}", e.getMessage(), e);
            throw new RuntimeException("Не удалось инициализировать суперадмина", e);
        }
    }
} 