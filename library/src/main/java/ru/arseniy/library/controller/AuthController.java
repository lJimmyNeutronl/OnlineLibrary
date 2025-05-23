package ru.arseniy.library.controller;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.arseniy.library.dto.JwtResponse;
import ru.arseniy.library.dto.LoginRequest;
import ru.arseniy.library.dto.MessageResponse;
import ru.arseniy.library.dto.SignupRequest;
import ru.arseniy.library.service.AuthService;

@CrossOrigin(origins = "http://localhost:5173", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }
    
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        MessageResponse response = authService.registerUser(signUpRequest);
        
        if (response.getMessage().startsWith("Ошибка")) {
            return ResponseEntity.badRequest().body(response);
        }
        
        return ResponseEntity.ok(response);
    }
}
