package com.example.backend.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.domain.OrderLog;

public interface OrderLogRepo extends JpaRepository<OrderLog, Long> {
    Optional<OrderLog> findOrderLogById(Long id);
    List<OrderLog> findOrderLogByOrderId(Long orderId);
}