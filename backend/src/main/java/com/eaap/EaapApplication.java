package com.eaap;

import com.eaap.model.Dataset;
import com.eaap.model.Notification;
import com.eaap.model.Report;
import com.eaap.model.User;
import com.eaap.model.UserRole;
import com.eaap.repository.DatasetRepository;
import com.eaap.repository.NotificationRepository;
import com.eaap.repository.ReportRepository;
import com.eaap.repository.UserRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.File;
import java.io.FileReader;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@SpringBootApplication
public class EaapApplication {

    public static void main(String[] args) {
        SpringApplication.run(EaapApplication.class, args);
    }

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository,
                                   DatasetRepository datasetRepository,
                                   NotificationRepository notificationRepository,
                                   ReportRepository reportRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            // Create required directories
            File uploadsDir = new File("./uploads");
            File reportsDir = new File("./reports");
            File modelsDir = new File("./models");
            File dataDir = new File("./data");
            uploadsDir.mkdirs();
            reportsDir.mkdirs();
            modelsDir.mkdirs();
            dataDir.mkdirs();

            // Seed default users
            if (userRepository.count() == 0) {
                userRepository.save(User.builder()
                        .username("admin").email("admin@eaap.com")
                        .passwordHash(passwordEncoder.encode("admin123"))
                        .role(UserRole.ADMIN).build());
                userRepository.save(User.builder()
                        .username("hr_manager").email("hr@eaap.com")
                        .passwordHash(passwordEncoder.encode("hr123"))
                        .role(UserRole.HR).build());
                userRepository.save(User.builder()
                        .username("viewer").email("viewer@eaap.com")
                        .passwordHash(passwordEncoder.encode("view123"))
                        .role(UserRole.VIEWER).build());
                System.out.println("✅ Default users seeded: admin/admin123, hr_manager/hr123, viewer/view123");
            }

            // Find source CSV from candidate locations
            List<String> candidatePaths = List.of(
                    "./uploads/ibm_hr_attrition.csv",
                    "../sample_data/ibm_hr_attrition.csv",
                    "../../sample_data/ibm_hr_attrition.csv",
                    "./sample_data/ibm_hr_attrition.csv",
                    System.getProperty("user.dir") + "/../sample_data/ibm_hr_attrition.csv"
            );

            File targetCsv = new File(uploadsDir, "ibm_hr_attrition.csv").getCanonicalFile();
            if (!targetCsv.exists()) {
                for (String candidate : candidatePaths) {
                    File src = new File(candidate).getCanonicalFile();
                    if (src.exists() && !src.equals(targetCsv)) {
                        try {
                            Files.copy(src.toPath(), targetCsv.toPath(), StandardCopyOption.REPLACE_EXISTING);
                            System.out.println("✅ Copied sample CSV to " + targetCsv.getAbsolutePath());
                            break;
                        } catch (Exception e) {
                            System.out.println("⚠️ Could not copy sample CSV: " + e.getMessage());
                        }
                    }
                }
            }

            // Ensure an active dataset is registered
            Optional<Dataset> activeOpt = datasetRepository.findByIsActiveTrue();
            boolean needRegister = activeOpt.isEmpty() || !new File(activeOpt.get().getFilePath()).exists();

            if (needRegister && targetCsv.exists()) {
                try (Reader reader = new FileReader(targetCsv);
                     CSVParser parser = new CSVParser(reader,
                             CSVFormat.DEFAULT.withFirstRecordAsHeader()
                                     .withIgnoreHeaderCase().withTrim())) {
                    List<String> columns = new ArrayList<>(parser.getHeaderMap().keySet());
                    int rowCount = parser.getRecords().size();

                    // If existing dataset exists, update it, else create new
                    Dataset dataset;
                    if (activeOpt.isPresent()) {
                        dataset = activeOpt.get();
                        dataset.setFilePath(targetCsv.getAbsolutePath());
                        dataset.setRowCount(rowCount);
                        dataset.setColumnsJson(String.join(",", columns));
                        dataset.setActive(true);
                    } else {
                        dataset = Dataset.builder()
                                .filename("ibm_hr_attrition.csv")
                                .originalName("IBM HR Employee Attrition & Performance Dataset.csv")
                                .filePath(targetCsv.getAbsolutePath())
                                .rowCount(rowCount)
                                .columnsJson(String.join(",", columns))
                                .isActive(true)
                                .uploadedBy("system")
                                .build();
                    }
                    datasetRepository.save(dataset);
                    System.out.println("✅ Active default dataset loaded: " + rowCount + " rows from " + targetCsv.getAbsolutePath());
                } catch (Exception e) {
                    System.out.println("⚠️ Could not register default dataset: " + e.getMessage());
                }
            }

            // Seed default notifications / alerts if empty
            if (notificationRepository.count() == 0 && targetCsv.exists()) {
                try (Reader reader = new FileReader(targetCsv);
                     CSVParser parser = new CSVParser(reader,
                             CSVFormat.DEFAULT.withFirstRecordAsHeader()
                                     .withIgnoreHeaderCase().withTrim())) {
                    List<Notification> defaultAlerts = new ArrayList<>();
                    int count = 0;
                    for (CSVRecord r : parser) {
                        if (count >= 12) break;
                        String empId = safeGet(r, "EmployeeNumber");
                        if (empId.isEmpty()) empId = "EMP-" + (count + 1);
                        String dept = safeGet(r, "Department");
                        String role = safeGet(r, "JobRole");
                        String overtime = safeGet(r, "OverTime");
                        double income = parseDouble(safeGet(r, "MonthlyIncome"));
                        double jobSat = parseDouble(safeGet(r, "JobSatisfaction"));
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
                            message = "Flight risk departure pattern matched";
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
                                    .isRead(count > 6) // First few unread
                                    .build();
                            defaultAlerts.add(n);
                            count++;
                        }
                    }
                    if (!defaultAlerts.isEmpty()) {
                        notificationRepository.saveAll(defaultAlerts);
                        System.out.println("✅ Seeded " + defaultAlerts.size() + " default workforce risk alerts");
                    }
                } catch (Exception e) {
                    System.out.println("⚠️ Could not seed default notifications: " + e.getMessage());
                }
            }

            // Seed default report if empty
            if (reportRepository.count() == 0) {
                File defaultReportFile = new File(reportsDir, "eaap_executive_attrition_report_2026.pdf");
                if (!defaultReportFile.exists()) {
                    File mlReport = new File("../ml-service/reports/eaap_executive_attrition_report_2026.pdf");
                    if (mlReport.exists()) {
                        try {
                            Files.copy(mlReport.toPath(), defaultReportFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                        } catch (Exception ignored) {}
                    }
                }
                Report defaultReport = Report.builder()
                        .filename("eaap_executive_attrition_report_2026.pdf")
                        .reportType("FULL")
                        .filePath(defaultReportFile.getAbsolutePath())
                        .generatedBy("admin")
                        .build();
                reportRepository.save(defaultReport);
                System.out.println("✅ Seeded default executive PDF analytics report");
            }
        };
    }

    private static String safeGet(CSVRecord r, String col) {
        try {
            return r.get(col) != null ? r.get(col).trim() : "";
        } catch (Exception e) {
            return "";
        }
    }

    private static double parseDouble(String val) {
        try {
            return Double.parseDouble(val);
        } catch (Exception e) {
            return -1;
        }
    }
}
