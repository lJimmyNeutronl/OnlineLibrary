package ru.arseniy.library.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    
    private String token;
    private String type = "Bearer";
    private Integer id;
    private String email;
    private String firstName;
    private String lastName;
    private String displayName;
    private List<String> roles;
    
    public JwtResponse(String token, Integer id, String email, String firstName, String lastName, String displayName, List<String> roles) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.displayName = displayName;
        this.roles = roles;
    }
}
