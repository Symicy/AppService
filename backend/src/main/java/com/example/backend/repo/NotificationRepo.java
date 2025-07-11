package com.example.backend.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.domain.Notification;
import com.example.backend.domain.Order;

public interface NotificationRepo extends JpaRepository<Notification, Long> {
    Optional<Notification> findNotificationById(Long id);
    List<Notification> findNotificationByOrderId(Order orderId);
}