package com.example.backend.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.domain.Device;

public interface DeviceRepo extends JpaRepository<Device, Long> {
    Optional<Device> findDeviceById(Long id);
    Optional<Device> findDeviceBySerialNumber(String serialNumber);
    boolean existsBySerialNumber(String serialNumber);
}