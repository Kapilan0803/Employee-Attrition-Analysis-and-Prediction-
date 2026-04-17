import { useState, useEffect } from 'react';
import { generateReport, listReports, downloadReportUrl } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [reportType, setReportType] = useState('FULL');
  const { isHR } = useAuth();

  useEffect(() => { loadReports(); }, []);

  const loadReports = async () => {
    try {
      const res = await listReports();
      setReports(res.data.data || []);
    } catch { }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    toast.loading('Generating PDF report...', { id: 'report' });
    try {
      await generateReport(reportType);
      toast.success('✅ Report generated!', { id: 'report' });
      loadReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Report generation failed. Ensure data and model are ready.', { id: 'report' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Report Generation</h1>
        <p className="page-subtitle">Generate and download PDF analytics reports</p>
      </div>

      {/* Generate */}
      {isHR() && (
        <div className="glass-card card-pad" style={{ marginBottom: 24 }}>
          <div className="chart-title" style={{ marginBottom: 20 }}>📝 Generate New Report</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Report Type</label>
              <select className="form-select" value={reportType} onChange={e => setReportType(e.target.value)}
                style={{ width: 200 }}>
                <option value="FULL">📊 Full Report</option>
                <option value="SUMMARY">📝 Summary</option>
                <option value="ATTRITION">🚪 Attrition Focus</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={handleGenerate} disabled={generating}>
              {generating ? <><span className="loading-spinner" /> Generating...</> : '📄 Generate PDF'}
            </button>
          </div>

          <div style={{ marginTop: 16, padding: 14, background: 'rgba(124,58,237,0.08)', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>📋 Full Report includes:</strong> Executive summary, department breakdown, ML model metrics, feature importance, high-risk employee table.
          </div>
        </div>
      )}

      {/* Report List */}
      <div className="glass-card card-pad">
        <div className="chart-title" style={{ marginBottom: 20 }}>📁 Generated Reports</div>
        {reports.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📄</span>
            <div className="empty-title">No Reports Yet</div>
            <div className="empty-description">Generate your first PDF report using the form above.</div>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Report Name</th><th>Type</th><th>Generated</th><th>By</th><th>Action</th></tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 12 }}>{r.filename}</td>
                    <td><span className="badge badge-purple">{r.reportType}</span></td>
                    <td>{new Date(r.generatedAt).toLocaleString()}</td>
                    <td>{r.generatedBy}</td>
                    <td>
                      <a href={downloadReportUrl(r.id)} target="_blank" rel="noreferrer"
                        className="btn btn-success btn-sm">
                        ⬇️ Download
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
