package com.example.backend.resource;

import java.net.URI;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.DeleteMapping;

import com.example.backend.domain.Notification;
import com.example.backend.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationResource {
    private final NotificationService notificationService;

    @PostMapping("/add")
    public ResponseEntity<Notification> addNotification(@RequestBody Notification notification) {
        return ResponseEntity.created(URI.create("/api/notifications/add/" + notification.getId()))
                .body(notificationService.addNotification(notification));
    }

    
    // @PostMapping("/send")
    // public ResponseEntity<Void> sendNotification(@RequestBody Notification notification) {
    //     notificationService.sendNotification(notification);
    //     return ResponseEntity.ok().build();
    // }


    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable(value = "id") Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }
        
}