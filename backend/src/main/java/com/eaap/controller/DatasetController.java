package com.eaap.controller;

import com.eaap.dto.ApiResponse;
import com.eaap.model.Dataset;
import com.eaap.service.DatasetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dataset")
@RequiredArgsConstructor
public class DatasetController {

    private final DatasetService datasetService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Dataset>> upload(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) throws Exception {
        Dataset dataset = datasetService.uploadDataset(file, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Dataset uploaded successfully", dataset));
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<Dataset>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(datasetService.getAllDatasets()));
    }

    @GetMapping("/preview/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> preview(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) throws Exception {
        Map<String, Object> preview = datasetService.getPreview(id, page, size);
        return ResponseEntity.ok(ApiResponse.ok(preview));
    }

    @PostMapping("/activate/{id}")
    public ResponseEntity<ApiResponse<Dataset>> activate(@PathVariable Long id) {
        Dataset dataset = datasetService.activateDataset(id);
        return ResponseEntity.ok(ApiResponse.ok("Dataset activated", dataset));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<?>> getActive() {
        return datasetService.getActiveDataset()
                .<ResponseEntity<ApiResponse<?>>>map(d -> ResponseEntity.ok(ApiResponse.ok(d)))
                .orElse(ResponseEntity.ok(ApiResponse.error("No active dataset")));
    }
}
