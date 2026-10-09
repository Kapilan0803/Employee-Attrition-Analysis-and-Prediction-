package com.eaap.controller;

import com.eaap.dto.ApiResponse;
import com.eaap.model.Dataset;
import com.eaap.model.Notification;
import com.eaap.repository.DatasetRepository;
import com.eaap.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.io.FileReader;
import java.io.Reader;
import java.util.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final DatasetRepository datasetRepository;

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

    @PostMapping("/scan")
    public ResponseEntity<ApiResponse<List<Notification>>> scanWorkforce() {
        Optional<Dataset> activeOpt = datasetRepository.findByIsActiveTrue();
        if (activeOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.ok("No active dataset found", Collections.emptyList()));
        }

        Dataset dataset = activeOpt.get();
        File file = new File(dataset.getFilePath());
        if (!file.exists()) {
            return ResponseEntity.ok(ApiResponse.ok("Dataset file not accessible", Collections.emptyList()));
        }

        List<Notification> newAlerts = new ArrayList<>();
        Set<String> existingEmployeeIds = new HashSet<>();
        notificationRepository.findAll().forEach(n -> {
            if (n.getEmployeeId() != null) existingEmployeeIds.add(n.getEmployeeId());
        });

        try (Reader reader = new FileReader(file);
             CSVParser parser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim())) {

            int count = 0;
            for (CSVRecord r : parser) {
                if (count >= 15) break; // Keep alerts curated to top 15 most urgent

                String empId = safeGet(r, "EmployeeNumber");
                if (empId.isEmpty()) empId = "EMP-" + (count + 1);

                if (existingEmployeeIds.contains(empId)) {
                    continue;
                }

                String dept = safeGet(r, "Department");
                String role = safeGet(r, "JobRole");
                String overtime = safeGet(r, "OverTime");
                double income = parseDouble(safeGet(r, "MonthlyIncome"));
                double jobSat = parseDouble(safeGet(r, "JobSatisfaction"));
                double workLife = parseDouble(safeGet(r, "WorkLifeBalance"));
                double promoYears = parseDouble(safeGet(r, "YearsSinceLastPromotion"));
                double tenure = parseDouble(safeGet(r, "YearsAtCompany"));
                String attrition = safeGet(r, "Attrition");

                String severity = null;
                String message = null;

                if ("yes".equalsIgnoreCase(overtime) && income < 3500) {
                    severity = "HIGH";
                    message = "High attrition risk: Excessive overtime paired with below-market compensation (" + (role.isEmpty() ? "Staff" : role) + ")";
                } else if (promoYears >= 4 && tenure >= 3) {
                    severity = "HIGH";
                    message = "Promotion stagnation: Employee has had no advancement in " + (int) promoYears + " years";
                } else if (jobSat == 1) {
                    severity = "HIGH";
                    message = "Critical dissatisfaction score (1/4) flagged in recent employee survey";
                } else if ("yes".equalsIgnoreCase(attrition)) {
                    severity = "HIGH";
                    message = "Attrition risk alert: Employee matches flight-risk departure pattern";
                } else if (workLife == 1) {
                    severity = "MEDIUM";
                    message = "Severe work-life balance distress rating (1/4) reported";
                } else if ("yes".equalsIgnoreCase(overtime) && jobSat <= 2) {
                    severity = "MEDIUM";
                    message = "Overtime fatigue combined with sub-optimal job satisfaction";
                }

                if (severity != null) {
                    Notification n = Notification.builder()
                            .employeeId(empId)
                            .employeeName("Employee " + empId + (role.isEmpty() ? "" : " (" + role + ")"))
                            .department(dept.isEmpty() ? "General" : dept)
                            .severity(severity)
                            .message(message)
                            .isRead(false)
                            .build();
                    newAlerts.add(n);
                    existingEmployeeIds.add(empId);
                    count++;
                }
            }

            if (!newAlerts.isEmpty()) {
                notificationRepository.saveAll(newAlerts);
            }

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Scan failed: " + e.getMessage()));
        }

        return ResponseEntity.ok(ApiResponse.ok("Workforce scan complete: " + newAlerts.size() + " alerts flagged",
                notificationRepository.findAllByOrderByCreatedAtDesc()));
    }

    private String safeGet(CSVRecord r, String col) {
        try {
            return r.get(col) != null ? r.get(col).trim() : "";
        } catch (Exception e) {
            return "";
        }
    }

    private double parseDouble(String val) {
        try {
            return Double.parseDouble(val);
        } catch (Exception e) {
            return -1;
        }
    }
}
