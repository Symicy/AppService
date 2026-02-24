package com.example.backend.service;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.backend.domain.Device;
import com.example.backend.domain.Order;
import com.example.backend.util.QrGenerator;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class QrService {
    
    @Value("${app.qr.base-path:C:/QrCodes}")
    private String qrBasePath;
    
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;
    
    /**
     * Generate QR code for client order details
     */
    public void generateClientOrderQR(Order order) {
        try {
            // Create QR link
            String qrLink = frontendUrl + "/client-order/" + order.getId();
            
            // Create file path
            String fileName = "client-order-" + order.getId() + ".png";
            String qrPath = createQrPath("client-orders", fileName);
            
            // Generate QR code
            QrGenerator.generateQrCode(qrLink, qrPath);
            
            // Update order with QR info
            order.setClientQrLink(qrLink);
            order.setClientQrPath(qrPath);
            
            log.info("Generated client QR for order {}: {}", order.getId(), qrPath);
            
        } catch (Exception e) {
            log.error("Error generating client QR for order {}", order.getId(), e);
        }
    }
    
    /**
     * Generate QR code for service device redirect
     */
    public void generateServiceDeviceQR(Device device) {
        try {
            // Create QR link
            String qrLink = frontendUrl + "/service-device/" + device.getId();
            
            // Create file path
            String fileName = "service-device-" + device.getId() + ".png";
            String qrPath = createQrPath("service-devices", fileName);
            
            // Generate QR code
            QrGenerator.generateQrCode(qrLink, qrPath);
            
            // Update device with QR info
            device.setServiceQrLink(qrLink);
            device.setServiceQrPath(qrPath);
            
            log.info("Generated service QR for device {}: {}", device.getId(), qrPath);
            
        } catch (Exception e) {
            log.error("Error generating service QR for device {}", device.getId(), e);
        }
    }
    
    /**
     * Generate QR codes for all devices in an order
     */
    public void generateServiceQRsForOrder(Order order) {
        if (order.getDevices() != null) {
            for (Device device : order.getDevices()) {
                generateServiceDeviceQR(device);
            }
        }
    }
    
    /**
     * Regenerate QR code if file doesn't exist
     */
    public void regenerateQRIfMissing(Order order) {
        // Check client QR
        if (order.getClientQrPath() != null) {
            if (!Files.exists(Path.of(order.getClientQrPath()))) {
                log.warn("Client QR file missing for order {}, regenerating...", order.getId());
                generateClientOrderQR(order);
            }
        }
        
        // Check service QRs
        if (order.getDevices() != null) {
            for (Device device : order.getDevices()) {
                if (device.getServiceQrPath() != null) {
                    if (!Files.exists(Path.of(device.getServiceQrPath()))) {
                        log.warn("Service QR file missing for device {}, regenerating...", device.getId());
                        generateServiceDeviceQR(device);
                    }
                }
            }
        }
    }
    
    /**
     * Create QR file path with proper directory structure
     */
    private String createQrPath(String category, String fileName) {
        try {
            // Create date-based subdirectory
            String dateFolder = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            Path categoryPath = Path.of(qrBasePath, category, dateFolder);
            
            // Create directories if they don't exist
            Files.createDirectories(categoryPath);
            
            return categoryPath.resolve(fileName).toString();
            
        } catch (Exception e) {
            log.error("Error creating QR path for {}/{}", category, fileName, e);
            // Fallback to simple path
            return Path.of(qrBasePath, fileName).toString();
        }
    }
    
    /**
     * Get QR file as byte array for serving
     */
    public byte[] getQRFile(String qrPath) {
        try {
            Path path = Path.of(qrPath);
            if (Files.exists(path)) {
                return Files.readAllBytes(path);
            }
        } catch (Exception e) {
            log.error("Error reading QR file: {}", qrPath, e);
        }
        return null;
    }
    
    /**
     * Delete QR files for an order
     */
    public void deleteOrderQRs(Order order) {
        try {
            // Delete client QR
            if (order.getClientQrPath() != null) {
                deleteQRFile(order.getClientQrPath());
            }
            
            // Delete service QRs
            if (order.getDevices() != null) {
                for (Device device : order.getDevices()) {
                    if (device.getServiceQrPath() != null) {
                        deleteQRFile(device.getServiceQrPath());
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("Error deleting QR files for order {}", order.getId(), e);
        }
    }
    
    private void deleteQRFile(String qrPath) {
        try {
            Path path = Path.of(qrPath);
            if (Files.exists(path)) {
                Files.delete(path);
                log.info("Deleted QR file: {}", qrPath);
            }
        } catch (Exception e) {
            log.error("Error deleting QR file: {}", qrPath, e);
        }
    }
}
