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
import com.example.backend.dto.ClientOrderDetailsDTO;
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

        // Generează QR pentru client - cu toate detaliile comenzii
        String clientQrLink = "http://localhost:5173/client-order/" + savedOrder.getId();
        
        try {
            // QR pentru client
            String clientQrPath = "C:\\Users\\alxsi\\Desktop\\QrCodes\\client-order-" + savedOrder.getId() + ".png";
            com.example.backend.util.QrGenerator.generateQrCode(clientQrLink, clientQrPath);
            
            // Generează QR pentru fiecare device pentru service/technician
            if (savedOrder.getDevices() != null) {
                for (var device : savedOrder.getDevices()) {
                    String serviceQrLink = "http://localhost:5173/service-device/" + device.getId();
                    String serviceQrPath = "C:\\Users\\alxsi\\Desktop\\QrCodes\\service-device-" + device.getId() + ".png";
                    com.example.backend.util.QrGenerator.generateQrCode(serviceQrLink, serviceQrPath);
                }
            }
            
        } catch (Exception e) {
            log.error("Eroare la generarea codurilor QR pentru comanda {}", savedOrder.getId(), e);
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
    public ResponseEntity<Page<com.example.backend.dto.OrderListDTO>> getFilteredOrders(
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
        Page<Order> orders = orderService.getFilteredPagedOrders(searchTerm, status, deviceId, pageable);
        Page<com.example.backend.dto.OrderListDTO> dtoPage = orders.map(order -> new com.example.backend.dto.OrderListDTO(
            order.getId(),
            order.getClient() != null ? order.getClient().getName() + " " + order.getClient().getSurname() : "",
            order.getCreatedAt(),
            order.getStatus(),
            order.getDevices() != null ? (long) order.getDevices().size() : 0L
        ));
        return ResponseEntity.ok(dtoPage);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/details/{id}")
    public ResponseEntity<com.example.backend.dto.OrderDetailDTO> getOrderDetails(@PathVariable(value = "id") Long id) {
        return orderService.getOrderById(id)
                .map(order -> {
                    com.example.backend.dto.OrderDetailDTO dto = new com.example.backend.dto.OrderDetailDTO(
                        order.getId(),
                        order.getCreatedAt(),
                        order.getStatus(),
                        order.getClient(),
                        order.getDevices(),
                        order.getOrderLogs()
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

    /**
     * Endpoint public pentru detaliile complete ale comenzii pentru clienți
     * Folosit pentru QR code-urile scanate de clienți
     */
    @GetMapping("/client/{id}")
    public ResponseEntity<ClientOrderDetailsDTO> getClientOrderDetails(@PathVariable(value = "id") Long id) {
        log.info("Fetching client details for order ID: {}", id);
        
        return orderService.getOrderById(id)
                .map(order -> {
                    // Creăm lista de device-uri pentru client
                    List<ClientOrderDetailsDTO.DeviceDetailsDTO> deviceDTOs = order.getDevices().stream()
                            .map(device -> new ClientOrderDetailsDTO.DeviceDetailsDTO(
                                device.getId(),
                                "Device", // Default type since deviceType doesn't exist
                                device.getBrand(),
                                device.getModel(),
                                device.getSerialNumber(),
                                device.getNote(), // Using note as issue description
                                device.getStatus(),
                                device.getToDo() // Using toDo as technician notes
                            ))
                            .collect(java.util.stream.Collectors.toList());
                    
                    // Creăm DTO-ul complet pentru client
                    ClientOrderDetailsDTO clientOrder = new ClientOrderDetailsDTO(
                        order.getId(),
                        order.getClient() != null ? 
                            order.getClient().getName() + " " + order.getClient().getSurname() : 
                            "Client Name",
                        order.getClient() != null ? order.getClient().getPhone() : "",
                        order.getClient() != null ? order.getClient().getEmail() : "",
                        order.getCreatedAt(),
                        order.getStatus(),
                        "", // No notes field in Order, using empty string
                        deviceDTOs
                    );
                    return ResponseEntity.ok(clientOrder);
                })
                .orElseGet(ResponseEntity.notFound()::build);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/nrActiveOrders")
    public ResponseEntity<Long> getActiveOrdersCount() {
        log.info("Fetching count of active orders");
        return ResponseEntity.ok(orderService.getActiveOrdersCount());
    }
}