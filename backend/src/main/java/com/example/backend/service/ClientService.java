package com.example.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import com.example.backend.domain.Client;
import com.example.backend.repo.ClientRepo;
import com.example.backend.specification.ClientSpecification;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@Transactional(rollbackOn = Exception.class)
@RequiredArgsConstructor
public class ClientService {
    private final ClientRepo clientRepo;
    
    public Client addClient(Client client) {
        log.info("Adding new client: {}", client);
        
        // Validare câmpuri obligatorii
        if (client.getName() == null || client.getName().trim().isEmpty()) {
            throw new RuntimeException("Client name is required");
        }
        
        if (client.getSurname() == null || client.getSurname().trim().isEmpty()) {
            throw new RuntimeException("Client surname is required");
        }
        
        // Validare email unic (doar dacă este furnizat)
        if (client.getEmail() != null && !client.getEmail().trim().isEmpty()) {
            if (clientRepo.existsByEmail(client.getEmail())) {
                log.warn("Attempt to add client with existing email: {}", client.getEmail());
                throw new RuntimeException("Email already exists: " + client.getEmail());
            }
        }
        
        // Validare CUI unic (doar dacă este furnizat)
        if (client.getCui() != null && !client.getCui().trim().isEmpty()) {
            if (clientRepo.existsByCui(client.getCui())) {
                log.warn("Attempt to add client with existing CUI: {}", client.getCui());
                throw new RuntimeException("CUI already exists: " + client.getCui());
            }
        }
        
        Client savedClient = clientRepo.save(client);
        log.info("Client added successfully with ID: {}", savedClient.getId());
        return savedClient;
    }
    
    public void deleteClient(Long id) {
        log.info("Deleting client with ID: {}", id);
        clientRepo.findClientById(id)
                .ifPresentOrElse(client -> {
                    clientRepo.delete(client);
                    log.info("Client with ID: {} deleted successfully", id);
                }, () -> {
                    log.warn("Client with ID: {} not found", id);
                    throw new RuntimeException("Client not found with ID: " + id);
                });
    }

    public Client updateClient(Long id, Client updatedClient) {
        log.info("Updating client with ID: {}", id);
        return clientRepo.findClientById(id)
                .map(client -> {
                    // Validare email unic (dacă se schimbă)
                    if (updatedClient.getEmail() != null && 
                        !updatedClient.getEmail().equals(client.getEmail())) {
                        if (clientRepo.existsByEmail(updatedClient.getEmail())) {
                            throw new RuntimeException("Email already exists: " + updatedClient.getEmail());
                        }
                        client.setEmail(updatedClient.getEmail());
                    }
                    
                    // Validare CUI unic (dacă se schimbă)
                    if (updatedClient.getCui() != null && 
                        !updatedClient.getCui().equals(client.getCui())) {
                        if (clientRepo.existsByCui(updatedClient.getCui())) {
                            throw new RuntimeException("CUI already exists: " + updatedClient.getCui());
                        }
                        client.setCui(updatedClient.getCui());
                    }
                    
                    // Update other fields
                    if (updatedClient.getName() != null) {
                        client.setName(updatedClient.getName());
                    }
                    if (updatedClient.getSurname() != null) {
                        client.setSurname(updatedClient.getSurname());
                    }
                    if (updatedClient.getPhone() != null) {
                        client.setPhone(updatedClient.getPhone());
                    }
                    if (updatedClient.getType() != null) {
                        client.setType(updatedClient.getType());
                    }
                    
                    log.info("Client with ID: {} updated successfully", id);
                    return clientRepo.save(client);
                })
                .orElseThrow(() -> new RuntimeException("Client not found with ID: " + id));
    }

    public Optional<Client> getClientById(Long id) {
        log.info("Fetching client with ID: {}", id);
        return clientRepo.findClientById(id);
    }

    public List<Client> getAllClients() {
        log.info("Fetching all clients");
        return clientRepo.findAll();
    }

    public List<Client> getClientsByType(String type) {
        log.info("Fetching clients by type: {}", type);
        return clientRepo.findByType(type);
    }

    public Optional<Client> getClientByEmail(String email) {
        log.info("Fetching client by email: {}", email);
        return clientRepo.findByEmail(email);
    }

    public Optional<Client> getClientByCui(String cui) {
        log.info("Fetching client by CUI: {}", cui);
        return clientRepo.findByCui(cui);
    }

    public boolean clientExistsByEmail(String email) {
        log.info("Checking if client exists by email: {}", email);
        return clientRepo.existsByEmail(email);
    }

    public List<Client> getFilteredClients(String searchTerm, String type) {
        log.info("Filtering clients with searchTerm: {}, type: {}", searchTerm, type);
        
        Specification<Client> spec = ClientSpecification.filterClients(searchTerm, type);
        return clientRepo.findAll(spec);
    }

    public Page<Client> getFilteredPagedClients(String searchTerm, String type, Pageable pageable) {
        log.info("Filtering paged clients: searchTerm={}, type={}, page={}, size={}", 
                 searchTerm, type, pageable.getPageNumber(), pageable.getPageSize());
        
        Specification<Client> spec = ClientSpecification.filterClients(searchTerm, type);
        return clientRepo.findAll(spec, pageable);
    }

    public long getNumberOfClients() {
        log.info("Fetching total number of clients");
        return clientRepo.count();
    }
}