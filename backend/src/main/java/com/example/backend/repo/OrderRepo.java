package com.example.backend.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.domain.Order;

public interface OrderRepo extends JpaRepository<Order, Long> {
    Optional<Order> findOrderById(Long id);
}