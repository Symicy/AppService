package com.example.backend.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserListDTO {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String role;
    private LocalDate createdAt;
}
