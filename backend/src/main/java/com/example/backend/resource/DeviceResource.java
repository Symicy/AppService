package com.example.backend.resource;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.method.P;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.domain.Client;
import com.example.backend.domain.Device;
import com.example.backend.service.DeviceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceResource {
    private final DeviceService deviceService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/add")
    public ResponseEntity<Device> addDevice(@RequestBody Device device){
        return ResponseEntity.created(URI.create("api/devices/add/" + device.getId()))
                .body(deviceService.addDevice(device));
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Device> getDevice(@PathVariable(value = "id") Long id) {
        return deviceService.getDeviceById(id)
                .map(ResponseEntity::ok)
                .orElseGet(ResponseEntity.notFound()::build);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<Device>> getAllDevices() {
        return ResponseEntity.ok(deviceService.getAllDevices());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<Device>> getDevicesByOrder(@PathVariable(value = "orderId") Long orderId) {
        return ResponseEntity.ok(deviceService.getDevicesByOrder(orderId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/serial/{serialNumber}")
    public ResponseEntity<Device> getDeviceBySerialNumber(@PathVariable(value = "serialNumber") String serialNumber) {
        return deviceService.getDeviceBySerialNumber(serialNumber)
                .map(ResponseEntity::ok)
                .orElseGet(ResponseEntity.notFound()::build);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteDevice(@PathVariable(value = "id") Long id) {
        deviceService.deleteDevice(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update/{id}")
    public ResponseEntity<Device> updateDevice(@PathVariable(value = "id") Long id,
                                               @RequestBody Device updatedDevice) {
        return ResponseEntity.ok(deviceService.updateDevice(id, updatedDevice));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/status")
    public ResponseEntity<Device> updateDeviceStatus(
            @PathVariable(value = "id") Long id,
            @RequestBody Map<String, String> statusUpdate) {
        
        String newStatus = statusUpdate.get("status");
        if (newStatus == null) {
            return ResponseEntity.badRequest().build();
        }
        
        return ResponseEntity.ok(deviceService.updateDeviceStatus(id, newStatus));
    }
}