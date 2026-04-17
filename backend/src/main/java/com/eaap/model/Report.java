package com.eaap.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String filename;

    private String reportType; // FULL, SUMMARY, ATTRITION

    @CreationTimestamp
    private LocalDateTime generatedAt;

    private String filePath;

    private String generatedBy;
}
