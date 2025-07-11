package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.backend.domain.Notification;
import com.example.backend.domain.Order;
import com.example.backend.repo.NotificationRepo;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@Transactional(rollbackOn = Exception.class)
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepo notificationRepo;
    
    public Notification addNotification(Notification notification) {
        log.info("Adding new notification for order ID: {}", notification.getOrderId().getId());
        notification.setSendDate(LocalDateTime.now());
        return notificationRepo.save(notification);
    }

    public List<Notification> getAllNotifications() {
        log.info("Fetching all notifications");
        return notificationRepo.findAll();
    }

    public Optional<Notification> getNotificationById(Long id) {
        log.info("Fetching notification by ID: {}", id);
        return notificationRepo.findById(id);
    }

    public List<Notification> getNotificationsByOrder(Order order) {
        log.info("Fetching notifications for order ID: {}", order.getId());
        return notificationRepo.findNotificationByOrderId(order);
    }

    public void deleteNotification(Long id) {
        log.info("Deleting notification with ID: {}", id);
        notificationRepo.deleteById(id);
    }
}