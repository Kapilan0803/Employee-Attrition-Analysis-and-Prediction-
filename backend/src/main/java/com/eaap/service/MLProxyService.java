package com.eaap.service;

import com.eaap.model.Dataset;
import com.eaap.repository.DatasetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MLProxyService {

    private final DatasetRepository datasetRepository;
    private final RestTemplate restTemplate;

    @Value("${ml.service.url}")
    private String mlServiceUrl;

    private String getActiveDatasetPath() {
        Dataset dataset = datasetRepository.findByIsActiveTrue()
                .orElseThrow(() -> new RuntimeException("No active dataset. Please upload and activate a dataset first."));
        return dataset.getFilePath();
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
}
