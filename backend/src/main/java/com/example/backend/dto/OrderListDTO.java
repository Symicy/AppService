package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderListDTO {
    private Long id;
    private String clientName;
    private LocalDate createdAt;
    private String status;
    private Long deviceCount;
}
