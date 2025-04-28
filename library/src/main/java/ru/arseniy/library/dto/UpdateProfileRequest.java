package ru.arseniy.library.dto;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest {
    
    @Size(max = 50, message = "Имя не должно превышать 50 символов")
    private String firstName;
    
    @Size(max = 50, message = "Фамилия не должна превышать 50 символов")
    private String lastName;
} 