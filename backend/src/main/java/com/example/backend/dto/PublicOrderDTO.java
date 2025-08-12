package com.example.backend.dto;

import java.time.LocalDateTime;

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
    private LocalDateTime createdAt;
    private String status;
    private Long deviceCount;
}
