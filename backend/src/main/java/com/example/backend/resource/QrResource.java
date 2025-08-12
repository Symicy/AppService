package com.example.backend.resource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.domain.Device;
import com.example.backend.domain.Order;
import com.example.backend.service.DeviceService;
import com.example.backend.service.OrderService;
import com.example.backend.service.QrService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/qr")
@Slf4j
public class QrResource {
    
    @Autowired
    private QrService qrService;
    
    @Autowired
    private OrderService orderService;
    
    @Autowired
    private DeviceService deviceService;
    
    /**
     * Get QR image for client order
     */
    @GetMapping("/client-order/{orderId}")
    public ResponseEntity<Resource> getClientOrderQR(@PathVariable Long orderId) {
        try {
            Order order = orderService.getOrderById(orderId).orElse(null);
            if (order == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Regenerate QR if missing
            if (order.getClientQrPath() == null) {
                qrService.generateClientOrderQR(order);
                orderService.updateOrder(orderId, order);
            }
            
            byte[] qrData = qrService.getQRFile(order.getClientQrPath());
            if (qrData == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                       "inline; filename=\"client-order-" + orderId + ".png\"")
                .body(new ByteArrayResource(qrData));
                
        } catch (Exception e) {
            log.error("Error serving client QR for order {}", orderId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get QR image for service device
     */
    @GetMapping("/service-device/{deviceId}")
    public ResponseEntity<Resource> getServiceDeviceQR(@PathVariable Long deviceId) {
        try {
            Device device = deviceService.getDeviceById(deviceId).orElse(null);
            if (device == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Regenerate QR if missing
            if (device.getServiceQrPath() == null) {
                qrService.generateServiceDeviceQR(device);
                deviceService.updateDevice(deviceId, device);
            }
            
            byte[] qrData = qrService.getQRFile(device.getServiceQrPath());
            if (qrData == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                       "inline; filename=\"service-device-" + deviceId + ".png\"")
                .body(new ByteArrayResource(qrData));
                
        } catch (Exception e) {
            log.error("Error serving service QR for device {}", deviceId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get QR link (URL) for client order
     */
    @GetMapping("/client-order/{orderId}/link")
    public ResponseEntity<String> getClientOrderQRLink(@PathVariable Long orderId) {
        try {
            Order order = orderService.getOrderById(orderId).orElse(null);
            if (order == null) {
                return ResponseEntity.notFound().build();
            }
            
            if (order.getClientQrLink() == null) {
                qrService.generateClientOrderQR(order);
                orderService.updateOrder(orderId, order);
            }
            
            return ResponseEntity.ok(order.getClientQrLink());
            
        } catch (Exception e) {
            log.error("Error getting client QR link for order {}", orderId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get QR link (URL) for service device
     */
    @GetMapping("/service-device/{deviceId}/link")
    public ResponseEntity<String> getServiceDeviceQRLink(@PathVariable Long deviceId) {
        try {
            Device device = deviceService.getDeviceById(deviceId).orElse(null);
            if (device == null) {
                return ResponseEntity.notFound().build();
            }
            
            if (device.getServiceQrLink() == null) {
                qrService.generateServiceDeviceQR(device);
                deviceService.updateDevice(deviceId, device);
            }
            
            return ResponseEntity.ok(device.getServiceQrLink());
            
        } catch (Exception e) {
            log.error("Error getting service QR link for device {}", deviceId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Regenerate all QR codes for an order
     */
    @GetMapping("/regenerate/order/{orderId}")
    public ResponseEntity<String> regenerateOrderQRs(@PathVariable Long orderId) {
        try {
            Order order = orderService.getOrderById(orderId).orElse(null);
            if (order == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Generate client QR
            qrService.generateClientOrderQR(order);
            
            // Generate service QRs for all devices
            qrService.generateServiceQRsForOrder(order);
            
            // Save updates
            orderService.updateOrder(orderId, order);
            
            return ResponseEntity.ok("QR codes regenerated successfully for order " + orderId);
            
        } catch (Exception e) {
            log.error("Error regenerating QR codes for order {}", orderId, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
