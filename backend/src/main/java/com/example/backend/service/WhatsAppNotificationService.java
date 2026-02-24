package com.example.backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.example.backend.domain.Client;
import com.example.backend.domain.Order;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class WhatsAppNotificationService {

    private final RestTemplate restTemplate;

    @Value("${whatsapp.api.url}")
    private String whatsappApiUrl;

    @Value("${whatsapp.api.phone-number-id}")
    private String phoneNumberId;

    @Value("${whatsapp.api.access-token}")
    private String accessToken;

    @Value("${whatsapp.api.template-name}")
    private String templateName;

    public WhatsAppNotificationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Send order completion notification to client
     * @param order The completed order
     */
    public void sendOrderCompletionNotification(Order order) {
        try {
            Client client = order.getClient();
            
            // Validate client phone number
            if (client == null || client.getPhone() == null || client.getPhone().isEmpty()) {
                log.warn("Cannot send WhatsApp notification: Client or phone number is missing for order {}", order.getId());
                return;
            }

        log.debug("Preparing WhatsApp notification for order {} and client {} {}", order.getId(),
            client.getName(), client.getSurname());

            String clientPhone = formatPhoneNumber(client.getPhone());

        log.debug("Client phone before formatting: {} | after formatting: {}", client.getPhone(), clientPhone);
            
            // Build device names string (brand + model)
            String deviceNames = order.getDevices().stream()
                    .map(device -> device.getBrand() + " " + device.getModel())
                    .collect(Collectors.joining(", "));

        log.debug("Device list for WhatsApp template: {}", deviceNames);

            // Send the message
            sendTemplateMessage(
                    clientPhone,
                    client.getName() + " " + client.getSurname(),
                    order.getId().toString(),
                    deviceNames
            );

            log.info("WhatsApp notification sent successfully for order {} to {}", order.getId(), clientPhone);

        } catch (Exception e) {
            log.error("Failed to send WhatsApp notification for order {}: {}", order.getId(), e.getMessage(), e);
        }
    }

    /**
     * Send template message via WhatsApp Cloud API
     */
    private void sendTemplateMessage(String recipientPhone, String clientName, String orderId, String deviceNames) {
        String url = "%s/%s/messages".formatted(whatsappApiUrl, phoneNumberId);

        // Build request headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);

        // Build request body according to WhatsApp Cloud API format
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("messaging_product", "whatsapp");
        requestBody.put("to", recipientPhone);
        requestBody.put("type", "template");

        // Template object
        Map<String, Object> template = new HashMap<>();
        template.put("name", templateName);
        template.put("language", Map.of("code", "ro")); // Romanian language

        // Template components with parameters
        Map<String, Object> component = new HashMap<>();
        component.put("type", "body");
        
        // Parameters to fill in the template
        List<Map<String, String>> parameters = List.of(
                Map.of("type", "text", "text", clientName),
                Map.of("type", "text", "text", orderId),
                Map.of("type", "text", "text", deviceNames)
        );
        
        component.put("parameters", parameters);
        template.put("components", List.of(component));

        requestBody.put("template", template);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    request,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("WhatsApp API response: {}", response.getBody());
            } else {
                log.error("WhatsApp API returned non-success status: {}", response.getStatusCode());
            }

        } catch (HttpClientErrorException e) {
            log.error("WhatsApp API error: Status {}, Response: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw e;
        }
    }

    /**
     * Format phone number to E.164 format (e.g., +40712345678)
     * Assumes Romanian numbers if no country code is present
     */
    private String formatPhoneNumber(String phone) {
        // Remove spaces, dashes, and parentheses
        String cleaned = phone.replaceAll("[\\s\\-()]", "");
        
        // If it doesn't start with +, assume it's a Romanian number
        if (!cleaned.startsWith("+")) {
            // If it starts with 0, replace with +40
            if (cleaned.startsWith("0")) {
                cleaned = "+40" + cleaned.substring(1);
            } else if (!cleaned.startsWith("40")) {
                // If it doesn't start with country code, add +40
                cleaned = "+40" + cleaned;
            } else {
                // Already has 40, just add +
                cleaned = "+" + cleaned;
            }
        }
        
        return cleaned;
    }

    /**
     * Test method to verify WhatsApp API configuration
     */
    public boolean testConnection() {
        try {
            log.info("Testing WhatsApp API connection...");
            log.info("API URL: {}", whatsappApiUrl);
            log.info("Phone Number ID: {}", phoneNumberId);
            log.info("Template Name: {}", templateName);
            log.info("Access Token configured: {}", accessToken != null && !accessToken.isEmpty());
            
            return accessToken != null && !accessToken.isEmpty() 
                    && !accessToken.equals("YOUR_ACCESS_TOKEN");
        } catch (Exception e) {
            log.error("WhatsApp API configuration test failed: {}", e.getMessage());
            return false;
        }
    }
}
