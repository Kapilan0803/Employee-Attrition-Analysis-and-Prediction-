package com.eaap.controller;

import com.eaap.dto.ApiResponse;
import com.eaap.model.User;
import com.eaap.model.UserRole;
import com.eaap.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        users.forEach(u -> u.setPasswordHash(null));
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<User>> updateRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(UserRole.valueOf(body.get("role").toUpperCase()));
        userRepository.save(user);
        user.setPasswordHash(null);
        return ResponseEntity.ok(ApiResponse.ok("Role updated", user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("User deleted", "done"));
    }
}
