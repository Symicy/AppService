package com.example.backend.dto;

import java.time.LocalDate;
import java.util.List;

public class ClientOrderDetailsDTO {
    private Long id;
    private String clientName;
    private String clientPhone;
    private String clientEmail;
    private LocalDate createdAt;
    private String status;
    private String notes;
    private List<DeviceDetailsDTO> devices;
    
    // Constructors
    public ClientOrderDetailsDTO() {}
    
    public ClientOrderDetailsDTO(Long id, String clientName, String clientPhone, String clientEmail, 
                               LocalDate createdAt, String status, String notes, List<DeviceDetailsDTO> devices) {
        this.id = id;
        this.clientName = clientName;
        this.clientPhone = clientPhone;
        this.clientEmail = clientEmail;
        this.createdAt = createdAt;
        this.status = status;
        this.notes = notes;
        this.devices = devices;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getClientName() {
        return clientName;
    }
    
    public void setClientName(String clientName) {
        this.clientName = clientName;
    }
    
    public String getClientPhone() {
        return clientPhone;
    }
    
    public void setClientPhone(String clientPhone) {
        this.clientPhone = clientPhone;
    }
    
    public String getClientEmail() {
        return clientEmail;
    }
    
    public void setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
    }
    
    public LocalDate getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public List<DeviceDetailsDTO> getDevices() {
        return devices;
    }
    
    public void setDevices(List<DeviceDetailsDTO> devices) {
        this.devices = devices;
    }
    
    // Nested DTO for device details
    public static class DeviceDetailsDTO {
        private Long id;
        private String deviceType;
        private String brand;
        private String model;
        private String serialNumber;
        private String issueDescription;
        private String status;
        private String technicianNotes;
        
        // Constructors
        public DeviceDetailsDTO() {}
        
        public DeviceDetailsDTO(Long id, String deviceType, String brand, String model, 
                              String serialNumber, String issueDescription, String status, String technicianNotes) {
            this.id = id;
            this.deviceType = deviceType;
            this.brand = brand;
            this.model = model;
            this.serialNumber = serialNumber;
            this.issueDescription = issueDescription;
            this.status = status;
            this.technicianNotes = technicianNotes;
        }
        
        // Getters and Setters
        public Long getId() {
            return id;
        }
        
        public void setId(Long id) {
            this.id = id;
        }
        
        public String getDeviceType() {
            return deviceType;
        }
        
        public void setDeviceType(String deviceType) {
            this.deviceType = deviceType;
        }
        
        public String getBrand() {
            return brand;
        }
        
        public void setBrand(String brand) {
            this.brand = brand;
        }
        
        public String getModel() {
            return model;
        }
        
        public void setModel(String model) {
            this.model = model;
        }
        
        public String getSerialNumber() {
            return serialNumber;
        }
        
        public void setSerialNumber(String serialNumber) {
            this.serialNumber = serialNumber;
        }
        
        public String getIssueDescription() {
            return issueDescription;
        }
        
        public void setIssueDescription(String issueDescription) {
            this.issueDescription = issueDescription;
        }
        
        public String getStatus() {
            return status;
        }
        
        public void setStatus(String status) {
            this.status = status;
        }
        
        public String getTechnicianNotes() {
            return technicianNotes;
        }
        
        public void setTechnicianNotes(String technicianNotes) {
            this.technicianNotes = technicianNotes;
        }
    }
}
