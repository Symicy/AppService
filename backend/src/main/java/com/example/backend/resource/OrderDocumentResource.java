package com.example.backend.resource;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.domain.OrderDocument;
import com.example.backend.service.OrderDocumentService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/order-documents")
@RequiredArgsConstructor
public class OrderDocumentResource {
    private final OrderDocumentService orderDocumentService;

    @PostMapping("/add")
    public ResponseEntity<OrderDocument> addOrderDocument(@RequestBody OrderDocument orderDocument) {
        return ResponseEntity.created(URI.create("/api/order-documents/add/" + orderDocument.getId()))
                .body(orderDocumentService.addOrderDocument(orderDocument));
    }

   @GetMapping("/{id}")
    public ResponseEntity<OrderDocument> getOrderDocument(@PathVariable(value = "id") Long id) {
        OrderDocument orderDocument = orderDocumentService.getOrderDocumentById(id);
        if (orderDocument != null) {
            return ResponseEntity.ok(orderDocument);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/all")
    public ResponseEntity<List<OrderDocument>> getAllOrderDocuments() {
        return ResponseEntity.ok(orderDocumentService.getAllOrderDocuments());
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteOrderDocument(@PathVariable(value = "id") Long id) {
        orderDocumentService.deleteOrderDocument(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<OrderDocument> updateOrderDocument(@PathVariable(value = "id") Long id,
                                                            @RequestBody OrderDocument updatedOrderDocument) {
        return ResponseEntity.ok(orderDocumentService.updateOrderDocument(id, updatedOrderDocument));
    }
}