package com.example.backend.service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.backend.domain.Device;
import com.example.backend.domain.OrderLog;
import com.example.backend.repo.DeviceRepo;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@Transactional(rollbackOn = Exception.class)
@RequiredArgsConstructor
public class DeviceService {
    private final DeviceRepo deviceRepo;
    private final OrderService orderService;
    private final OrderLogService orderLogService; // Adăugat
    
    public Device addDevice(Device device) {
        log.info("Adding new device: {}", device);
        return deviceRepo.save(device);
    }

    public void deleteDevice(Long id) {
        log.info("Deleting device with ID: {}", id);
        deviceRepo.findDeviceById(id)
                .ifPresentOrElse(device -> {
                    deviceRepo.delete(device);
                    log.info("Device with ID: {} deleted successfully", id);
                }, () -> {
                    log.warn("Device with ID: {} not found", id);
                    throw new RuntimeException("Device not found with ID: " + id);
                });
    }

    public Device updateDevice(Long id, Device updatedDevice) {
        log.info("Updating device with ID: {}", id);
        return deviceRepo.findDeviceById(id)
                .map(device -> {
                    // Salvează statusul anterior pentru verificare
                    String previousStatus = device.getStatus();
                    
                    // Validare serial number unic (dacă se schimbă)
                    if (updatedDevice.getSerialNumber() != null &&
                        !updatedDevice.getSerialNumber().equals(device.getSerialNumber())) {
                        if (deviceRepo.existsBySerialNumber(updatedDevice.getSerialNumber())) {
                            throw new RuntimeException("Serial number already exists: " + updatedDevice.getSerialNumber());
                        }
                        device.setSerialNumber(updatedDevice.getSerialNumber());
                    }

                    // Update other fields
                    if (updatedDevice.getBrand() != null) {
                        device.setBrand(updatedDevice.getBrand());
                    }
                    if (updatedDevice.getModel() != null) {
                        device.setModel(updatedDevice.getModel());
                    }
                    // if (updatedDevice.getClient() != null) {
                    //     device.setClient(updatedDevice.getClient());
                    // }
                    if (updatedDevice.getCredential() != null) {
                        device.setCredential(updatedDevice.getCredential());
                    }
                    if (updatedDevice.getLicenseKey() != null) {
                        device.setLicenseKey(updatedDevice.getLicenseKey());
                    }
                    if (updatedDevice.getNote() != null) {
                        device.setNote(updatedDevice.getNote());
                    }

                    // Actualizarea statusului dacă este furnizat
                    if (updatedDevice.getStatus() != null) {
                        device.setStatus(updatedDevice.getStatus());
                    }
                    
                    // Salvează dispozitivul
                    Device savedDevice = deviceRepo.save(device);
                    
                    // Verifică dacă statusul s-a schimbat și actualizează comanda dacă este necesar
                    if (updatedDevice.getStatus() != null && !updatedDevice.getStatus().equals(previousStatus)) {
                        synchronizeOrderStatus(savedDevice.getOrder().getId());
                    }
                    
                    log.info("Device with ID: {} updated successfully", id);
                    return savedDevice;
                })
                .orElseThrow(() -> new RuntimeException("Device not found with ID: " + id));
    }
    
    /**
     * Sincronizează statusul comenzii în funcție de statusurile dispozitivelor
     */
    private void synchronizeOrderStatus(Long orderId) {
        log.info("Synchronizing order status for order ID: {}", orderId);
        List<Device> devices = getDevicesByOrder(orderId);
        
        // Verifică dacă există cel puțin un dispozitiv
        if (devices.isEmpty()) {
            return;
        }
        
        // Verifică dacă toate dispozitivele au statusul FINALIZAT
        boolean allFinished = devices.stream()
                .allMatch(device -> "FINALIZAT".equals(device.getStatus()));
        
        // Verifică dacă există cel puțin un dispozitiv în lucru
        boolean anyInProgress = devices.stream()
                .anyMatch(device -> "IN_LUCRU".equals(device.getStatus()));
        
        // Actualizează statusul comenzii în funcție de dispozitive
        if (allFinished) {
            orderService.updateOrderStatus(orderId, "FINALIZAT");
        } else if (anyInProgress) {
            orderService.updateOrderStatus(orderId, "IN_LUCRU");
        }
    }
    
    public Optional<Device> getDeviceById(Long id) {
        log.info("Fetching device with ID: {}", id);
        return deviceRepo.findDeviceById(id);
    }

    public List<Device> getAllDevices() {
        log.info("Fetching all devices");
        return deviceRepo.findAll();
    }

    // public List<Device> getDevicesByClientId(Long clientId) {
    //     log.info("Fetching devices for client ID: {}", clientId);
    //     return deviceRepo.findAll().stream()
    //             .filter(device -> device.getClient() != null && device.getClient().getId().equals(clientId))
    //             .toList();
    // }
    public List<Device> getDevicesByOrder(Long orderId) {
        log.info("Fetching devices for order ID: {}", orderId);
        return deviceRepo.findAll().stream()
                .filter(device -> device.getOrder() != null && device.getOrder().getId().equals(orderId))
                .toList();
    }
    
    public Optional<Device> getDeviceBySerialNumber(String serialNumber) {
        log.info("Fetching device by serial number: {}", serialNumber);
        return deviceRepo.findDeviceBySerialNumber(serialNumber);
    }

    public boolean deviceExistsBySerialNumber(String serialNumber) {
        log.info("Checking if device exists by serial number: {}", serialNumber);
        return deviceRepo.existsBySerialNumber(serialNumber);
    }

    public Device updateDeviceStatus(Long id, String status) {
        log.info("Updating status for device with ID: {} to {}", id, status);
        
        // Validează statusul
        if (!Arrays.asList("PRELUAT", "IN_LUCRU", "IN_ASTEPTARE", "FINALIZAT", "PREDAT").contains(status)) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
        
        return deviceRepo.findDeviceById(id)
                .map(device -> {
                    // Salvează statusul anterior pentru verificare
                    String previousStatus = device.getStatus();
                    
                    // Actualizează statusul
                    device.setStatus(status);
                    
                    // Salvează dispozitivul
                    Device savedDevice = deviceRepo.save(device);
                    
                    // Adaugă log pentru comanda asociată dacă există
                    if (savedDevice.getOrder() != null) {
                        OrderLog orderLog = new OrderLog();
                        orderLog.setOrder(savedDevice.getOrder());
                        orderLog.setUser(savedDevice.getOrder().getUser());
                        orderLog.setMessage("Device #" + savedDevice.getId() + " (" + 
                                            savedDevice.getBrand() + " " + savedDevice.getModel() + 
                                            ") status changed to '" + status + "'");
                        orderLogService.addOrderLog(orderLog);
                    }
                    
                    // Verifică dacă statusul s-a schimbat și actualizează comanda dacă este necesar
                    if (!status.equals(previousStatus) && savedDevice.getOrder() != null) {
                        synchronizeOrderStatus(savedDevice.getOrder().getId());
                    }
                    
                    log.info("Device status updated successfully for ID: {}", id);
                    return savedDevice;
                })
                .orElseThrow(() -> new RuntimeException("Device not found with ID: " + id));
    }
}