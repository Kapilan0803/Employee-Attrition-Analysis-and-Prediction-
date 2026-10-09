package com.eaap.controller;

import com.eaap.dto.ApiResponse;
import com.eaap.dto.DashboardMetrics;
import com.eaap.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/metrics")
    public ResponseEntity<ApiResponse<DashboardMetrics>> getMetrics() {
        DashboardMetrics metrics = dashboardService.getMetrics();
        return ResponseEntity.ok(ApiResponse.ok(metrics));
    }
}
