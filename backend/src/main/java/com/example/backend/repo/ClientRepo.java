package com.example.backend.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.domain.Client;

public interface ClientRepo extends JpaRepository<Client, Long> {
    Optional<Client> findClientById(Long id);
    Optional<Client> findByEmail(String email);
    Optional<Client> findByCui(String cui);
    List<Client> findByType(String type);
    boolean existsByEmail(String email);
    boolean existsByCui(String cui);
}