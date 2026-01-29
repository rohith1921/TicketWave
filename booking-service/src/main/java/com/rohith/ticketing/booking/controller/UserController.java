package com.rohith.ticketing.booking.controller;

import com.rohith.ticketing.booking.dto.UserDto;
import com.rohith.ticketing.booking.entity.User;
import com.rohith.ticketing.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(Principal principal) {
        String email = principal.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(new UserDto(
                user.getId(),
                user.getName(),
                user.getEmail()
        ));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> request, Principal principal) {
        String email = principal.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get new name from request
        String newName = request.get("name");

        if (newName != null && !newName.trim().isEmpty()) {
            user.setName(newName);
            userRepository.save(user); // 💾 SAVE TO DATABASE
            return ResponseEntity.ok("Profile updated successfully");
        }

        return ResponseEntity.badRequest().body("Name cannot be empty");
    }
}
