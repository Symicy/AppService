package com.example.backend.resource;

import java.net.URI;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.domain.Order;
import com.example.backend.dto.OrderDetailDTO;
import com.example.backend.dto.OrderListDTO;
import com.example.backend.service.OrderService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderResource {
    private final OrderService orderService;

    // @PreAuthorize("hasRole('ADMIN')")
    // @PostMapping("/add")
    // public ResponseEntity<Order> addOrder(@RequestBody Order order) {
    //     return ResponseEntity.created(URI.create("/api/orders/add/" + order.getId()))
    //             .body(orderService.addOrder(order));
    // }
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/add")
    public ResponseEntity<Order> addOrder(@RequestBody Order order) {
        Order savedOrder = orderService.addOrder(order);

        // Generează link-ul pentru status comandă
        //String qrLink = "http://localhost:5173/orders/" + savedOrder.getId();
        String qrLink = "http://localhost:5173/orders/";

        // Generează QR și salvează imaginea PNG într-un folder local
        try {
            String qrPath = "C:\\Users\\alxsi\\Desktop\\QrCodes\\order-" + savedOrder.getId() + ".png";
            com.example.backend.util.QrGenerator.generateQrCode(qrLink, qrPath);
            // Poți salva calea imaginii QR în entitatea Order dacă vrei
            // savedOrder.setQrPath(qrPath);
            // orderService.updateOrder(savedOrder.getId(), savedOrder);
        } catch (Exception e) {
            log.error("Eroare la generarea codului QR pentru comanda {}", savedOrder.getId(), e);
        }

        return ResponseEntity.created(URI.create("/api/orders/add/" + savedOrder.getId()))
                .body(savedOrder);
    }

    //@PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable(value = "id") Long id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .orElseGet(ResponseEntity.notFound()::build);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable(value = "id") Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update/{id}")
    public ResponseEntity<Order> updateOrder(@PathVariable(value = "id") Long id,
                                             @RequestBody Order updatedOrder) {
        return ResponseEntity.ok(orderService.updateOrder(id, updatedOrder));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/filter")
    public ResponseEntity<Page<OrderListDTO>> getFilteredOrders(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false, defaultValue = "all") String status,
            @RequestParam(required = false) Long deviceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        log.info("Received paginated filter request: search={}, status={}, deviceId={}, page={}, size={}", 
                 searchTerm, status, deviceId, page, size);
                 
        Pageable pageable = PageRequest.of(
            page, 
            size, 
            sortDir.equalsIgnoreCase("asc") ? 
                Sort.by(sortBy).ascending() : 
                Sort.by(sortBy).descending()
        );
        
        // Transformă rezultatul în DTO-uri care conțin doar datele necesare pentru tabel
        Page<OrderListDTO> orderDTOs = orderService.getFilteredPagedOrders(searchTerm, status, deviceId, pageable).map(
            order -> new OrderListDTO(
                order.getId(),
                order.getClient().getName() + " " + order.getClient().getSurname(),
                order.getCreatedAt(),
                order.getStatus(),
                (long) order.getDevices().size()
            )
        );
        
        return ResponseEntity.ok(orderDTOs);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/details/{id}")
    public ResponseEntity<OrderDetailDTO> getOrderDetails(@PathVariable(value = "id") Long id) {
        return orderService.getOrderById(id)
                .map(order -> {
                    OrderDetailDTO dto = new OrderDetailDTO(
                        order.getId(),
                        order.getCreatedAt(),
                        order.getStatus(),
                        order.getClient(), // Client complet
                        order.getDevices() // Toate dispozitivele
                    );
                    return ResponseEntity.ok(dto);
                })
                .orElseGet(ResponseEntity.notFound()::build);
    }

    /**
     * Endpoint pentru marcarea comenzii ca predată clientului
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/deliver")
    public ResponseEntity<Order> markOrderAsDelivered(@PathVariable(value = "id") Long id) {
        try {
            Order deliveredOrder = orderService.markOrderAsDelivered(id);
            return ResponseEntity.ok(deliveredOrder);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Verifică dacă comanda poate fi marcată ca predată
     */
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}/can-deliver")
    public ResponseEntity<Boolean> canOrderBeDelivered(@PathVariable(value = "id") Long id) {
        boolean canDeliver = orderService.canBeMarkedAsDelivered(id);
        return ResponseEntity.ok(canDeliver);
    }
}