package com.example.backend.resource;

import com.example.backend.dto.OrderEventMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class OrderWebSocketController {

    @MessageMapping("/orders/refresh")
    @SendTo("/topic/orders")
    public OrderEventMessage broadcastRefresh(OrderEventMessage message) {
        // Simple pass-through to broadcast refresh events to all subscribers
        return message;
    }
}
