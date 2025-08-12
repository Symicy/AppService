package com.example.backend.domain;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_DEFAULT)
@Table(name = "device")
public class Device {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, unique = true, updatable = false)
    private Long id;

    @Column(name = "brand", length = 50)
    private String brand;

    @Column(name = "model", length = 50)
    private String model;

    @Column(name = "serial_number", unique = true, length = 50)
    private String serialNumber;

    @CreationTimestamp
    @Column(name = "received_date", nullable = false)
    private LocalDate receivedDate;

    @Column(name = "note", length = 255)
    private String note; 

    @Column(name = "toDo", length = 255)
    private String toDo;

    @Column(name = "accessory", length = 255)
    private String accessory;

    @Column(name = "credential", length = 255, nullable = false)
    private String credential;

    @Column(name = "status", nullable = false)
    private String status;

    // License key for the device, if applicable
    @Column(name = "license_key", length = 255)
    private String licenseKey;

    @ManyToOne
    @JsonBackReference("order-devices")
    @JoinColumn(name = "order_id")
    private Order order;

    // QR Code fields for service
    @Column(name = "service_qr_link", length = 500)
    private String serviceQrLink;

    @Column(name = "service_qr_path", length = 500)
    private String serviceQrPath;

    @JsonProperty("order_id")
    public Long getOrderId() {
        return order != null ? order.getId() : null;
    }
    
    // Modifică câmpul accessory existent pentru a stoca accesorii personalizate
    @Column(name = "custom_accessories", length = 255)
    private String customAccessories;
    
    // Adaugă o colecție pentru accesoriile predefinite
    @ElementCollection
    @CollectionTable(
        name = "device_predefined_accessories",
        joinColumns = @JoinColumn(name = "device_id")
    )
    @Column(name = "accessory_name")
    private Set<String> predefinedAccessories = new HashSet<>();
    
    // Adaugă metode helper
    public void addPredefinedAccessory(String accessory) {
        if (predefinedAccessories == null) {
            predefinedAccessories = new HashSet<>();
        }
        predefinedAccessories.add(accessory);
    }
    
    public void removePredefinedAccessory(String accessory) {
        if (predefinedAccessories != null) {
            predefinedAccessories.remove(accessory);
        }
    }
    
    public boolean hasPredefinedAccessory(String accessory) {
        return predefinedAccessories != null && predefinedAccessories.contains(accessory);
    }
}
