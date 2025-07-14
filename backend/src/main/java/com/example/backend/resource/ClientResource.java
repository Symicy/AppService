package com.example.backend.resource;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.service.ClientService;
import com.example.backend.domain.Client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientResource {
    private final ClientService clientService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/add")
    public ResponseEntity<Client> addClient(@RequestBody Client client){
        return ResponseEntity.created(URI.create("api/clients/add/" + client.getId()))
                .body(clientService.addClient(client));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<Client> getClient(@PathVariable(value = "id") Long id) {
        return clientService.getClientById(id)
                .map(ResponseEntity::ok)
                .orElseGet(ResponseEntity.notFound()::build);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<Client>> getAllClients() {
        return ResponseEntity.ok(clientService.getAllClients());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/email/{email}")
    public ResponseEntity<Client> getClientByEmail(@PathVariable(value = "email") String email) {
        return clientService.getClientByEmail(email)
                .map(ResponseEntity::ok)
                .orElseGet(ResponseEntity.notFound()::build);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/cui/{cui}")
    public ResponseEntity<Client> getClientByCui(@PathVariable(value = "cui") String cui) {
        return clientService.getClientByCui(cui)
                .map(ResponseEntity::ok)
                .orElseGet(ResponseEntity.notFound()::build);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Client>> getClientsByType(@PathVariable(value = "type") String type) {
        return ResponseEntity.ok(clientService.getClientsByType(type));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update/{id}")
    public ResponseEntity<Client> updateClient(@PathVariable(value = "id") Long id, @RequestBody Client client) {
        return ResponseEntity.ok(clientService.updateClient(id, client));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable(value = "id") Long id) {
        clientService.deleteClient(id);
        return ResponseEntity.noContent().build();
    }

    
}