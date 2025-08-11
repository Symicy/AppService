package com.example.backend.resource;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;

import com.example.backend.security.JwtUtil;
import com.example.backend.domain.User;
import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterResponse;
import com.example.backend.dto.UserListDTO;
import com.example.backend.dto.UserUpdateDTO;
import com.example.backend.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserResource {
    private final UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> addUser(@RequestBody User user) {
        // Debug current authentication
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("🔍 Registration attempt:");
        System.out.println("🔍 Current user: " + (auth != null ? auth.getName() : "null"));
        System.out.println("🔍 Current authorities: " + (auth != null ? auth.getAuthorities() : "null"));
        System.out.println("🔍 Has ROLE_ADMIN: " + (auth != null ? auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")) : "false"));
        System.out.println("🔍 Authentication class: " + (auth != null ? auth.getClass().getSimpleName() : "null"));
        
        try {
            log.info("Creating new user: {}", user.getUsername());
            User savedUser = userService.registerUser(user);

            RegisterResponse response = new RegisterResponse();
            response.setId(savedUser.getId());
            response.setUsername(savedUser.getUsername());
            response.setEmail(savedUser.getEmail());
            response.setPhone(savedUser.getPhone());
            response.setRole(savedUser.getRole());

            return ResponseEntity.created(URI.create("/api/users/register/" + savedUser.getId()))
                    .body(response);
        } catch (Exception e) {
            log.error("Error creating user: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Get user details
            User user = userService.getUserByUsername(loginRequest.getUsername()).orElse(null);
            
            if (user == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "User not found");
                return ResponseEntity.status(401).body(error);
            }
            
            // Generate JWT token with user data
            String jwt = jwtUtil.generateToken(
                user.getUsername(), 
                user.getRole(), 
                user.getEmail(), 
                user.getId()
            );
            
            // Create response with user info
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("username", user.getUsername());
            response.put("role", user.getRole());
            response.put("email", user.getEmail());
            response.put("fullName", user.getUsername());
            response.put("userId", user.getId());
            response.put("message", "Login successful");
            
            log.info("User {} logged in successfully with role {}", user.getUsername(), user.getRole());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Login failed for user {}: {}", loginRequest.getUsername(), e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid username or password");
            return ResponseEntity.status(401).body(error);
        }
    }

    // Debug endpoint to check JWT tokens
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                String username = jwtUtil.getUsernameFromToken(token);
                String role = jwtUtil.getRoleFromToken(token);
                String email = jwtUtil.getEmailFromToken(token);
                Long userId = jwtUtil.getUserIdFromToken(token);
                
                Map<String, Object> userInfo = new HashMap<>();
                userInfo.put("username", username);
                userInfo.put("role", role);
                userInfo.put("email", email);
                userInfo.put("userId", userId);
                userInfo.put("tokenValid", jwtUtil.validateJwtToken(token));
                userInfo.put("tokenExpired", jwtUtil.isTokenExpired(token));
                
                return ResponseEntity.ok(userInfo);
            } catch (Exception e) {
                return ResponseEntity.status(401).body("Invalid token: " + e.getMessage());
            }
        }
        return ResponseEntity.status(401).body("No token provided");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable(value = "id") Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElseGet(ResponseEntity.notFound()::build);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<UserListDTO>> getAllUsers() {
        List<UserListDTO> users = userService.getAllUsers().stream()
            .map(user -> {
                UserListDTO dto = new UserListDTO();
                dto.setId(user.getId());
                dto.setUsername(user.getUsername());
                dto.setEmail(user.getEmail());
                dto.setPhone(user.getPhone());
                dto.setRole(user.getRole());
                dto.setCreatedAt(user.getCreatedAt());
                return dto;
            })
            .toList();
        return ResponseEntity.ok(users);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable(value = "id") Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/update/{id}")
    public ResponseEntity<UserUpdateDTO> updateUser(@PathVariable(value = "id") Long id,
                                         @RequestBody User updatedUser) {
        User user = userService.updateUser(id, updatedUser);
        
        // Convertim User în UserUpdateDTO pentru a nu expune parola
        UserUpdateDTO responseDTO = new UserUpdateDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getPhone(),
            user.getRole(),
            user.getCreatedAt()
        );
        
        return ResponseEntity.ok(responseDTO);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable(value = "email") String email) {
        return userService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElseGet(ResponseEntity.notFound()::build);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable(value = "username") String username) {
        return userService.getUserByUsername(username)
                .map(ResponseEntity::ok)
                .orElseGet(ResponseEntity.notFound()::build);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable(value = "role") String role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }
}