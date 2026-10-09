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

const DEFAULT_METRICS = {
  totalEmployees: 1470,
  attritionCount: 237,
  attritionRate: 16.12,
  averageTenure: 7.01,
  averageAge: 36.92,
  averageMonthlyIncome: 6503,
  departmentWiseCount: {
    'Research & Development': 961,
    'Sales': 446,
    'Human Resources': 63,
  },
  departmentWiseAttrition: {
    'Research & Development': 133,
    'Sales': 92,
    'Human Resources': 12,
  },
  attritionByDepartment: {
    'Research & Development': 13.84,
    'Sales': 20.63,
    'Human Resources': 19.05,
  },
  genderDistribution: {
    'Male': 882,
    'Female': 588,
  },
  jobRoleDistribution: {
    'Sales Executive': 326,
    'Research Scientist': 292,
    'Laboratory Technician': 259,
    'Manufacturing Director': 145,
    'Healthcare Representative': 131,
    'Manager': 102,
    'Sales Representative': 83,
    'Research Director': 80,
    'Human Resources': 52,
  },
  ageDistribution: [
    { label: '18-25', count: 123 },
    { label: '26-35', count: 606 },
    { label: '36-45', count: 468 },
    { label: '46-55', count: 205 },
    { label: '55+', count: 68 },
  ],
  salaryDistribution: [
    { label: '<2000', count: 52 },
    { label: '2K-5K', count: 706 },
    { label: '5K-10K', count: 440 },
    { label: '10K-15K', count: 148 },
    { label: '15K+', count: 124 },
  ],
};

const chartOpts = {
  plugins: {
    legend: {
      labels: {
        color: '#475569',
        font: { size: 12, family: 'Inter', weight: '600' },
        boxWidth: 12,
        padding: 14,
      },
    },
    tooltip: {
      backgroundColor: '#ffffff',
      titleColor: '#0f172a',
      bodyColor: '#334155',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: 10,
      boxPadding: 4,
      usePointStyle: true,
    },
  },
  scales: {
    x: {
      ticks: { color: '#64748b', font: { size: 11, family: 'Inter' } },
      grid: { color: 'rgba(0, 0, 0, 0.05)' },
    },
    y: {
      ticks: { color: '#64748b', font: { size: 11, family: 'Inter' } },
      grid: { color: 'rgba(0, 0, 0, 0.05)' },
    },
  },
  responsive: true,
  maintainAspectRatio: true,
};

const doughnutOpts = {
  plugins: {
    legend: {
      labels: {
        color: '#475569',
        font: { size: 12, family: 'Inter', weight: '600' },
        padding: 14,
      },
    },
    tooltip: {
      backgroundColor: '#ffffff',
      titleColor: '#0f172a',
      bodyColor: '#334155',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      padding: 10,
    },
  },
  responsive: true,
  maintainAspectRatio: true,
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(DEFAULT_METRICS);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const res = await getDashboardMetrics();
      if (res.data?.data) {
        setMetrics(res.data.data);
        setIsLive(true);
      }
    } catch {
      // Retain default IBM HR dataset metrics for continuous presentation readiness
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

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
          <span>EAAP Workspace</span>
          <span className="page-breadcrumb-sep">/</span>
          <span>Executive Overview</span>
        </div>
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Executive HR <span className="page-title-accent">Dashboard</span></h1>
            <p className="page-subtitle">
              Active Dataset: <strong>IBM HR Analytics Dataset</strong> (1,470 Employees)
              {isLive ? (
                <span className="badge badge-low" style={{ marginLeft: 10 }}>● Live Connected</span>
              ) : (
                <span className="badge badge-purple" style={{ marginLeft: 10 }}>● Preloaded Baseline</span>
              )}
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadMetrics} disabled={loading}>
            {loading ? <><span className="loading-spinner" /> Updating...</> : '↻ Refresh Data'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="section">
        <div className="section-header">
          <div>
            <div className="section-title">Key Performance Indicators</div>
            <div className="section-subtitle">Core retention and headcount vital signs</div>
          </div>
        </div>
        <div className="metrics-grid">
          {[
            { color: 'purple', icon: '👥', value: metrics.totalEmployees?.toLocaleString(), label: 'Total Headcount' },
            { color: 'red',    icon: '📉', value: `${metrics.attritionRate}%`,              label: 'Overall Attrition Rate' },
            { color: 'red',    icon: '🚪', value: metrics.attritionCount,                   label: 'Total Departures' },
            { color: 'blue',   icon: '⏱️', value: `${metrics.averageTenure} yrs`,           label: 'Average Tenure' },
            { color: 'green',  icon: '💰', value: `$${metrics.averageMonthlyIncome?.toLocaleString(undefined, {maximumFractionDigits:0})}`, label: 'Avg Monthly Salary' },
            { color: 'amber',  icon: '🎂', value: `${metrics.averageAge} yrs`,             label: 'Average Age' },
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

      {/* Charts Grid */}
      <div className="section">
        <div className="section-header">
          <div>
            <div className="section-title">Workforce Visual Analytics</div>
            <div className="section-subtitle">Segmentation by department, gender, age, and compensation tier</div>
          </div>
        </div>
        <div className="charts-grid">
          {/* Department-wise Attrition */}
          <div className="glass-card chart-container">
            <div className="chart-title">📊 Department Retention Breakdown</div>
            <Bar data={{
              labels: deptLabels,
              datasets: [
                { label: 'Departed', data: deptAttritionData, backgroundColor: 'rgba(239, 68, 68, 0.85)', borderRadius: 6 },
                { label: 'Retained', data: deptStayingData,   backgroundColor: 'rgba(16, 185, 129, 0.85)', borderRadius: 6 },
              ]
            }} options={chartOpts} />
          </div>

          {/* Gender Breakdown */}
          <div className="glass-card chart-container">
            <div className="chart-title">👤 Gender Ratio &amp; Distribution</div>
            <Doughnut data={{
              labels: genderLabels,
              datasets: [{
                data: genderData,
                backgroundColor: ['rgba(99, 102, 241, 0.85)', 'rgba(6, 182, 212, 0.85)', 'rgba(16, 185, 129, 0.85)'],
                borderWidth: 2,
                borderColor: '#ffffff',
              }]
            }} options={doughnutOpts} />
          </div>

          {/* Age Distribution */}
          <div className="glass-card chart-container">
            <div className="chart-title">🎂 Age Demographic Distribution</div>
            <Bar data={{
              labels: ageLabels,
              datasets: [{
                label: 'Employees',
                data: ageCounts,
                backgroundColor: 'rgba(99, 102, 241, 0.85)',
                borderRadius: 6
              }]
            }} options={chartOpts} />
          </div>

          {/* Salary Bands */}
          <div className="glass-card chart-container">
            <div className="chart-title">💰 Monthly Salary Distribution</div>
            <Bar data={{
              labels: (metrics.salaryDistribution || []).map(s => s.label),
              datasets: [{
                label: 'Headcount',
                data: (metrics.salaryDistribution || []).map(s => s.count),
                backgroundColor: 'rgba(14, 165, 233, 0.85)',
                borderRadius: 6
              }]
            }} options={chartOpts} />
          </div>
        </div>
      </div>

      {/* Department Summary Table */}
      <div className="section">
        <div className="section-header">
          <div>
            <div className="section-title">Department Attrition Matrix</div>
            <div className="section-subtitle">Headcount and attrition velocity by organizational unit</div>
          </div>
        </div>
        <div className="glass-card">
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Headcount</th>
                  <th>Departed</th>
                  <th>Retained</th>
                  <th>Attrition Rate</th>
                  <th>Risk Assessment</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(metrics.departmentWiseCount || {}).map(([dept, total]) => {
                  const att  = metrics.departmentWiseAttrition?.[dept] || 0;
                  const rate = metrics.attritionByDepartment?.[dept] || 0;
                  const riskLevel = rate > 20 ? 'HIGH' : rate > 12 ? 'MODERATE' : 'LOW';
                  return (
                    <tr key={dept}>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{dept}</td>
                      <td>{total}</td>
                      <td style={{ color: '#dc2626', fontWeight: 600 }}>{att}</td>
                      <td style={{ color: '#059669', fontWeight: 600 }}>{total - att}</td>
                      <td>
                        <span className={`badge ${rate > 20 ? 'badge-high' : rate > 12 ? 'badge-medium' : 'badge-low'}`}>
                          {rate.toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${riskLevel === 'HIGH' ? 'badge-high' : riskLevel === 'MODERATE' ? 'badge-medium' : 'badge-low'}`}>
                          {riskLevel} RISK
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
