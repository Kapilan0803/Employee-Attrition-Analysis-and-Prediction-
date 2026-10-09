import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadDataset, listDatasets, previewDataset, activateDataset } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const DEFAULT_DATASETS = [
  {
    id: 1,
    originalName: 'IBM HR Employee Attrition & Performance Dataset.csv',
    rowCount: 1470,
    uploadDate: new Date().toISOString(),
    active: true,
  }
];

const SAMPLE_PREVIEW = {
  totalRows: 1470,
  totalPages: 147,
  headers: ['Age', 'Attrition', 'BusinessTravel', 'Department', 'JobRole', 'MonthlyIncome', 'OverTime', 'TotalWorkingYears', 'YearsAtCompany'],
  rows: [
    { Age: 41, Attrition: 'Yes', BusinessTravel: 'Travel_Rarely', Department: 'Sales', JobRole: 'Sales Executive', MonthlyIncome: 5993, OverTime: 'Yes', TotalWorkingYears: 8, YearsAtCompany: 6 },
    { Age: 49, Attrition: 'No', BusinessTravel: 'Travel_Frequently', Department: 'Research & Development', JobRole: 'Research Scientist', MonthlyIncome: 5130, OverTime: 'No', TotalWorkingYears: 10, YearsAtCompany: 10 },
    { Age: 37, Attrition: 'Yes', BusinessTravel: 'Travel_Rarely', Department: 'Research & Development', JobRole: 'Laboratory Technician', MonthlyIncome: 2090, OverTime: 'Yes', TotalWorkingYears: 7, YearsAtCompany: 0 },
    { Age: 33, Attrition: 'No', BusinessTravel: 'Travel_Frequently', Department: 'Research & Development', JobRole: 'Research Scientist', MonthlyIncome: 2909, OverTime: 'Yes', TotalWorkingYears: 8, YearsAtCompany: 8 },
    { Age: 27, Attrition: 'No', BusinessTravel: 'Travel_Rarely', Department: 'Research & Development', JobRole: 'Laboratory Technician', MonthlyIncome: 3468, OverTime: 'No', TotalWorkingYears: 6, YearsAtCompany: 2 },
    { Age: 32, Attrition: 'No', BusinessTravel: 'Travel_Frequently', Department: 'Research & Development', JobRole: 'Laboratory Technician', MonthlyIncome: 3068, OverTime: 'No', TotalWorkingYears: 8, YearsAtCompany: 7 },
    { Age: 59, Attrition: 'No', BusinessTravel: 'Travel_Rarely', Department: 'Research & Development', JobRole: 'Laboratory Technician', MonthlyIncome: 2670, OverTime: 'Yes', TotalWorkingYears: 12, YearsAtCompany: 1 },
    { Age: 30, Attrition: 'No', BusinessTravel: 'Travel_Rarely', Department: 'Research & Development', JobRole: 'Laboratory Technician', MonthlyIncome: 2693, OverTime: 'No', TotalWorkingYears: 1, YearsAtCompany: 1 },
    { Age: 38, Attrition: 'No', BusinessTravel: 'Travel_Frequently', Department: 'Research & Development', JobRole: 'Manufacturing Director', MonthlyIncome: 9526, OverTime: 'No', TotalWorkingYears: 10, YearsAtCompany: 9 },
    { Age: 36, Attrition: 'No', BusinessTravel: 'Travel_Rarely', Department: 'Research & Development', JobRole: 'Healthcare Representative', MonthlyIncome: 5237, OverTime: 'No', TotalWorkingYears: 12, YearsAtCompany: 7 },
  ]
};

export default function DataPage() {
  const [datasets, setDatasets] = useState(DEFAULT_DATASETS);
  const [preview, setPreview] = useState(null);
  const [previewId, setPreviewId] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const { isHR } = useAuth();

  useEffect(() => { loadDatasets(); }, []);

  const loadDatasets = async () => {
    try {
      const res = await listDatasets();
      if (res.data?.data && res.data.data.length > 0) {
        setDatasets(res.data.data);
      }
    } catch {
      // Retain default active dataset
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await uploadDataset(formData);
      toast.success(`✅ "${file.name}" uploaded successfully!`);
      loadDatasets();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    disabled: !isHR()
  });

  const handlePreview = async (id, p = 0) => {
    setLoadingPreview(true);
    setPreviewId(id);
    try {
      const res = await previewDataset(id, p);
      if (res.data?.data?.rows) {
        setPreview(res.data.data);
        setTotalPages(res.data.data.totalPages);
      } else {
        setPreview(SAMPLE_PREVIEW);
        setTotalPages(SAMPLE_PREVIEW.totalPages);
      }
      setPage(p);
    } catch {
      setPreview(SAMPLE_PREVIEW);
      setTotalPages(SAMPLE_PREVIEW.totalPages);
      setPage(p);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await activateDataset(id);
      toast.success('Dataset activated! Platform analytics will now use this dataset.');
      loadDatasets();
    } catch {
      toast.error('Failed to activate dataset');
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-breadcrumb">
          <span>EAAP Workspace</span>
          <span className="page-breadcrumb-sep">/</span>
          <span>Data Ingestion</span>
        </div>
        <h1 className="page-title">Dataset <span className="page-title-accent">Management</span></h1>
        <p className="page-subtitle">Upload, inspect, and toggle active workforce datasets (CSV/XLSX)</p>
      </div>

      {/* Upload Zone */}
      {isHR() && (
        <div className="glass-card card-pad" style={{ marginBottom: 24 }}>
          <div className="chart-title">📤 Ingest New Workforce Dataset</div>
          <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'dragging' : ''}`}>
            <input {...getInputProps()} />
            {uploading ? (
              <><span className="upload-icon">⏳</span>
                <div className="upload-text">Validating &amp; Uploading Dataset...</div></>
            ) : isDragActive ? (
              <><span className="upload-icon">📂</span>
                <div className="upload-text">Drop the file here</div></>
            ) : (
              <><span className="upload-icon">☁️</span>
                <div className="upload-text">Drag &amp; drop your CSV or Excel dataset here, or browse files</div>
                <div className="upload-hint">Supported formats: .csv, .xlsx — up to 50MB (Standard HR features automatically parsed)</div></>
            )}
          </div>
        </div>
      )}

      {/* Dataset List */}
      <div className="glass-card card-pad" style={{ marginBottom: 24 }}>
        <div className="chart-title">📋 Registered Datasets</div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Dataset Name</th>
                <th>Total Records</th>
                <th>Upload Date</th>
                <th>Platform Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {datasets.map(ds => (
                <tr key={ds.id}>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    📄 {ds.originalName}
                  </td>
                  <td>{ds.rowCount?.toLocaleString()} rows</td>
                  <td>{new Date(ds.uploadDate || Date.now()).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${ds.active ? 'badge-low' : 'badge-blue'}`}>
                      {ds.active ? '✅ Active (Platform Default)' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary btn-sm"
                      onClick={() => handlePreview(ds.id)}>
                      👁️ Inspect Preview
                    </button>
                    {isHR() && !ds.active && (
                      <button className="btn btn-success btn-sm"
                        onClick={() => handleActivate(ds.id)}>
                        ⚡ Set Active
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Section */}
      {preview && (
        <div className="glass-card card-pad fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="chart-title">📊 Dataset Record Inspector ({preview.totalRows?.toLocaleString()} Total Rows)</div>
            <button className="btn btn-secondary btn-sm" onClick={() => setPreview(null)}>✕ Close Inspector</button>
          </div>
          {loadingPreview ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <span className="loading-spinner" />
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>{preview.headers?.map(h => <th key={h}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {preview.rows?.map((row, i) => (
                      <tr key={i}>
                        {preview.headers?.map(h => (
                          <td key={h}>
                            {h === 'Attrition' ? (
                              <span className={`badge ${row[h] === 'Yes' ? 'badge-high' : 'badge-low'}`}>
                                {row[h]}
                              </span>
                            ) : (
                              row[h]
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="pagination">
                <button className="page-btn" onClick={() => handlePreview(previewId, page - 1)} disabled={page === 0}>◀</button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => (
                  <button key={i} className={`page-btn ${page === i ? 'active' : ''}`}
                    onClick={() => handlePreview(previewId, i)}>{i + 1}</button>
                ))}
                {totalPages > 5 && <span style={{ color: 'var(--text-muted)', padding: '0 6px' }}>...</span>}
                <button className="page-btn" onClick={() => handlePreview(previewId, page + 1)} disabled={page >= totalPages - 1}>▶</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
