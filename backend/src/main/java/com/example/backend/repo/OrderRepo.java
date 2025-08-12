package com.example.backend.repo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.example.backend.domain.Order;

public interface OrderRepo extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    Optional<Order> findOrderById(Long id);
    long countByStatusNotIn(List<String> statuses);
    
    // Dashboard methods
    long countByStatus(String status);
    long countByStatusAndCreatedAtBetween(String status, LocalDateTime startDate, LocalDateTime endDate);
    long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
}