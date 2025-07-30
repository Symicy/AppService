package com.example.backend.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.backend.domain.OrderLog;

public interface OrderLogRepo extends JpaRepository<OrderLog, Long> {
    Optional<OrderLog> findOrderLogById(Long id);
    @Query("SELECT ol FROM OrderLog ol WHERE ol.order.id = :orderId ORDER BY ol.timestamp DESC")
    List<OrderLog> findOrderLogByOrderId(Long orderId);
}