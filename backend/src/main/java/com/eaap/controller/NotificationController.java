package com.eaap.controller;

import com.eaap.dto.ApiResponse;
import com.eaap.model.Notification;
import com.eaap.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(notificationRepository.findAllByOrderByCreatedAtDesc()));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> getUnread() {
        return ResponseEntity.ok(ApiResponse.ok(notificationRepository.findByIsReadFalse()));
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        long count = notificationRepository.countByIsReadFalse();
        return ResponseEntity.ok(ApiResponse.ok(Map.of("count", count)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markRead(@PathVariable Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setRead(true);
        notificationRepository.save(n);
        return ResponseEntity.ok(ApiResponse.ok("Marked as read", n));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllRead() {
        List<Notification> unread = notificationRepository.findByIsReadFalse();
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", "done"));
    }
}
