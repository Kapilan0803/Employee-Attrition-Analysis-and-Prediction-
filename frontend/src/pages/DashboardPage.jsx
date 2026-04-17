import { useState, useEffect } from 'react';
import { getDashboardMetrics } from '../api';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend, PointElement, LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend, PointElement, LineElement);

const chartOpts = {
  plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 }, boxWidth: 12, padding: 16 } } },
  scales: {
    x: { ticks: { color: '#475569', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { ticks: { color: '#475569', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.04)' } }
  },
  responsive: true,
  maintainAspectRatio: true,
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadMetrics(); }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const res = await getDashboardMetrics();
      setMetrics(res.data.data);
    } catch {
      toast.error('Failed to load metrics. Please upload and activate a dataset.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="page-container">
      <div className="page-header">
        <div className="skeleton" style={{ height: 28, width: 280, marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 16, width: 380 }} />
      </div>
      <div className="metrics-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="metric-card skeleton" style={{ height: 120 }} />
        ))}
      </div>
    </div>
  );

  if (!metrics) return (
    <div className="page-container">
      <div className="glass-card card-pad">
        <div className="empty-state">
          <span className="empty-icon">📂</span>
          <div className="empty-title">No Dataset Loaded</div>
          <div className="empty-description">
            Go to Data Management, upload a CSV file and activate it to see the dashboard.
          </div>
        </div>
      </div>
    </div>
  );

  const deptLabels = Object.keys(metrics.departmentWiseCount || {});
  const deptAttritionData = deptLabels.map(d => metrics.departmentWiseAttrition?.[d] || 0);
  const deptStayingData   = deptLabels.map(d =>
    (metrics.departmentWiseCount?.[d] || 0) - (metrics.departmentWiseAttrition?.[d] || 0)
  );
  const genderLabels = Object.keys(metrics.genderDistribution || {});
  const genderData   = genderLabels.map(g => metrics.genderDistribution[g]);
  const ageLabels    = (metrics.ageDistribution || []).map(a => a.label);
  const ageCounts    = (metrics.ageDistribution || []).map(a => a.count);

  return (
    <div className="page-container fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-breadcrumb">
          <span>EAAP</span>
          <span className="page-breadcrumb-sep">/</span>
          <span>Dashboard</span>
        </div>
        <div className="page-header-row">
          <div>
            <h1 className="page-title">HR Analytics <span className="page-title-accent">Dashboard</span></h1>
            <p className="page-subtitle">Real-time insights from your active employee dataset</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadMetrics}>↻ Refresh</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="section">
        <div className="section-header">
          <div>
            <div className="section-title">Key Performance Indicators</div>
            <div className="section-subtitle">Live metrics from the active dataset</div>
          </div>
        </div>
        <div className="metrics-grid">
          {[
            { color: 'purple', icon: '👥', value: metrics.totalEmployees?.toLocaleString(), label: 'Total Employees' },
            { color: 'red',    icon: '📉', value: `${metrics.attritionRate}%`,              label: 'Attrition Rate' },
            { color: 'red',    icon: '🚪', value: metrics.attritionCount,                   label: 'Attrition Cases' },
            { color: 'blue',   icon: '⏱️', value: `${metrics.averageTenure}y`,              label: 'Avg Tenure' },
            { color: 'green',  icon: '💰', value: `$${metrics.averageMonthlyIncome?.toLocaleString(undefined, {maximumFractionDigits:0})}`, label: 'Avg Monthly Income' },
            { color: 'amber',  icon: '🎂', value: metrics.averageAge,                       label: 'Average Age' },
          ].map(({ color, icon, value, label }) => (
            <div key={label} className={`metric-card ${color}`}>
              <div className="metric-top">
                <div className={`metric-icon ${color}`}>{icon}</div>
              </div>
              <div className={`metric-value ${color}`}>{value}</div>
              <div className="metric-label">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="section">
        <div className="section-header">
          <div>
            <div className="section-title">Workforce Analytics</div>
            <div className="section-subtitle">Visual breakdown of your employee data</div>
          </div>
        </div>
        <div className="charts-grid">
          <div className="glass-card chart-container">
            <div className="chart-title">📊 Department-wise Attrition</div>
            <Bar data={{
              labels: deptLabels,
              datasets: [
                { label: 'Attrition', data: deptAttritionData, backgroundColor: 'rgba(248,113,113,0.75)', borderRadius: 5 },
                { label: 'Staying',   data: deptStayingData,   backgroundColor: 'rgba(52,211,153,0.75)', borderRadius: 5 },
              ]
            }} options={chartOpts} />
          </div>

          <div className="glass-card chart-container">
            <div className="chart-title">👤 Gender Distribution</div>
            <Doughnut data={{
              labels: genderLabels,
              datasets: [{
                data: genderData,
                backgroundColor: ['rgba(139,92,246,0.8)', 'rgba(59,130,246,0.8)', 'rgba(16,185,129,0.8)'],
                borderWidth: 2,
                borderColor: 'rgba(255,255,255,0.06)'
              }]
            }} options={{ plugins: { legend: { labels: { color: '#94a3b8', font: { size: 12 } } } }, responsive: true }} />
          </div>

          <div className="glass-card chart-container">
            <div className="chart-title">🎂 Age Distribution</div>
            <Bar data={{
              labels: ageLabels,
              datasets: [{ label: 'Employees', data: ageCounts, backgroundColor: 'rgba(139,92,246,0.75)', borderRadius: 5 }]
            }} options={chartOpts} />
          </div>

          <div className="glass-card chart-container">
            <div className="chart-title">💰 Salary Bands</div>
            <Bar data={{
              labels: (metrics.salaryDistribution || []).map(s => s.label),
              datasets: [{ label: 'Employees', data: (metrics.salaryDistribution || []).map(s => s.count), backgroundColor: 'rgba(6,182,212,0.75)', borderRadius: 5 }]
            }} options={chartOpts} />
          </div>
        </div>
      </div>

      {/* Department Summary Table */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">Department Attrition Summary</div>
        </div>
        <div className="glass-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Total</th>
                  <th>Attrition</th>
                  <th>Retained</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(metrics.departmentWiseCount || {}).map(([dept, total]) => {
                  const att  = metrics.departmentWiseAttrition?.[dept] || 0;
                  const rate = metrics.attritionByDepartment?.[dept] || 0;
                  return (
                    <tr key={dept}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{dept}</td>
                      <td>{total}</td>
                      <td style={{ color: '#f87171' }}>{att}</td>
                      <td style={{ color: '#34d399' }}>{total - att}</td>
                      <td>
                        <span className={`badge ${rate > 20 ? 'badge-high' : rate > 10 ? 'badge-medium' : 'badge-low'}`}>
                          {rate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
