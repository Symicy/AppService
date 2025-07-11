package com.example.backend.service;

import com.example.backend.domain.Order;
import com.example.backend.repo.OrderRepo;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional(rollbackOn = Exception.class)
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepo orderRepo;

    public Order addOrder(Order order) {
        log.info("Adding new order for client ID: {}", order.getClientId().getId());
        return orderRepo.save(order);
    }

    public Optional<Order> getOrderById(Long id) {
        log.info("Fetching order by ID: {}", id);
        return orderRepo.findOrderById(id);
    }

    public List<Order> getAllOrders() {
        log.info("Fetching all orders");
        return orderRepo.findAll();
    }

    public void deleteOrder(Long id) {
        log.info("Deleting order with ID: {}", id);
        if (!orderRepo.existsById(id)) {
            log.warn("Order with ID: {} not found", id);
            throw new RuntimeException("Order not found with ID: " + id);
        }
        orderRepo.deleteById(id);
        log.info("Order with ID: {} deleted successfully", id);
    }

    public Order updateOrder(Long id, Order updatedOrder) {
        log.info("Updating order with ID: {}", id);
        return orderRepo.findOrderById(id)
                .map(order -> {
                    if (updatedOrder.getClientId() != null) {
                        order.setClientId(updatedOrder.getClientId());
                    }
                    if (updatedOrder.getUserId() != null) {
                        order.setUserId(updatedOrder.getUserId());
                    }
                    if (updatedOrder.getStatus() != null) {
                        order.setStatus(updatedOrder.getStatus());
                    }
                    // Optionally update items, documents, notifications, orderLogs if needed
                    log.info("Order with ID: {} updated successfully", id);
                    return orderRepo.save(order);
                })  
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + id));
    }
}