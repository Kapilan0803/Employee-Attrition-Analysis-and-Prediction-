package com.eaap.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "datasets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Dataset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String filename;

    @Column(nullable = false)
    private String originalName;

    private String filePath;

    private int rowCount;

    @Column(columnDefinition = "TEXT")
    private String columnsJson;

    @CreationTimestamp
    private LocalDateTime uploadDate;

    private boolean isActive;

    private String uploadedBy;
}
