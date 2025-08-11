package com.example.backend.resource;

import com.example.backend.dto.ClientListDTO;

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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.service.ClientService;
import com.example.backend.domain.Client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;

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
    public ResponseEntity<List<ClientListDTO>> getAllClients() {
        List<ClientListDTO> clients = clientService.getAllClients().stream()
            .map(client -> new ClientListDTO(
                client.getId(),
                client.getName(),
                client.getSurname(),
                null, // email not needed for order form
                null, // phone not needed for order form
                client.getType(),
                client.getCui()
            ))
            .toList();
        return ResponseEntity.ok(clients);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/nrClients")
    public ResponseEntity<Long> getNumberOfClients() {
        return ResponseEntity.ok(clientService.getNumberOfClients());
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

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/filter")
    public ResponseEntity<Page<com.example.backend.dto.ClientListDTO>> getFilteredClients(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false, defaultValue = "all") String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        log.info("Received paginated filter request: search={}, type={}, page={}, size={}", 
                 searchTerm, type, page, size);
        Pageable pageable = PageRequest.of(
            page, 
            size, 
            sortDir.equalsIgnoreCase("asc") ? 
                Sort.by(sortBy).ascending() : 
                Sort.by(sortBy).descending()
        );
        Page<Client> clients = clientService.getFilteredPagedClients(searchTerm, type, pageable);
        Page<com.example.backend.dto.ClientListDTO> dtoPage = clients.map(client -> new com.example.backend.dto.ClientListDTO(
            client.getId(),
            client.getName(),
            client.getSurname(),
            client.getEmail(),
            client.getPhone(),
            client.getType(),
            client.getCui()
        ));
        return ResponseEntity.ok(dtoPage);
    }
}