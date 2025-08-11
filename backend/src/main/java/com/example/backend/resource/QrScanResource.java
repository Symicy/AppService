package com.example.backend.resource;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/scan")
@RequiredArgsConstructor
public class QrScanResource {

    @GetMapping("/{orderUuid}")
    public ResponseEntity<?> handleQrScan(@PathVariable String orderUuid, Authentication authentication) {
        log.info("QR scan request for order UUID: {}", orderUuid);
        
        // Verificăm dacă utilizatorul este autentificat
        boolean isAuthenticated = authentication != null && authentication.isAuthenticated() && 
            !authentication.getPrincipal().equals("anonymousUser");
            
        Map<String, Object> response = new HashMap<>();
        
        if (isAuthenticated) {
            // Utilizator autentificat (admin/tehnician)
            log.info("Authenticated user scan - redirecting to orders page");
            response.put("isAuthenticated", true);
            response.put("redirectUrl", "/orders?filter=" + orderUuid);
        } else {
            // Utilizator neautentificat (client)
            log.info("Unauthenticated user scan - redirecting to public order view");
            response.put("isAuthenticated", false);
            response.put("redirectUrl", "/public/order/" + orderUuid);
        }
        
        return ResponseEntity.ok(response);
    }
}
