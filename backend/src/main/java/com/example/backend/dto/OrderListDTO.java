package com.example.backend.dto;

import java.time.LocalDate;

public class OrderListDTO {
    private Long id;
    private String clientName;
    private LocalDate createdAt;
    private String status;
    private Long deviceCount;

    public OrderListDTO(Long id, String clientName, LocalDate createdAt, String status, Long deviceCount) {
        this.id = id;
        this.clientName = clientName;
        this.createdAt = createdAt;
        this.status = status;
        this.deviceCount = deviceCount;
    }

    public Long getId() { return id; }
    public String getClientName() { return clientName; }
    public LocalDate getCreatedAt() { return createdAt; }
    public String getStatus() { return status; }
    public Long getDeviceCount() { return deviceCount; }

    public void setId(Long id) { this.id = id; }
    public void setClientName(String clientName) { this.clientName = clientName; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
    public void setStatus(String status) { this.status = status; }
    public void setDeviceCount(Long deviceCount) { this.deviceCount = deviceCount; }
}
