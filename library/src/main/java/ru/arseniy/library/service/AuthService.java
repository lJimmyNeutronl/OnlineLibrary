package ru.arseniy.library.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import ru.arseniy.library.dto.JwtResponse;
import ru.arseniy.library.dto.LoginRequest;
import ru.arseniy.library.dto.MessageResponse;
import ru.arseniy.library.dto.SignupRequest;
import ru.arseniy.library.model.Role;
import ru.arseniy.library.model.User;
import ru.arseniy.library.repository.RoleRepository;
import ru.arseniy.library.repository.UserRepository;
import ru.arseniy.library.security.jwt.JwtUtils;
import ru.arseniy.library.security.services.UserDetailsImpl;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class AuthService {
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());
        
        // Обновление времени последнего входа
        User user = userRepository.findByEmail(userDetails.getEmail()).orElseThrow();
        user.setLastLoginDate(LocalDateTime.now());
        userRepository.save(user);

        return new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getFirstName(),
                userDetails.getLastName(),
                userDetails.getDisplayName(),
                roles);
    }

    public MessageResponse registerUser(SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return new MessageResponse("Ошибка: Email уже используется!");
        }

        // Создание нового аккаунта пользователя
        User user = new User();
        user.setEmail(signUpRequest.getEmail());
        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setRegistrationDate(LocalDateTime.now());

        Set<String> strRoles = signUpRequest.getRoles();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            Role userRole = roleRepository.findByName("ROLE_USER")
                    .orElseThrow(() -> new RuntimeException("Ошибка: Роль не найдена."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    case "admin":
                        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                                .orElseThrow(() -> new RuntimeException("Ошибка: Роль не найдена."));
                        roles.add(adminRole);
                        break;
                    default:
                        Role userRole = roleRepository.findByName("ROLE_USER")
                                .orElseThrow(() -> new RuntimeException("Ошибка: Роль не найдена."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user);

        return new MessageResponse("Пользователь успешно зарегистрирован!");
    }
}
