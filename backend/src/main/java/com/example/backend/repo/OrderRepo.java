package com.example.backend.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.example.backend.domain.Order;

public interface OrderRepo extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    Optional<Order> findOrderById(Long id);
}