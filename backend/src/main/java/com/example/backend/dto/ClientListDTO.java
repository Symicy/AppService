package com.example.backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClientListDTO {
    private Long id;
    private String name;
    private String surname;
    private String email;
    private String phone;
    private String type;
    private String cui;

    public ClientListDTO(Long id, String name, String surname, String email, String phone, String type, String cui) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.phone = phone;
        this.type = type;
        this.cui = cui;
    }
}
