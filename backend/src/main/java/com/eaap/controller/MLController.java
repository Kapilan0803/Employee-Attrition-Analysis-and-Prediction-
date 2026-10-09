package com.eaap.controller;

import com.eaap.dto.ApiResponse;
import com.eaap.service.MLProxyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ml")
@RequiredArgsConstructor
public class MLController {

    private final MLProxyService mlProxyService;

    @PostMapping("/train")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> train() {
        Map<String, Object> result = mlProxyService.trainModel();
        return ResponseEntity.ok(ApiResponse.ok("Model trained successfully", result));
    }

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> metrics() {
        Map<String, Object> result = mlProxyService.getModelMetrics();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/predict")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> predict(@RequestBody Map<String, Object> employeeData) {
        Map<String, Object> result = mlProxyService.predict(employeeData);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/predict-batch")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> predictBatch() {
        Map<String, Object> result = mlProxyService.predictBatch();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/feature-importance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> featureImportance() {
        Map<String, Object> result = mlProxyService.getFeatureImportance();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/forecast")
    public ResponseEntity<ApiResponse<Map<String, Object>>> forecast(@RequestParam(defaultValue = "12") int periods) {
        Map<String, Object> result = mlProxyService.getForecast(periods);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/cohort")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cohort() {
        Map<String, Object> result = mlProxyService.getCohortAnalysis();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> modelHealth() {
        Map<String, Object> result = mlProxyService.getModelHealth();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Map<String, Object>>> predictionHistory() {
        Map<String, Object> result = mlProxyService.getPredictionHistory();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/shap/global")
    public ResponseEntity<ApiResponse<Map<String, Object>>> shapGlobal() {
        Map<String, Object> result = mlProxyService.getGlobalShap();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @PostMapping("/shap/local")
    @PreAuthorize("hasAnyRole('ADMIN','HR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> shapLocal(@RequestBody Map<String, Object> employeeData) {
        Map<String, Object> result = mlProxyService.getLocalShap(employeeData);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
