package com.example.backend.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.domain.User;

public interface UserRepo extends JpaRepository<User, Long> {
    Optional<User> findUserById(Long id);
    Optional<User> findUserByEmail(String email);
    Optional<User> findUserByUsername(String username);
    Optional<User> findByUsername(String username);
    List<User> findUsersByRole(String role);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}