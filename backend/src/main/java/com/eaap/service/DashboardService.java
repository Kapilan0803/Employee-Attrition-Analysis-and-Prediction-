package com.eaap.service;

import com.eaap.dto.DashboardMetrics;
import com.eaap.model.Dataset;
import com.eaap.repository.DatasetRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;

import java.io.FileReader;
import java.io.Reader;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final DatasetRepository datasetRepository;

    public DashboardMetrics getMetrics() {
        Dataset activeDataset = datasetRepository.findByIsActiveTrue()
                .orElseThrow(() -> new RuntimeException("No active dataset found. Please upload and activate a dataset."));

        try (Reader reader = new FileReader(activeDataset.getFilePath());
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim())) {

            List<CSVRecord> records = csvParser.getRecords();
            int total = records.size();

            long attritionCount = records.stream()
                    .filter(r -> "yes".equalsIgnoreCase(safeGet(r, "Attrition")))
                    .count();

            double attritionRate = total > 0 ? (double) attritionCount / total * 100 : 0;

            OptionalDouble avgTenure = records.stream()
                    .mapToDouble(r -> parseDouble(safeGet(r, "YearsAtCompany")))
                    .filter(v -> v >= 0)
                    .average();

            OptionalDouble avgAge = records.stream()
                    .mapToDouble(r -> parseDouble(safeGet(r, "Age")))
                    .filter(v -> v >= 0)
                    .average();

            OptionalDouble avgIncome = records.stream()
                    .mapToDouble(r -> parseDouble(safeGet(r, "MonthlyIncome")))
                    .filter(v -> v >= 0)
                    .average();

            // Department-wise counts
            Map<String, Long> deptCount = records.stream()
                    .collect(Collectors.groupingBy(
                            r -> safeGet(r, "Department").isEmpty() ? "Unknown" : safeGet(r, "Department"),
                            Collectors.counting()
                    ));

            // Department-wise attrition count
            Map<String, Long> deptAttrition = records.stream()
                    .filter(r -> "yes".equalsIgnoreCase(safeGet(r, "Attrition")))
                    .collect(Collectors.groupingBy(
                            r -> safeGet(r, "Department").isEmpty() ? "Unknown" : safeGet(r, "Department"),
                            Collectors.counting()
                    ));

            // Department-wise attrition rate
            Map<String, Double> attritionByDept = new HashMap<>();
            deptCount.forEach((dept, count) -> {
                long attCount = deptAttrition.getOrDefault(dept, 0L);
                attritionByDept.put(dept, count > 0 ? (double) attCount / count * 100 : 0);
            });

            // Gender distribution
            Map<String, Long> genderDist = records.stream()
                    .collect(Collectors.groupingBy(
                            r -> safeGet(r, "Gender").isEmpty() ? "Unknown" : safeGet(r, "Gender"),
                            Collectors.counting()
                    ));

            // Job Role distribution
            Map<String, Long> jobRoleDist = records.stream()
                    .collect(Collectors.groupingBy(
                            r -> safeGet(r, "JobRole").isEmpty() ? "Unknown" : safeGet(r, "JobRole"),
                            Collectors.counting()
                    ));

            // Age distribution (buckets)
            List<Map<String, Object>> ageDist = buildAgeBuckets(records);

            // Salary distribution (buckets)
            List<Map<String, Object>> salaryDist = buildSalaryBuckets(records);

            return DashboardMetrics.builder()
                    .totalEmployees(total)
                    .attritionCount((int) attritionCount)
                    .attritionRate(Math.round(attritionRate * 100.0) / 100.0)
                    .averageTenure(Math.round(avgTenure.orElse(0) * 100.0) / 100.0)
                    .averageAge(Math.round(avgAge.orElse(0) * 100.0) / 100.0)
                    .averageMonthlyIncome(Math.round(avgIncome.orElse(0) * 100.0) / 100.0)
                    .departmentWiseCount(deptCount)
                    .departmentWiseAttrition(deptAttrition)
                    .attritionByDepartment(attritionByDept)
                    .genderDistribution(genderDist)
                    .jobRoleDistribution(jobRoleDist)
                    .ageDistribution(ageDist)
                    .salaryDistribution(salaryDist)
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Failed to process dataset: " + e.getMessage(), e);
        }
    }

    private String safeGet(CSVRecord record, String column) {
        try {
            return record.get(column) != null ? record.get(column).trim() : "";
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

    private List<Map<String, Object>> buildAgeBuckets(List<CSVRecord> records) {
        int[] buckets = {0, 0, 0, 0, 0};
        String[] labels = {"18-25", "26-35", "36-45", "46-55", "55+"};
        for (CSVRecord r : records) {
            double age = parseDouble(safeGet(r, "Age"));
            if (age < 26) buckets[0]++;
            else if (age < 36) buckets[1]++;
            else if (age < 46) buckets[2]++;
            else if (age < 56) buckets[3]++;
            else if (age >= 56) buckets[4]++;
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < labels.length; i++) {
            result.add(Map.of("label", labels[i], "count", buckets[i]));
        }
        return result;
    }

    private List<Map<String, Object>> buildSalaryBuckets(List<CSVRecord> records) {
        int[] buckets = {0, 0, 0, 0, 0};
        String[] labels = {"<2000", "2K-5K", "5K-10K", "10K-15K", "15K+"};
        for (CSVRecord r : records) {
            double income = parseDouble(safeGet(r, "MonthlyIncome"));
            if (income < 2000) buckets[0]++;
            else if (income < 5000) buckets[1]++;
            else if (income < 10000) buckets[2]++;
            else if (income < 15000) buckets[3]++;
            else if (income >= 15000) buckets[4]++;
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < labels.length; i++) {
            result.add(Map.of("label", labels[i], "count", buckets[i]));
        }
        return result;
    }
}
