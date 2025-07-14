package com.example.backend.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.domain.Order;
import com.example.backend.domain.OrderDocument;

public interface OrderDocumentRepo extends JpaRepository<OrderDocument, Long> {
    Optional<OrderDocument> findOrderDocumentById(Long id);
    //Optional<OrderDocument> findOrderDocumentByName(String name);
    List<OrderDocument> findOrderDocumentByOrderId(Long orderId);
}