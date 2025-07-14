package com.example.backend.service;

import org.springframework.stereotype.Service;

import com.example.backend.domain.OrderDocument;
import com.example.backend.repo.OrderDocumentRepo;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

@Slf4j
@Service
@Transactional(rollbackOn = Exception.class)
@RequiredArgsConstructor
public class OrderDocumentService {

    private final OrderDocumentRepo orderDocumentRepo;

    public OrderDocument addOrderDocument(OrderDocument orderDocument) {
        log.info("Adding new order document for order ID: {}", orderDocument.getOrder().getId());
        return orderDocumentRepo.save(orderDocument);
    }

    public OrderDocument getOrderDocumentById(Long id) {
        log.info("Fetching order document by ID: {}", id);
        return orderDocumentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order document not found with ID: " + id));
    }

    public void deleteOrderDocument(Long id) {
        log.info("Deleting order document with ID: {}", id);
        orderDocumentRepo.deleteById(id);
    }

    // Get all order documents
    public List<OrderDocument> getAllOrderDocuments() {
        log.info("Fetching all order documents");
        return orderDocumentRepo.findAll();
    }

    // Get all documents for a specific order
    public List<OrderDocument> getOrderDocumentsByOrderId(Long orderId) {
        log.info("Fetching order documents for order ID: {}", orderId);
        List<OrderDocument> documents = orderDocumentRepo.findOrderDocumentByOrderId(orderId);
        return documents != null ? documents : List.of();
    }

    // Update an order document
    public OrderDocument updateOrderDocument(Long id, OrderDocument updatedDocument) {
        log.info("Updating order document with ID: {}", id);
        return orderDocumentRepo.findById(id)
                .map(document -> {
                    if (updatedDocument.getOrder() != null) {
                        document.setOrder(updatedDocument.getOrder());
                    }
                    if (updatedDocument.getDocumentType() != null) {
                        document.setDocumentType(updatedDocument.getDocumentType());
                    }
                    if (updatedDocument.getDocumentUrl() != null) {
                        document.setDocumentUrl(updatedDocument.getDocumentUrl());
                    }
                    if (updatedDocument.getUploadedBy() != null) {
                        document.setUploadedBy(updatedDocument.getUploadedBy());
                    }
                    log.info("Order document with ID: {} updated successfully", id);
                    return orderDocumentRepo.save(document);
                })
                .orElseThrow(() -> new RuntimeException("Order document not found with ID: " + id));
    }
}