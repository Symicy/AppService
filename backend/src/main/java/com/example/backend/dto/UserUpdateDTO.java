package com.example.backend.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
public class UserUpdateDTO {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String role;
    private LocalDate createdAt;
    
    // Constructor pentru a crea un UserUpdateDTO dintr-un User
    public UserUpdateDTO(Long id, String username, String email, String phone, String role, LocalDate createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.createdAt = createdAt;
    }
}
