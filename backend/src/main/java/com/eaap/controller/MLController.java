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

    @GetMapping("/feature-importance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> featureImportance() {
        Map<String, Object> result = mlProxyService.getFeatureImportance();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
