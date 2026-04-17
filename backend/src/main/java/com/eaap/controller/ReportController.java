package com.eaap.controller;

import com.eaap.dto.ApiResponse;
import com.eaap.model.Report;
import com.eaap.model.User;
import com.eaap.repository.ReportRepository;
import com.eaap.repository.UserRepository;
import com.eaap.service.MLProxyService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final MLProxyService mlProxyService;
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<Report>> generate(
            @RequestParam(defaultValue = "FULL") String reportType,
            Authentication authentication) {
        Map<String, Object> result = mlProxyService.generateReport(reportType);
        String pdfPath = (String) result.get("pdf_path");
        String filename = (String) result.get("filename");

        Report report = Report.builder()
                .filename(filename)
                .reportType(reportType)
                .filePath(pdfPath)
                .generatedBy(authentication.getName())
                .build();
        reportRepository.save(report);
        return ResponseEntity.ok(ApiResponse.ok("Report generated", report));
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<Report>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(reportRepository.findAllByOrderByGeneratedAtDesc()));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        File file = new File(report.getFilePath());
        Resource resource = new FileSystemResource(file);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + report.getFilename() + "\"")
                .body(resource);
    }
}
