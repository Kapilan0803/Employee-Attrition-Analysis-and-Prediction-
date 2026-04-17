package com.eaap;

import com.eaap.model.Dataset;
import com.eaap.model.User;
import com.eaap.model.UserRole;
import com.eaap.repository.DatasetRepository;
import com.eaap.repository.UserRepository;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.io.File;
import java.io.FileReader;
import java.io.Reader;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
public class EaapApplication {

    public static void main(String[] args) {
        SpringApplication.run(EaapApplication.class, args);
    }

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository,
                                   DatasetRepository datasetRepository,
                                   PasswordEncoder passwordEncoder) {
        return args -> {
            // Create required directories
            new File("./uploads").mkdirs();
            new File("./reports").mkdirs();
            new File("./models").mkdirs();

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

            // Auto-register IBM HR sample dataset if no datasets exist
            if (datasetRepository.count() == 0) {
                // Try several possible paths to find the sample CSV
                List<String> candidatePaths = List.of(
                        "../sample_data/ibm_hr_attrition.csv",
                        "../../sample_data/ibm_hr_attrition.csv",
                        "./sample_data/ibm_hr_attrition.csv",
                        System.getProperty("user.dir") + "/../sample_data/ibm_hr_attrition.csv"
                );

                for (String candidate : candidatePaths) {
                    File csvFile = new File(candidate).getCanonicalFile();
                    if (csvFile.exists()) {
                        try (Reader reader = new FileReader(csvFile);
                             CSVParser parser = new CSVParser(reader,
                                     CSVFormat.DEFAULT.withFirstRecordAsHeader()
                                             .withIgnoreHeaderCase().withTrim())) {
                            List<String> columns = new ArrayList<>(parser.getHeaderMap().keySet());
                            int rowCount = parser.getRecords().size();

                            Dataset dataset = Dataset.builder()
                                    .filename("ibm_hr_attrition.csv")
                                    .originalName("ibm_hr_attrition.csv")
                                    .filePath(csvFile.getAbsolutePath())
                                    .rowCount(rowCount)
                                    .columnsJson(String.join(",", columns))
                                    .isActive(true)
                                    .uploadedBy("system")
                                    .build();
                            datasetRepository.save(dataset);
                            System.out.println("✅ Sample IBM HR dataset auto-loaded: " + rowCount + " rows from " + csvFile.getAbsolutePath());
                        } catch (Exception e) {
                            System.out.println("⚠️ Could not load sample dataset: " + e.getMessage());
                        }
                        break;
                    }
                }
            }
        };
    }
}
