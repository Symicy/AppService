package com.example.backend.resource;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.backend.domain.OrderLog;
import com.example.backend.service.OrderLogService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/order-logs")
@RequiredArgsConstructor
public class OrderLogResource {
    
    private final OrderLogService orderLogService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/add")
    public ResponseEntity<OrderLog> addOrderLog(@RequestBody OrderLog orderLog) {
        OrderLog createdLog = orderLogService.addOrderLog(orderLog);
        return ResponseEntity.created(URI.create("/api/order-logs/" + createdLog.getId()))
                             .body(createdLog);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<OrderLog> getOrderLog(@PathVariable("id") Long id) {
        OrderLog orderLog = orderLogService.getOrderLogById(id).orElse(null);
        if (orderLog != null) {
            return ResponseEntity.ok(orderLog);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<OrderLog>> getAllOrderLogs() {
        return ResponseEntity.ok(orderLogService.getAllOrderLogs());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/by-order/{orderId}")
    public ResponseEntity<List<OrderLog>> getOrderLogsByOrderId(@PathVariable("orderId") Long orderId) {
        log.info("Fetching logs for order ID: {}", orderId);
        List<OrderLog> logs = orderLogService.getOrdersLogsByOrderId(orderId);
        return ResponseEntity.ok(logs);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update/{id}")
    public ResponseEntity<OrderLog> updateOrderLog(@PathVariable("id") Long id,
                                                   @RequestBody OrderLog updatedOrderLog) {
        return ResponseEntity.ok(orderLogService.updateOrderLog(id, updatedOrderLog));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteOrderLog(@PathVariable("id") Long id) {
        orderLogService.deleteOrderLog(id);
        return ResponseEntity.noContent().build();
    }
}