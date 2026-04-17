package com.eaap.controller;

import com.eaap.dto.ApiResponse;
import com.eaap.service.MLProxyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/eda")
@RequiredArgsConstructor
public class EDAController {

    private final MLProxyService mlProxyService;

    @GetMapping("/correlation")
    public ResponseEntity<ApiResponse<Map<String, Object>>> correlation() {
        return ResponseEntity.ok(ApiResponse.ok(mlProxyService.getCorrelation()));
    }

    @GetMapping("/distributions")
    public ResponseEntity<ApiResponse<Map<String, Object>>> distributions() {
        return ResponseEntity.ok(ApiResponse.ok(mlProxyService.getDistributions()));
    }

    @GetMapping("/attrition-by")
    public ResponseEntity<ApiResponse<Map<String, Object>>> attritionBy(
            @RequestParam(defaultValue = "Department") String groupBy) {
        return ResponseEntity.ok(ApiResponse.ok(mlProxyService.getAttritionBy(groupBy)));
    }
}
