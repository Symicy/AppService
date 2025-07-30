package com.example.backend.dto;

import java.time.LocalDate;
import java.util.List;

import com.example.backend.domain.Device;
import com.example.backend.domain.Client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailDTO {
    private Long id;
    private LocalDate createdAt;
    private String status;
    
    // Informații complete despre client
    private Client client;
    
    // Lista de dispozitive
    private List<Device> devices;
    
    private boolean canBeDelivered;
    
    public OrderDetailDTO(Long id, LocalDate createdAt, String status, Client client, List<Device> devices) {
        this.id = id;
        this.createdAt = createdAt;
        this.status = status;
        this.client = client;
        this.devices = devices;
        this.canBeDelivered = "FINALIZAT".equals(status);
    }
}
