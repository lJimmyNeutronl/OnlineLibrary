package ru.arseniy.library.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChangePasswordRequest {
    
    @NotBlank(message = "Текущий пароль обязателен")
    private String currentPassword;
    
    @NotBlank(message = "Новый пароль обязателен")
    @Size(min = 6, message = "Новый пароль должен содержать минимум 6 символов")
    private String newPassword;
} 