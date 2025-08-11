package com.example.backend.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PublicOrderDTO {
    private Long id;
    private String clientName;
    private LocalDate createdAt;
    private String status;
    private Long deviceCount;
}
