package com.example.backend.service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.backend.domain.Order;
import com.example.backend.repo.ClientRepo;
import com.example.backend.repo.DeviceRepo;
import com.example.backend.repo.OrderRepo;
import com.example.backend.repo.UserRepo;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@Transactional(rollbackOn = Exception.class)
@RequiredArgsConstructor
public class DashboardService {
    private final OrderRepo orderRepo;
    private final ClientRepo clientRepo;
    private final DeviceRepo deviceRepo;
    private final UserRepo userRepo;

    public Map<String, Object> getDashboardStats() {
        log.info("Calculating dashboard statistics");
        Map<String, Object> stats = new HashMap<>();
        
        try {
            // Total counts
            long totalOrders = orderRepo.count();
            long totalClients = clientRepo.count();
            long totalDevices = deviceRepo.count();
            long totalUsers = userRepo.count();
            
            // Order status counts using OrderRepo for main stats
            long completed = orderRepo.countByStatus("PREDAT");
            long cancelled = orderRepo.countByStatus("cancelled");
            
            // Calculate in progress as orders that are PRELUAT, IN_LUCRU, or FINALIZAT
            long preluatCount = orderRepo.countByStatus("PRELUAT");
            long inLucruCount = orderRepo.countByStatus("IN_LUCRU");
            long finalizatCount = orderRepo.countByStatus("FINALIZAT");
            long inProgress = preluatCount + inLucruCount + finalizatCount;
            
            // Keep DeviceRepo only for awaiting parts count
            long awaitingParts = deviceRepo.countByStatus("IN_ASTEPTARE");
            
            // Debug logging to help identify the issue
            log.info("Order status counts - PREDAT: {}, cancelled: {}, PRELUAT: {}, IN_LUCRU: {}, FINALIZAT: {}", 
                     completed, cancelled, preluatCount, inLucruCount, finalizatCount);
            log.info("Device awaiting parts count - IN_ASTEPTARE: {}", awaitingParts);
            
            stats.put("totalOrders", totalOrders);
            stats.put("totalClients", totalClients);
            stats.put("totalDevices", totalDevices);
            stats.put("totalUsers", totalUsers);
            stats.put("inProgress", inProgress);
            stats.put("completed", completed);
            stats.put("awaitingParts", awaitingParts);
            stats.put("cancelled", cancelled);
            
            log.info("Dashboard stats calculated: {} orders, {} clients, {} devices", 
                     totalOrders, totalClients, totalDevices);
            
        } catch (Exception e) {
            log.error("Error calculating dashboard stats", e);
            throw new RuntimeException("Failed to calculate dashboard statistics", e);
        }
        
        return stats;
    }

    public List<Map<String, Object>> getRecentOrders(int limit) {
        log.info("Fetching {} most recent orders", limit);
        List<Map<String, Object>> recentOrders = new ArrayList<>();
        
        try {
            List<Order> orders = orderRepo.findAll(
                PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt"))
            ).getContent();
            
            for (Order order : orders) {
                Map<String, Object> orderData = new HashMap<>();
                orderData.put("id", order.getId());
                orderData.put("orderNumber", "ORD-" + String.format("%06d", order.getId()));
                orderData.put("client", order.getClientName());
                
                // Get first device name
                String deviceName = "No devices";
                if (order.getDevices() != null && !order.getDevices().isEmpty()) {
                    if (order.getDevices().size() == 1) {
                        deviceName = order.getDevices().get(0).getBrand() + " " +
                                   order.getDevices().get(0).getModel();
                    } else {
                        deviceName = "Multiple devices (" + order.getDevices().size() + ")";
                    }
                }
                orderData.put("device", deviceName);
                
                // Use order status instead of device status
                String orderStatus = order.getStatus();
                
                // Map Romanian status to English for frontend display
                String displayStatus = mapStatusToEnglish(orderStatus);
                orderData.put("status", displayStatus);
                
                // Also include the original order status for reference
                orderData.put("originalStatus", orderStatus);
                
                // Set priority based on status
                String priority = "medium";
                if ("cancelled".equals(displayStatus)) {
                    priority = "low";
                } else if ("awaiting_parts".equals(displayStatus)) {
                    priority = "high";
                } else if ("completed".equals(displayStatus)) {
                    priority = "low";
                }
                orderData.put("priority", priority);
                
                recentOrders.add(orderData);
            }
            
        } catch (Exception e) {
            log.error("Error fetching recent orders", e);
            throw new RuntimeException("Failed to fetch recent orders", e);
        }
        
        return recentOrders;
    }

    public Map<String, Object> getMonthlyOrdersData() {
        log.info("Calculating monthly orders data for charts");
        Map<String, Object> monthlyData = new HashMap<>();
        
        try {
            // Get last 12 months
            List<String> labels = new ArrayList<>();
            List<Integer> completedData = new ArrayList<>();
            List<Integer> newOrdersData = new ArrayList<>();
            
            LocalDate currentDate = LocalDate.now();
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");
            
            for (int i = 11; i >= 0; i--) {
                LocalDate monthDate = currentDate.minusMonths(i);
                String monthLabel = monthDate.format(formatter);
                labels.add(monthLabel);
                
                // Get start and end of month
                LocalDate startOfMonth = monthDate.withDayOfMonth(1);
                LocalDate endOfMonth = monthDate.withDayOfMonth(monthDate.lengthOfMonth());
                
                // Count completed orders in this month (using order status)
                long completedCount = orderRepo.countByStatusAndCreatedAtBetween(
                    "PREDAT", startOfMonth, endOfMonth);
                completedData.add((int) completedCount);
                
                // Count all new orders in this month
                long newOrdersCount = orderRepo.countByCreatedAtBetween(startOfMonth, endOfMonth);
                newOrdersData.add((int) newOrdersCount);
            }
            
            monthlyData.put("labels", labels);
            monthlyData.put("completedData", completedData);
            monthlyData.put("newOrdersData", newOrdersData);
            
        } catch (Exception e) {
            log.error("Error calculating monthly orders data", e);
            throw new RuntimeException("Failed to calculate monthly orders data", e);
        }
        
        return monthlyData;
    }

    public Map<String, Object> getStatusDistribution() {
        log.info("Calculating order status distribution");
        Map<String, Object> statusData = new HashMap<>();
        
        try {
            // Use OrderRepo for chart data - show 4 statuses (remove IN_ASTEPTARE from chart)
            long preluatCount = orderRepo.countByStatus("PRELUAT");
            long inLucruCount = orderRepo.countByStatus("IN_LUCRU");
            long finalizatCount = orderRepo.countByStatus("FINALIZAT");
            long predatCount = orderRepo.countByStatus("PREDAT");
            
            // Labels showing 4 status values (keep IN_LUCRU, remove IN_ASTEPTARE from chart)
            List<String> labels = Arrays.asList("PRELUAT", "IN_LUCRU", "FINALIZAT", "PREDAT");
            List<Integer> data = Arrays.asList(
                (int) preluatCount,
                (int) inLucruCount, 
                (int) finalizatCount,
                (int) predatCount
            );
            
            statusData.put("labels", labels);
            statusData.put("data", data);
            
        } catch (Exception e) {
            log.error("Error calculating status distribution", e);
            throw new RuntimeException("Failed to calculate status distribution", e);
        }
        
        return statusData;
    }
    
    /**
     * Maps database status values to English for frontend display
     */
    private String mapStatusToEnglish(String databaseStatus) {
        if (databaseStatus == null) {
            return "in_progress";
        }
        
        switch (databaseStatus.toUpperCase()) {
            case "PREDAT":
                return "completed";
            case "IN_ASTEPTARE":
                return "awaiting_parts";
            case "PRELUAT":
            case "IN_LUCRU":
            case "FINALIZAT":
                return "in_progress";
            case "CANCELLED":
                return "cancelled";
            default:
                return "in_progress";
        }
    }
}
