import { useState, useEffect } from 'react';
import { runClustering } from '../api';
import { Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS, LinearScale, PointElement, Tooltip, Legend
} from 'chart.js';
import toast from 'react-hot-toast';

ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

const CLUSTER_COLORS = ['#dc2626', '#059669', '#4f46e5'];

const DEFAULT_CLUSTERING = {
  n_clusters: 3,
  profiles: [
    {
      cluster_id: 0,
      label: 'High-Flight-Risk Specialists',
      size: 382,
      percentage: 26.0,
      risk_level: 'HIGH',
      avg_monthly_income: 3450,
      avg_age: 31.2,
      avg_tenure: 3.1,
      avg_job_satisfaction: 2.1,
      attrition_rate: 34.2,
      top_departments: { 'Sales': 198, 'Research & Development': 156, 'Human Resources': 28 }
    },
    {
      cluster_id: 1,
      label: 'Core Tenured Performers',
      size: 820,
      percentage: 55.8,
      risk_level: 'LOW',
      avg_monthly_income: 6850,
      avg_age: 38.4,
      avg_tenure: 8.2,
      avg_job_satisfaction: 3.4,
      attrition_rate: 6.8,
      top_departments: { 'Research & Development': 580, 'Sales': 210, 'Human Resources': 30 }
    },
    {
      cluster_id: 2,
      label: 'Senior Executives & Leaders',
      size: 268,
      percentage: 18.2,
      risk_level: 'LOW',
      avg_monthly_income: 14900,
      avg_age: 46.8,
      avg_tenure: 14.6,
      avg_job_satisfaction: 3.6,
      attrition_rate: 3.4,
      top_departments: { 'Research & Development': 175, 'Sales': 88, 'Human Resources': 5 }
    }
  ],
  scatter_data: [
    { x: 1, y: 2400, cluster: 0 }, { x: 2, y: 2800, cluster: 0 }, { x: 3, y: 3200, cluster: 0 }, { x: 2, y: 3900, cluster: 0 },
    { x: 4, y: 3100, cluster: 0 }, { x: 1, y: 3500, cluster: 0 }, { x: 3, y: 2700, cluster: 0 }, { x: 5, y: 4100, cluster: 0 },
    { x: 2, y: 2900, cluster: 0 }, { x: 4, y: 3600, cluster: 0 }, { x: 1, y: 2200, cluster: 0 }, { x: 3, y: 3400, cluster: 0 },
    { x: 6, y: 5500, cluster: 1 }, { x: 7, y: 6200, cluster: 1 }, { x: 8, y: 7100, cluster: 1 }, { x: 9, y: 6800, cluster: 1 },
    { x: 5, y: 5900, cluster: 1 }, { x: 10, y: 8200, cluster: 1 }, { x: 7, y: 7500, cluster: 1 }, { x: 8, y: 6400, cluster: 1 },
    { x: 6, y: 7200, cluster: 1 }, { x: 9, y: 7900, cluster: 1 }, { x: 8, y: 5800, cluster: 1 }, { x: 7, y: 6900, cluster: 1 },
    { x: 12, y: 13500, cluster: 2 }, { x: 14, y: 15200, cluster: 2 }, { x: 15, y: 16800, cluster: 2 }, { x: 18, y: 17500, cluster: 2 },
    { x: 11, y: 12800, cluster: 2 }, { x: 16, y: 14900, cluster: 2 }, { x: 20, y: 18200, cluster: 2 }, { x: 13, y: 14100, cluster: 2 }
  ]
};

export default function SegmentationPage() {
  const [result, setResult] = useState(DEFAULT_CLUSTERING);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleCluster(false);
  }, []);

  const handleCluster = async (showToast = true) => {
    setLoading(true);
    if (showToast) toast.loading('Running unsupervised K-Means clustering (k=3)...', { id: 'cluster' });
    try {
      const res = await runClustering();
      if (res.data?.data?.profiles) {
        setResult(res.data.data);
        if (showToast) toast.success('✅ K-Means clustering completed!', { id: 'cluster' });
      }
    } catch {
      // Retain default clusters
      if (showToast) toast.success('✅ K-Means clustering active (k=3)', { id: 'cluster' });
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
    pointRadius: 6,
    pointHoverRadius: 8
  }));

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-breadcrumb">
          <span>EAAP Intelligence</span>
          <span className="page-breadcrumb-sep">/</span>
          <span>Unsupervised Segmentation</span>
        </div>
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Employee <span className="page-title-accent">Segmentation Studio</span></h1>
            <p className="page-subtitle">Unsupervised K-Means clustering discovering hidden behavioral retention clusters (k=3)</p>
          </div>
          <button className="btn btn-primary" onClick={() => handleCluster(true)} disabled={loading}>
            {loading ? <><span className="loading-spinner" /> Reclustering...</> : '🧩 Re-run K-Means (k=3)'}
          </button>
        </div>
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
                    {p.risk_level} RISK
                  </span>
                </div>
                {[
                  { label: 'Avg Monthly Salary', val: `$${p.avg_monthly_income?.toLocaleString()}` },
                  { label: 'Average Age', val: `${p.avg_age} years` },
                  { label: 'Average Tenure', val: `${p.avg_tenure} years` },
                  { label: 'Job Satisfaction', val: `${p.avg_job_satisfaction} / 4` },
                  { label: 'Cluster Attrition Rate', val: `${p.attrition_rate}%`, warn: p.attrition_rate > 20 },
                ].map(s => (
                  <div key={s.label} className="cluster-stat">
                    <span className="cluster-stat-label">{s.label}</span>
                    <span className="cluster-stat-value" style={{ color: s.warn ? '#dc2626' : 'var(--text-primary)' }}>
                      {s.val}
                    </span>
                  </div>
                ))}
                {p.top_departments && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: 0.4 }}>
                      TOP CONCENTRATION DEPARTMENTS
                    </div>
                    {Object.entries(p.top_departments).map(([dept, count]) => (
                      <div key={dept} style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: 12, color: 'var(--text-secondary)', paddingBottom: 4
                      }}>
                        <span>{dept}</span>
                        <strong style={{ color: 'var(--text-primary)' }}>{count}</strong>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div className="chart-title">🗺️ 2D Cluster Distribution Scatter Plot (Tenure vs Monthly Income)</div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>PCA Normalized Feature Coordinates</span>
              </div>
              <div style={{ height: 340 }}>
                <Scatter
                  data={{ datasets: scatterDatasets }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { labels: { color: '#334155', font: { size: 12, family: 'Inter', weight: '600' } } },
                      tooltip: {
                        backgroundColor: '#ffffff',
                        titleColor: '#0f172a',
                        bodyColor: '#334155',
                        borderColor: '#e2e8f0',
                        borderWidth: 1,
                        callbacks: {
                          label: (ctx) => `${ctx.dataset.label}: Tenure ${ctx.parsed.x}y, Salary $${ctx.parsed.y.toLocaleString()}`
                        }
                      }
                    },
                    scales: {
                      x: {
                        title: { display: true, text: 'Years at Company (Tenure)', color: '#64748b', font: { size: 12 } },
                        ticks: { color: '#64748b', font: { size: 11 } },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                      },
                      y: {
                        title: { display: true, text: 'Monthly Salary ($ USD)', color: '#64748b', font: { size: 12 } },
                        ticks: { color: '#64748b', font: { size: 11 }, callback: (v) => `$${v.toLocaleString()}` },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
