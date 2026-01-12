package com.example.backend.dto;

public record OrderEventMessage(String type, Long orderId) {
}
