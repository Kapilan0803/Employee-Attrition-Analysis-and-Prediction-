package com.eaap.service;

import com.eaap.model.Dataset;
import com.eaap.repository.DatasetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MLProxyService {

    private final DatasetRepository datasetRepository;
    private final RestTemplate restTemplate;

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    public String getActiveDatasetPath() {
        Optional<Dataset> datasetOpt = datasetRepository.findByIsActiveTrue();
        if (datasetOpt.isPresent()) {
            java.io.File f = new java.io.File(datasetOpt.get().getFilePath());
            if (f.exists()) return f.getAbsolutePath();
        }
        java.io.File fb1 = new java.io.File("./uploads/ibm_hr_attrition.csv");
        if (fb1.exists()) return fb1.getAbsolutePath();
        java.io.File fb2 = new java.io.File("../sample_data/ibm_hr_attrition.csv");
        if (fb2.exists()) return fb2.getAbsolutePath();
        if (datasetOpt.isPresent()) return datasetOpt.get().getFilePath();
        throw new RuntimeException("No active dataset. Please upload and activate a dataset first.");
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> trainModel() {
        String datasetPath = getActiveDatasetPath();
        Map<String, String> request = Map.of("csv_path", datasetPath);
        ResponseEntity<Map> response = restTemplate.postForEntity(
                mlServiceUrl + "/ml/train", request, Map.class);
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getModelMetrics() {
        ResponseEntity<Map> response = restTemplate.getForEntity(
                mlServiceUrl + "/ml/metrics", Map.class);
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> predict(Map<String, Object> employeeData) {
        ResponseEntity<Map> response = restTemplate.postForEntity(
                mlServiceUrl + "/ml/predict", employeeData, Map.class);
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> predictBatch() {
        String datasetPath = getActiveDatasetPath();
        Map<String, String> request = Map.of("csv_path", datasetPath);
        ResponseEntity<Map> response = restTemplate.postForEntity(
                mlServiceUrl + "/ml/predict-batch", request, Map.class);
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getFeatureImportance() {
        ResponseEntity<Map> response = restTemplate.getForEntity(
                mlServiceUrl + "/ml/feature-importance", Map.class);
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getCorrelation() {
        String datasetPath = getActiveDatasetPath();
        Map<String, String> request = Map.of("csv_path", datasetPath);
        ResponseEntity<Map> response = restTemplate.postForEntity(
                mlServiceUrl + "/eda/correlation", request, Map.class);
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getDistributions() {
        String datasetPath = getActiveDatasetPath();
        Map<String, String> request = Map.of("csv_path", datasetPath);
        ResponseEntity<Map> response = restTemplate.postForEntity(
                mlServiceUrl + "/eda/distributions", request, Map.class);
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getAttritionBy(String groupBy) {
        String datasetPath = getActiveDatasetPath();
        Map<String, String> request = Map.of("csv_path", datasetPath, "group_by", groupBy);
        ResponseEntity<Map> response = restTemplate.postForEntity(
                mlServiceUrl + "/eda/attrition-by", request, Map.class);
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> runClustering() {
        String datasetPath = getActiveDatasetPath();
        Map<String, String> request = Map.of("csv_path", datasetPath);
        ResponseEntity<Map> response = restTemplate.postForEntity(
                mlServiceUrl + "/cluster/run", request, Map.class);
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> generateReport(String reportType) {
        String datasetPath = getActiveDatasetPath();
        Map<String, String> request = Map.of("csv_path", datasetPath, "report_type", reportType);
        ResponseEntity<Map> response = restTemplate.postForEntity(
                mlServiceUrl + "/reports/generate", request, Map.class);
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getForecast(int periods) {
        String datasetPath = getActiveDatasetPath();
        Map<String, Object> request = Map.of("csv_path", datasetPath, "periods", periods);
        ResponseEntity<Map> response = restTemplate.postForEntity(
                mlServiceUrl + "/forecast/forecast", request, Map.class);
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getCohortAnalysis() {
        String datasetPath = getActiveDatasetPath();
        Map<String, String> request = Map.of("csv_path", datasetPath);
        ResponseEntity<Map> response = restTemplate.postForEntity(
                mlServiceUrl + "/forecast/cohort", request, Map.class);
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getModelHealth() {
        ResponseEntity<Map> response = restTemplate.getForEntity(
                mlServiceUrl + "/monitor/health", Map.class);
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getPredictionHistory() {
        ResponseEntity<Map> response = restTemplate.getForEntity(
                mlServiceUrl + "/monitor/history", Map.class);
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getGlobalShap() {
        String datasetPath = getActiveDatasetPath();
        Map<String, String> request = Map.of("csv_path", datasetPath);
        ResponseEntity<Map> response = restTemplate.postForEntity(
                mlServiceUrl + "/shap/global", request, Map.class);
        return response.getBody();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getLocalShap(Map<String, Object> employeeData) {
        String datasetPath = getActiveDatasetPath();
        Map<String, Object> request = Map.of("csv_path", datasetPath, "employee_data", employeeData);
        ResponseEntity<Map> response = restTemplate.postForEntity(
                mlServiceUrl + "/shap/local", request, Map.class);
        return response.getBody();
    }
}
