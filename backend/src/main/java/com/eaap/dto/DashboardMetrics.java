package com.eaap.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardMetrics {
    private int totalEmployees;
    private double attritionRate;
    private double averageTenure;
    private double averageAge;
    private double averageMonthlyIncome;
    private int attritionCount;
    private Map<String, Long> departmentWiseAttrition;
    private Map<String, Long> departmentWiseCount;
    private Map<String, Long> genderDistribution;
    private Map<String, Long> jobRoleDistribution;
    private List<Map<String, Object>> ageDistribution;
    private List<Map<String, Object>> salaryDistribution;
    private Map<String, Double> attritionByDepartment;
}
