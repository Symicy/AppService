package com.example.backend.service;

import com.example.backend.domain.Client;
import com.example.backend.domain.Order;
import com.example.backend.domain.OrderLog;
import com.example.backend.dto.OrderDetailDTO;
import com.example.backend.repo.OrderRepo;
import com.example.backend.specification.OrderSpecification;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@Transactional(rollbackOn = Exception.class)
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepo orderRepo;
    private final OrderLogService orderLogService;
    private final UserService userService;
    private final ClientService clientService; // Adaugă această dependență

    public Order addOrder(Order order) {
        log.info("Adding new order for client ID: {}", order.getClient().getId());
        
        // Salvăm ID-ul clientului înainte de a salva comanda
        Long clientId = order.getClient().getId();
        Order savedOrder = orderRepo.save(order);
        
        // Obținem detalii client folosind ID-ul
        String clientInfo = "Unknown Client";
        try {
            Client client = clientService.getClientById(clientId)
                .orElse(null);
            
            if (client != null) {
                clientInfo = client.getName() + " " + client.getSurname();
            }
        } catch (Exception e) {
            log.error("Could not fetch client details for ID: {}", clientId, e);
        }
        
        // Creare log pentru adăugarea comenzii
        OrderLog orderLog = new OrderLog();
        orderLog.setOrder(savedOrder);
        orderLog.setUser(order.getUser());
        orderLog.setMessage("Order created with " + savedOrder.getDevices().size() + 
                           " device(s) for client " + clientInfo);
        orderLogService.addOrderLog(orderLog);
        
        return savedOrder;
    }

    public Optional<Order> getOrderById(Long id) {
        log.info("Fetching order by ID: {}", id);
        return orderRepo.findOrderById(id);
    }

    public List<Order> getAllOrders() {
        log.info("Fetching all orders");
        return orderRepo.findAll();
    }

    public void deleteOrder(Long id) {
        log.info("Deleting order with ID: {}", id);
        if (!orderRepo.existsById(id)) {
            log.warn("Order with ID: {} not found", id);
            throw new RuntimeException("Order not found with ID: " + id);
        }
        orderRepo.deleteById(id);
        log.info("Order with ID: {} deleted successfully", id);
    }

    // Modifică metoda updateOrder pentru a adăuga un log
    public Order updateOrder(Long id, Order updatedOrder) {
        log.info("Updating order with ID: {}", id);
        return orderRepo.findOrderById(id)
                .map(order -> {
                    String oldStatus = order.getStatus();
                    boolean statusChanged = false;
                    
                    if (updatedOrder.getClient() != null) {
                        order.setClient(updatedOrder.getClient());
                    }
                    if (updatedOrder.getUser() != null) {
                        order.setUser(updatedOrder.getUser());
                    }
                    if (updatedOrder.getStatus() != null && !updatedOrder.getStatus().equals(oldStatus)) {
                        order.setStatus(updatedOrder.getStatus());
                        statusChanged = true;
                    }
                    
                    Order savedOrder = orderRepo.save(order);
                    
                    // Adaugă log pentru actualizarea comenzii
                    OrderLog orderLog = new OrderLog();
                    orderLog.setOrder(savedOrder);
                    orderLog.setUser(updatedOrder.getUser() != null ? updatedOrder.getUser() : order.getUser());
                    
                    if (statusChanged) {
                        orderLog.setMessage("Status changed from '" + oldStatus + "' to '" + 
                                           updatedOrder.getStatus() + "'");
                    } else {
                        orderLog.setMessage("Order details updated");
                    }
                    
                    orderLogService.addOrderLog(orderLog);
                    
                    log.info("Order with ID: {} updated successfully", id);
                    return savedOrder;
                })  
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + id));
    }

    public Page<Order> getFilteredPagedOrders(String searchTerm, String status, Long deviceId, Pageable pageable) {
        log.info("Filtering paged orders: searchTerm={}, status={}, deviceId={}, page={}, size={}", 
                 searchTerm, status, deviceId, pageable.getPageNumber(), pageable.getPageSize());
        
        Specification<Order> spec = OrderSpecification.filterOrders(searchTerm, status, deviceId);
        return orderRepo.findAll(spec, pageable);
    }

    public Optional<OrderDetailDTO> getOrderDetailsById(Long id) {
        log.info("Fetching complete order details by ID: {}", id);
        return orderRepo.findOrderById(id)
                .map(order -> {
                    return new OrderDetailDTO(
                        order.getId(),
                        order.getCreatedAt(),
                        order.getStatus(),
                        order.getClient(),
                        order.getDevices()
                    );
                });
    }

    /**
     * Actualizează doar statusul comenzii
     */
    public Order updateOrderStatus(Long id, String status) {
        log.info("Updating order status for order ID: {}, new status: {}", id, status);
        return orderRepo.findOrderById(id)
                .map(order -> {
                    // Salvează statusul anterior pentru log
                    String oldStatus = order.getStatus();
                    
                    // Actualizează statusul doar dacă este diferit
                    if (!status.equals(order.getStatus())) {
                        order.setStatus(status);
                        log.info("Order status updated to: {} for order ID: {}", status, id);
                        
                        Order savedOrder = orderRepo.save(order);
                        
                        // Creare log pentru actualizarea statusului
                        OrderLog orderLog = new OrderLog();
                        orderLog.setOrder(savedOrder);
                        orderLog.setUser(order.getUser());  // Utilizatorul din comandă
                        orderLog.setMessage("Status changed from '" + oldStatus + "' to '" + status + "'");
                        orderLogService.addOrderLog(orderLog);
                        
                        return savedOrder;
                    }
                    
                    return order;
                })
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + id));
    }
    
    /**
     * Marchează comanda ca fiind predată și actualizează toate dispozitivele
     */
    public Order markOrderAsDelivered(Long id) {
        log.info("Marking order as delivered for order ID: {}", id);
        return orderRepo.findOrderById(id)
                .map(order -> {
                    // Verifică dacă comanda este finalizată
                    if (!"FINALIZAT".equals(order.getStatus())) {
                        throw new IllegalStateException("Order must be in FINALIZAT status to be marked as delivered");
                    }
                    
                    // Salvează statusul anterior pentru log
                    String oldStatus = order.getStatus();
                    
                    // Actualizează statusul comenzii
                    order.setStatus("PREDAT");
                    
                    // Actualizează statusul tuturor dispozitivelor
                    order.getDevices().forEach(device -> {
                        device.setStatus("PREDAT");
                    });
                    
                    Order savedOrder = orderRepo.save(order);
                    
                    // Creare log pentru predarea comenzii
                    OrderLog orderLog = new OrderLog();
                    orderLog.setOrder(savedOrder);
                    orderLog.setUser(order.getUser());
                    orderLog.setMessage("Order marked as delivered to client with " + 
                                       order.getDevices().size() + " device(s)");
                    orderLogService.addOrderLog(orderLog);
                    
                    log.info("Order marked as delivered for order ID: {}", id);
                    return savedOrder;
                })
                .orElseThrow(() -> new RuntimeException("Order not found with ID: " + id));
    }
    
    /**
     * Verifică dacă comanda poate fi marcată ca predată (are status FINALIZAT)
     */
    public boolean canBeMarkedAsDelivered(Long id) {
        return orderRepo.findOrderById(id)
                .map(order -> "FINALIZAT".equals(order.getStatus()))
                .orElse(false);
    }
}