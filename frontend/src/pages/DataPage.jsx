import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadDataset, listDatasets, previewDataset, activateDataset } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function DataPage() {
  const [datasets, setDatasets] = useState([]);
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
      setDatasets(res.data.data || []);
    } catch { toast.error('Failed to load datasets'); }
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
    accept: { 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    disabled: !isHR()
  });

  const handlePreview = async (id, p = 0) => {
    setLoadingPreview(true);
    setPreviewId(id);
    try {
      const res = await previewDataset(id, p);
      setPreview(res.data.data);
      setTotalPages(res.data.data.totalPages);
      setPage(p);
    } catch { toast.error('Failed to load preview'); }
    finally { setLoadingPreview(false); }
  };

  const handleActivate = async (id) => {
    try {
      await activateDataset(id);
      toast.success('Dataset activated! Dashboard will now use this data.');
      loadDatasets();
    } catch { toast.error('Failed to activate dataset'); }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Data Management</h1>
        <p className="page-subtitle">Upload CSV/XLSX employee datasets and manage them</p>
      </div>

      {/* Upload Zone */}
      {isHR() && (
        <div className="glass-card card-pad" style={{ marginBottom: 24 }}>
          <div className="chart-title">📤 Upload Dataset</div>
          <div {...getRootProps()} className={`upload-zone ${isDragActive ? 'dragging' : ''}`}>
            <input {...getInputProps()} />
            {uploading ? (
              <><span className="upload-icon">⏳</span>
                <div className="upload-text">Uploading...</div></>
            ) : isDragActive ? (
              <><span className="upload-icon">📂</span>
                <div className="upload-text">Drop the file here</div></>
            ) : (
              <><span className="upload-icon">☁️</span>
                <div className="upload-text">Drag & drop your dataset here</div>
                <div className="upload-hint">Supports CSV and XLSX files up to 50MB</div></>
            )}
          </div>
        </div>
      )}

      {/* Dataset List */}
      <div className="glass-card card-pad" style={{ marginBottom: 24 }}>
        <div className="chart-title">📋 Available Datasets</div>
        {datasets.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📂</span>
            <div className="empty-title">No datasets yet</div>
            <div className="empty-description">Upload a CSV or XLSX file to get started</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th><th>Rows</th><th>Uploaded</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map(ds => (
                  <tr key={ds.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ds.originalName}</td>
                    <td>{ds.rowCount?.toLocaleString()}</td>
                    <td>{new Date(ds.uploadDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${ds.active ? 'badge-low' : 'badge-blue'}`}>
                        {ds.active ? '✅ Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary btn-sm"
                        onClick={() => handlePreview(ds.id)}>
                        👁️ Preview
                      </button>
                      {isHR() && !ds.active && (
                        <button className="btn btn-success btn-sm"
                          onClick={() => handleActivate(ds.id)}>
                          ⚡ Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="glass-card card-pad fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="chart-title">📊 Data Preview ({preview.totalRows?.toLocaleString()} rows)</div>
            <button className="btn btn-secondary btn-sm" onClick={() => setPreview(null)}>✕ Close</button>
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
                            ) : row[h]}
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
                {totalPages > 5 && <span style={{ color: 'var(--text-muted)' }}>...</span>}
                <button className="page-btn" onClick={() => handlePreview(previewId, page + 1)} disabled={page >= totalPages - 1}>▶</button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
