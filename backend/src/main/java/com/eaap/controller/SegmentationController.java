package com.eaap.controller;

import com.eaap.dto.ApiResponse;
import com.eaap.service.MLProxyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/segmentation")
@RequiredArgsConstructor
public class SegmentationController {

    private final MLProxyService mlProxyService;

    @PostMapping("/cluster")
    public ResponseEntity<ApiResponse<Map<String, Object>>> cluster() {
        return ResponseEntity.ok(ApiResponse.ok("Clustering complete", mlProxyService.runClustering()));
    }
}
