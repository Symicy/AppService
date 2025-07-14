package com.example.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.backend.domain.Device;
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

                    log.info("Device with ID: {} updated successfully", id);
                    return deviceRepo.save(device);
                })
                .orElseThrow(() -> new RuntimeException("Device not found with ID: " + id));
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
}