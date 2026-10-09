package com.eaap.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private String severity; // HIGH, MEDIUM, LOW

    private String employeeId;

    private String employeeName;

    private String department;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private boolean isRead;
}
