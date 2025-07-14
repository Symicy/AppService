package com.example.backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.domain.User;
import com.example.backend.repo.UserRepo;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@Transactional(rollbackOn = Exception.class)
@RequiredArgsConstructor
public class UserService {
    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public User registerUser(User user) {
        if(userExistsByEmail(user.getEmail())) {
            log.warn("User with email {} already exists", user.getEmail());
            throw new RuntimeException("User with email " + user.getEmail() + " already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        log.info("Adding user: {}", user);
        return userRepo.save(user);
    }

    public User loginUser(String username, String password)
    {
        log.info("Attempting to login user with username: {}", username);
        Optional<User> userOpt = userRepo.findUserByUsername(username);
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return userOpt.get();
        }
        log.warn("Invalid username or password for username: {}", username);
        throw new RuntimeException("Invalid username or password");
    }

    public void deleteUser(Long id) {
        log.info("Deleting user with ID: {}", id);
        userRepo.deleteById(id);
    }

    public User updateUser(Long id, User updatedUser) {
        log.info("Updating user with ID: {}", id);
        return userRepo.findUserById(id)
                .map(user -> {
                    if (updatedUser.getUsername() != null) user.setUsername(updatedUser.getUsername());
                    if (updatedUser.getPassword() != null) user.setPassword(updatedUser.getPassword());
                    if (updatedUser.getEmail() != null) user.setEmail(updatedUser.getEmail());
                    if (updatedUser.getRole() != null) user.setRole(updatedUser.getRole());
                    if (updatedUser.getPhone() != null) user.setPhone(updatedUser.getPhone());
                    return userRepo.save(user);
                })
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
    }

    public Optional<User> getUserById(Long id) {
        log.info("Fetching user by ID: {}", id);
        return userRepo.findById(id);
    }

    public List<User> getAllUsers() {
        log.info("Fetching all users");
        return userRepo.findAll();
    }

    public Optional<User> getUserByUsername(String username) {
        log.info("Fetching user by username: {}", username);
        return userRepo.findUserByUsername(username);
    }

    public Optional<User> getUserByEmail(String email) {
        log.info("Fetching user by email: {}", email);
        return userRepo.findUserByEmail(email);
    }

    public List<User> getUsersByRole(String role) {
        log.info("Fetching users by role: {}", role);
        return userRepo.findUsersByRole(role);
    }

        public boolean userExistsByEmail(String email) {
        log.info("Checking if user exists by email: {}", email);
        return userRepo.existsByEmail(email);
    }

    public boolean userExistsByUsername(String username) {
        log.info("Checking if user exists by username: {}", username);
        return userRepo.existsByUsername(username);
    }
}