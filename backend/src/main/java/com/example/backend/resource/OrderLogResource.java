package com.example.backend.resource;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
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

    @PostMapping("/add")
    public ResponseEntity<OrderLog> addOrderLog(@RequestBody OrderLog orderLog) {
        OrderLog createdLog = orderLogService.addOrderLog(orderLog);
        return ResponseEntity.created(URI.create("/api/order-logs/" + createdLog.getId()))
                             .body(createdLog);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderLog> getOrderLog(@PathVariable("id") Long id) {
        OrderLog orderLog = orderLogService.getOrderLogById(id).orElse(null);
        if (orderLog != null) {
            return ResponseEntity.ok(orderLog);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<OrderLog>> getAllOrderLogs() {
        return ResponseEntity.ok(orderLogService.getAllOrderLogs());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<OrderLog> updateOrderLog(@PathVariable("id") Long id,
                                                   @RequestBody OrderLog updatedOrderLog) {
        return ResponseEntity.ok(orderLogService.updateOrderLog(id, updatedOrderLog));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteOrderLog(@PathVariable("id") Long id) {
        orderLogService.deleteOrderLog(id);
        return ResponseEntity.noContent().build();
    }
}
