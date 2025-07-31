package com.example.backend.resource;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.service.DashboardService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardResource {
    private final DashboardService dashboardService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        log.info("Fetching dashboard statistics");
        try {
            Map<String, Object> stats = dashboardService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error fetching dashboard stats", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/recent-orders")
    public ResponseEntity<List<Map<String, Object>>> getRecentOrders(
            @RequestParam(defaultValue = "5") int limit) {
        log.info("Fetching {} recent orders", limit);
        try {
            List<Map<String, Object>> recentOrders = dashboardService.getRecentOrders(limit);
            return ResponseEntity.ok(recentOrders);
        } catch (Exception e) {
            log.error("Error fetching recent orders", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/monthly-orders")
    public ResponseEntity<Map<String, Object>> getMonthlyOrdersData() {
        log.info("Fetching monthly orders data for charts");
        try {
            Map<String, Object> monthlyData = dashboardService.getMonthlyOrdersData();
            return ResponseEntity.ok(monthlyData);
        } catch (Exception e) {
            log.error("Error fetching monthly orders data", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/status-distribution")
    public ResponseEntity<Map<String, Object>> getStatusDistribution() {
        log.info("Fetching order status distribution");
        try {
            Map<String, Object> statusData = dashboardService.getStatusDistribution();
            return ResponseEntity.ok(statusData);
        } catch (Exception e) {
            log.error("Error fetching status distribution", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
