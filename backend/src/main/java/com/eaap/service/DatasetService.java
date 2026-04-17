package com.eaap.service;

import com.eaap.model.Dataset;
import com.eaap.repository.DatasetRepository;
import lombok.RequiredArgsConstructor;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileReader;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DatasetService {

    private final DatasetRepository datasetRepository;

    @Value("${app.upload-dir}")
    private String uploadDir;

    public Dataset uploadDataset(MultipartFile file, String username) throws Exception {
        // Validate file type
        String originalName = file.getOriginalFilename();
        if (originalName == null || (!originalName.endsWith(".csv") && !originalName.endsWith(".xlsx"))) {
            throw new IllegalArgumentException("Only CSV and XLSX files are supported");
        }

        // Save file to disk
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        String uniqueName = UUID.randomUUID() + "_" + originalName;
        Path filePath = uploadPath.resolve(uniqueName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Parse CSV to get metadata
        int rowCount = 0;
        List<String> columns = new ArrayList<>();
        try (Reader reader = new FileReader(filePath.toFile());
             CSVParser parser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim())) {
            columns = new ArrayList<>(parser.getHeaderMap().keySet());
            List<CSVRecord> records = parser.getRecords();
            rowCount = records.size();
        }

        Dataset dataset = Dataset.builder()
                .filename(uniqueName)
                .originalName(originalName)
                .filePath(filePath.toString())
                .rowCount(rowCount)
                .columnsJson(String.join(",", columns))
                .isActive(false)
                .uploadedBy(username)
                .build();

        return datasetRepository.save(dataset);
    }

    public List<Dataset> getAllDatasets() {
        return datasetRepository.findAllByOrderByUploadDateDesc();
    }

    public Map<String, Object> getPreview(Long datasetId, int page, int size) throws Exception {
        Dataset dataset = datasetRepository.findById(datasetId)
                .orElseThrow(() -> new RuntimeException("Dataset not found"));

        List<Map<String, String>> rows = new ArrayList<>();
        List<String> headers = new ArrayList<>();

        try (Reader reader = new FileReader(dataset.getFilePath());
             CSVParser parser = new CSVParser(reader, CSVFormat.DEFAULT.withFirstRecordAsHeader().withIgnoreHeaderCase().withTrim())) {
            headers = new ArrayList<>(parser.getHeaderMap().keySet());
            List<CSVRecord> records = parser.getRecords();

            int start = page * size;
            int end = Math.min(start + size, records.size());

            for (int i = start; i < end; i++) {
                Map<String, String> row = new LinkedHashMap<>();
                for (String header : headers) {
                    try {
                        row.put(header, records.get(i).get(header));
                    } catch (Exception e) {
                        row.put(header, "");
                    }
                }
                rows.add(row);
            }

            return Map.of(
                    "headers", headers,
                    "rows", rows,
                    "totalRows", records.size(),
                    "page", page,
                    "size", size,
                    "totalPages", (int) Math.ceil((double) records.size() / size)
            );
        }
    }

    public Dataset activateDataset(Long datasetId) {
        // Deactivate all
        List<Dataset> all = datasetRepository.findAll();
        all.forEach(d -> d.setActive(false));
        datasetRepository.saveAll(all);

        // Activate selected
        Dataset dataset = datasetRepository.findById(datasetId)
                .orElseThrow(() -> new RuntimeException("Dataset not found"));
        dataset.setActive(true);
        return datasetRepository.save(dataset);
    }

    public Optional<Dataset> getActiveDataset() {
        return datasetRepository.findByIsActiveTrue();
    }
}
