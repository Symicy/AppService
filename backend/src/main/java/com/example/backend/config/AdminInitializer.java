package com.example.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.backend.domain.User;
import com.example.backend.repo.UserRepo;

@Component
public class AdminInitializer implements CommandLineRunner {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public AdminInitializer(UserRepo userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepo.findUsersByRole("ADMIN").isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");  // ← Change your username here
            admin.setPassword(passwordEncoder.encode("admin123"));  // ← Change your password here
            admin.setEmail("kivanetservice@live.com");  // ← Change your email here
            admin.setRole("ADMIN");
            userRepo.save(admin);
            System.out.println("Admin user created with custom credentials");
        }
    }
}