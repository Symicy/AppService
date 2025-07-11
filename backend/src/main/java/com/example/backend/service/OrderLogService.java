package com.example.backend.service;

import com.example.backend.domain.OrderLog;
import com.example.backend.repo.OrderLogRepo;
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
public class OrderLogService {
    private final OrderLogRepo orderLogRepo;

    public OrderLog addOrderLog(OrderLog orderLog) {
        log.info("Adding new order log for order ID: {}", orderLog.getOrderId().getId());
        return orderLogRepo.save(orderLog);
    }

    public Optional<OrderLog> getOrderLogById(Long id) {
        log.info("Fetching order log by ID: {}", id);
        return orderLogRepo.findById(id);
    }

    public List<OrderLog> getAllOrderLogs() {
        log.info("Fetching all order logs");
        return orderLogRepo.findAll();
    }

    public List<OrderLog> getOrdersLogsByOrderId(Long orderId) {
        log.info("Fetching order logs for order ID: {}", orderId);
        return orderLogRepo.findOrderLogByOrderId(orderId);
    }

    public void deleteOrderLog(Long id) {
        log.info("Deleting order log with ID: {}", id);
        orderLogRepo.deleteById(id);
    }

    public OrderLog updateOrderLog(Long id, OrderLog updatedOrderLog) {
        log.info("Updating order log with ID: {}", id);
        return orderLogRepo.findById(id)
                .map(orderLog -> {
                    if (updatedOrderLog.getOrderId() != null) {
                        orderLog.setOrderId(updatedOrderLog.getOrderId());
                    }
                    if (updatedOrderLog.getUserId() != null) {
                        orderLog.setUserId(updatedOrderLog.getUserId());
                    }
                    if (updatedOrderLog.getMessage() != null) {
                        orderLog.setMessage(updatedOrderLog.getMessage());
                    }
                    log.info("Order log with ID: {} updated successfully", id);
                    return orderLogRepo.save(orderLog);
                })
                .orElseThrow(() -> new RuntimeException("Order log not found with ID: " + id));
    }
}