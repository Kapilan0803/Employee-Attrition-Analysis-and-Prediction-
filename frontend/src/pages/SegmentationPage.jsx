import { useState } from 'react';
import { runClustering } from '../api';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend
} from 'chart.js';
import toast from 'react-hot-toast';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const CLUSTER_COLORS = ['rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)', 'rgba(16,185,129,0.7)'];

export default function SegmentationPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCluster = async () => {
    setLoading(true);
    toast.loading('Running K-Means clustering...', { id: 'cluster' });
    try {
      const res = await runClustering();
      setResult(res.data.data);
      toast.success('✅ Clustering complete!', { id: 'cluster' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Clustering failed', { id: 'cluster' });
    } finally {
      setLoading(false);
    }
  };

  const scatterDatasets = result?.profiles?.map((p, i) => ({
    label: p.label,
    data: (result.scatter_data || [])
      .filter(d => d.cluster === p.cluster_id)
      .map(d => ({ x: d.x, y: d.y })),
    backgroundColor: CLUSTER_COLORS[i % CLUSTER_COLORS.length],
    pointRadius: 4,
    pointHoverRadius: 6
  }));

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Employee Segmentation</h1>
        <p className="page-subtitle">K-Means clustering: discover employee groups by behavior and risk</p>
      </div>

      <div className="glass-card card-pad" style={{ marginBottom: 24 }}>
        <button className="btn btn-primary btn-lg" onClick={handleCluster} disabled={loading}>
          {loading ? <><span className="loading-spinner" /> Clustering...</> : '🧩 Run K-Means (k=3)'}
        </button>
        <span style={{ marginLeft: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          Groups employees into: High-Risk, Stable, and High-Performer clusters
        </span>
      </div>

      {result && (
        <>
          {/* Cluster Cards */}
          <div className="clusters-grid" style={{ marginBottom: 24 }}>
            {result.profiles?.map((p, i) => (
              <div key={p.cluster_id} className="glass-card cluster-card fade-in">
                <div className="cluster-header">
                  <div className="cluster-dot" style={{ background: CLUSTER_COLORS[i] }} />
                  <div>
                    <div className="cluster-label">{p.label}</div>
                    <div className="cluster-size">{p.size} employees ({p.percentage}%)</div>
                  </div>
                  <span className={`badge ${p.risk_level === 'HIGH' ? 'badge-high' : p.risk_level === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}
                    style={{ marginLeft: 'auto' }}>
                    {p.risk_level}
                  </span>
                </div>
                {[
                  { label: 'Avg Monthly Income', val: `$${p.avg_monthly_income?.toLocaleString()}` },
                  { label: 'Average Age', val: `${p.avg_age} years` },
                  { label: 'Avg Tenure', val: `${p.avg_tenure} years` },
                  { label: 'Job Satisfaction', val: `${p.avg_job_satisfaction}/4` },
                  { label: 'Attrition Rate', val: `${p.attrition_rate}%`, warn: p.attrition_rate > 20 },
                ].map(s => (
                  <div key={s.label} className="cluster-stat">
                    <span className="cluster-stat-label">{s.label}</span>
                    <span className="cluster-stat-value" style={{ color: s.warn ? '#f87171' : 'var(--text-primary)' }}>
                      {s.val}
                    </span>
                  </div>
                ))}
                {p.top_departments && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>TOP DEPARTMENTS</div>
                    {Object.entries(p.top_departments).map(([dept, count]) => (
                      <div key={dept} style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: 12, color: 'var(--text-secondary)', paddingBottom: 3
                      }}>
                        <span>{dept}</span><span>{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Scatter Plot */}
          {scatterDatasets && (
            <div className="glass-card chart-container">
              <div className="chart-title">🗺️ Cluster Scatter Plot (Tenure vs Income)</div>
              <Scatter data={{ datasets: scatterDatasets }}
                options={{
                  responsive: true,
                  plugins: { legend: { labels: { color: '#94a3b8' } } },
                  scales: {
                    x: { title: { display: true, text: 'Years at Company', color: '#64748b' }, ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { title: { display: true, text: 'Monthly Income ($)', color: '#64748b' }, ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                  }
                }} />
            </div>
          )}
        </>
      )}

      {!result && !loading && (
        <div className="glass-card card-pad">
          <div className="empty-state">
            <span className="empty-icon">🧩</span>
            <div className="empty-title">No Clusters Yet</div>
            <div className="empty-description">Click "Run K-Means" to segment employees into 3 meaningful groups</div>
          </div>
        </div>
      )}
    </div>
  );
}
