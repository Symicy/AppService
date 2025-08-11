package com.example.backend.dto;

import com.example.backend.domain.Client;
import com.example.backend.domain.Device;
import com.example.backend.domain.OrderLog;
import java.time.LocalDate;
import java.util.List;

public class OrderDetailDTO {
    private Long id;
    private LocalDate createdAt;
    private String status;
    private Client client;
    private List<Device> devices;
    private List<OrderLog> orderLogs;

    public OrderDetailDTO(Long id, LocalDate createdAt, String status, Client client, List<Device> devices, List<OrderLog> orderLogs) {
        this.id = id;
        this.createdAt = createdAt;
        this.status = status;
        this.client = client;
        this.devices = devices;
        this.orderLogs = orderLogs;
    }

    public Long getId() { return id; }
    public LocalDate getCreatedAt() { return createdAt; }
    public String getStatus() { return status; }
    public Client getClient() { return client; }
    public List<Device> getDevices() { return devices; }
    public List<OrderLog> getOrderLogs() { return orderLogs; }

    public void setId(Long id) { this.id = id; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
    public void setStatus(String status) { this.status = status; }
    public void setClient(Client client) { this.client = client; }
    public void setDevices(List<Device> devices) { this.devices = devices; }
    public void setOrderLogs(List<OrderLog> orderLogs) { this.orderLogs = orderLogs; }
}
