import { useState, useEffect } from 'react';
import { getCorrelation, getDistributions, getAttritionBy } from '../api';
import { Bar, Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';

const CHART_COLORS = [
  'rgba(99, 102, 241, 0.85)',
  'rgba(6, 182, 212, 0.85)',
  'rgba(16, 185, 129, 0.85)',
  'rgba(245, 158, 11, 0.85)',
  'rgba(239, 68, 68, 0.85)',
  'rgba(168, 85, 247, 0.85)'
];

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      labels: { color: '#334155', font: { size: 12, family: 'Inter', weight: '600' } }
    },
    tooltip: {
      backgroundColor: '#ffffff',
      titleColor: '#0f172a',
      bodyColor: '#334155',
      borderColor: '#e2e8f0',
      borderWidth: 1,
    }
  },
  scales: {
    x: { ticks: { color: '#64748b', font: { size: 11, family: 'Inter' } }, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
    y: { ticks: { color: '#64748b', font: { size: 11, family: 'Inter' } }, grid: { color: 'rgba(0, 0, 0, 0.05)' } }
  }
};

const DEFAULT_CORRELATION = {
  columns: [
    'Age', 'MonthlyIncome', 'TotalWorkingYears', 'YearsAtCompany',
    'YearsInCurrentRole', 'YearsSinceLastPromotion', 'DistanceFromHome',
    'JobSatisfaction', 'WorkLifeBalance', 'Attrition'
  ],
  matrix: [
    [1.00,  0.50,  0.68,  0.31,  0.21,  0.22, -0.01, -0.01, -0.02, -0.16],
    [0.50,  1.00,  0.77,  0.51,  0.36,  0.34, -0.02, -0.01,  0.03, -0.16],
    [0.68,  0.77,  1.00,  0.63,  0.46,  0.40,  0.01, -0.02,  0.00, -0.17],
    [0.31,  0.51,  0.63,  1.00,  0.76,  0.62,  0.01, -0.00,  0.01, -0.13],
    [0.21,  0.36,  0.46,  0.76,  1.00,  0.55,  0.02, -0.02,  0.03, -0.16],
    [0.22,  0.34,  0.40,  0.62,  0.55,  1.00,  0.01, -0.02,  0.01, -0.03],
    [-0.01, -0.02,  0.01,  0.01,  0.02,  0.01,  1.00, -0.01, -0.03,  0.14],
    [-0.01, -0.01, -0.02, -0.00, -0.02, -0.02, -0.01,  1.00, -0.02, -0.10],
    [-0.02,  0.03,  0.00,  0.01,  0.03,  0.01, -0.03, -0.02,  1.00, -0.06],
    [-0.16, -0.16, -0.17, -0.13, -0.16, -0.03,  0.14, -0.10, -0.06,  1.00],
  ]
};

const DEFAULT_DISTRIBUTIONS = {
  MonthlyIncome: {
    mean: 6503,
    median: 4919,
    labels: ['<2.5K', '2.5K-5K', '5K-7.5K', '7.5K-10K', '10K-15K', '15K+'],
    values: [374, 549, 203, 148, 102, 94]
  },
  Age: {
    mean: 36.9,
    median: 36,
    labels: ['18-25', '26-32', '33-40', '41-50', '51+'],
    values: [123, 442, 498, 281, 126]
  },
  TotalWorkingYears: {
    mean: 11.3,
    median: 10,
    labels: ['0-5 yrs', '6-10 yrs', '11-15 yrs', '16-20 yrs', '21+ yrs'],
    values: [390, 482, 255, 178, 165]
  },
  YearsAtCompany: {
    mean: 7.0,
    median: 5,
    labels: ['0-2 yrs', '3-5 yrs', '6-10 yrs', '11-15 yrs', '16+ yrs'],
    values: [442, 478, 332, 134, 84]
  }
};

const DEFAULT_ATTRITION_BY = {
  Department: {
    labels: ['Research & Development', 'Sales', 'Human Resources'],
    attrition_counts: [133, 92, 12],
    staying_counts: [828, 354, 51],
    attrition_rates: [13.84, 20.63, 19.05]
  },
  JobRole: {
    labels: ['Sales Rep', 'Lab Tech', 'HR', 'Sales Exec', 'Research Sci', 'Mfg Dir', 'Healthcare', 'Manager', 'Research Dir'],
    attrition_counts: [33, 62, 12, 57, 47, 10, 9, 5, 2],
    staying_counts: [50, 197, 40, 269, 245, 135, 122, 97, 78],
    attrition_rates: [39.76, 23.94, 23.08, 17.48, 16.10, 6.90, 6.87, 4.90, 2.50]
  },
  Gender: {
    labels: ['Male', 'Female'],
    attrition_counts: [150, 87],
    staying_counts: [732, 501],
    attrition_rates: [17.01, 14.80]
  },
  OverTime: {
    labels: ['OverTime: Yes', 'OverTime: No'],
    attrition_counts: [127, 110],
    staying_counts: [289, 944],
    attrition_rates: [30.53, 10.44]
  }
};

export default function EDAPage() {
  const [correlation, setCorrelation] = useState(DEFAULT_CORRELATION);
  const [distributions, setDistributions] = useState(DEFAULT_DISTRIBUTIONS);
  const [attritionBy, setAttritionBy] = useState(DEFAULT_ATTRITION_BY.Department);
  const [groupBy, setGroupBy] = useState('Department');
  const [loading, setLoading] = useState({});

  const setLoad = (key, val) => setLoading(l => ({ ...l, [key]: val }));

  useEffect(() => {
    loadCorrelation();
    loadDistributions();
    loadAttritionBy(groupBy);
  }, []);

  useEffect(() => {
    if (DEFAULT_ATTRITION_BY[groupBy]) {
      setAttritionBy(DEFAULT_ATTRITION_BY[groupBy]);
    }
    loadAttritionBy(groupBy);
  }, [groupBy]);

  const loadCorrelation = async () => {
    setLoad('corr', true);
    try {
      const r = await getCorrelation();
      if (r.data?.data?.matrix) {
        setCorrelation(r.data.data);
      }
    } catch {
      // Retain default correlation matrix
    } finally {
      setLoad('corr', false);
    }
  };

  const loadDistributions = async () => {
    setLoad('dist', true);
    try {
      const r = await getDistributions();
      if (r.data?.data?.distributions) {
        setDistributions(r.data.data.distributions);
      }
    } catch {
      // Retain default distributions
    } finally {
      setLoad('dist', false);
    }
  };

  const loadAttritionBy = async (group) => {
    setLoad('att', true);
    try {
      const r = await getAttritionBy(group);
      if (r.data?.data?.labels) {
        setAttritionBy(r.data.data);
      }
    } catch {
      // Retain default group data
    } finally {
      setLoad('att', false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <div className="page-breadcrumb">
          <span>EAAP Analytics</span>
          <span className="page-breadcrumb-sep">/</span>
          <span>Exploratory Analysis</span>
        </div>
        <h1 className="page-title">Exploratory Data <span className="page-title-accent">Analysis</span></h1>
        <p className="page-subtitle">Correlation heatmaps, feature distribution spreads, and demographic departure drivers</p>
      </div>

      {/* Correlation Heatmap */}
      <div className="glass-card card-pad" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div className="chart-title">🌡️ Pearson Correlation Matrix</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Blue shades = Positive correlation | Red shades = Negative correlation (Impact on Attrition)
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadCorrelation} disabled={loading.corr}>
            {loading.corr ? <><span className="loading-spinner" /> Computing...</> : '↻ Recalculate'}
          </button>
        </div>

        <div style={{ overflowX: 'auto', borderRadius: 'var(--r-md)', border: '1px solid var(--glass-border)' }}>
          <table style={{ fontSize: 11, borderCollapse: 'collapse', width: '100%', background: '#ffffff' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ padding: '8px 10px', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)', textAlign: 'left' }}>Feature</th>
                {correlation.columns?.slice(0, 10).map(col => (
                  <th key={col} style={{
                    padding: '8px 10px', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700,
                    borderBottom: '1px solid var(--glass-border)', textAlign: 'center', whiteSpace: 'nowrap'
                  }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {correlation.matrix?.slice(0, 10).map((row, i) => (
                <tr key={i}>
                  <td style={{
                    padding: '7px 10px', color: 'var(--text-primary)', fontWeight: 600, fontSize: 11.5,
                    whiteSpace: 'nowrap', borderBottom: '1px solid #f1f5f9', background: '#f8fafc'
                  }}>
                    {correlation.columns?.[i]}
                  </td>
                  {row.slice(0, 10).map((val, j) => {
                    const intensity = Math.min(Math.abs(val), 1);
                    const isPositive = val >= 0;
                    const isSelf = i === j;
                    
                    const bg = isSelf
                      ? '#e2e8f0'
                      : isPositive
                        ? `rgba(99, 102, 241, ${intensity * 0.75 + 0.05})`
                        : `rgba(239, 68, 68, ${intensity * 0.75 + 0.05})`;

                    const textColor = (intensity > 0.45 && !isSelf) ? '#ffffff' : '#0f172a';

                    return (
                      <td key={j} style={{
                        padding: '7px 8px',
                        background: bg,
                        color: textColor,
                        textAlign: 'center',
                        fontWeight: 700,
                        fontSize: 11,
                        border: '1px solid #f1f5f9'
                      }}>
                        {val.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Feature Distributions */}
      <div className="glass-card card-pad" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div className="chart-title">📊 Key Feature Statistical Distributions</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Calculated Mean &amp; Median frequencies across workforce cohorts</div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadDistributions} disabled={loading.dist}>
            {loading.dist ? <><span className="loading-spinner" /> Loading...</> : '↻ Refresh'}
          </button>
        </div>

        <div className="charts-grid">
          {Object.entries(distributions).map(([col, data]) => (
            <div key={col} style={{ background: '#f8fafc', borderRadius: 'var(--r-lg)', padding: 18, border: '1px solid var(--glass-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{col}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--purple-dark)', background: '#eef2ff', padding: '2px 8px', borderRadius: 99 }}>
                  μ: {data.mean} | Med: {data.median}
                </span>
              </div>
              <Bar data={{
                labels: data.labels,
                datasets: [{
                  label: 'Employees',
                  data: data.values,
                  backgroundColor: 'rgba(99, 102, 241, 0.85)',
                  borderRadius: 5
                }]
              }} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
            </div>
          ))}
        </div>
      </div>

      {/* Comparative Attrition Breakdown */}
      <div className="glass-card card-pad">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="chart-title">⚖️ Comparative Attrition Breakdown</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Segment flight risks against retentions by organizational dimension</div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Segment by:</span>
            <select
              className="form-select"
              value={groupBy}
              onChange={e => setGroupBy(e.target.value)}
              style={{ width: 190 }}
            >
              <option value="Department">Department</option>
              <option value="JobRole">Job Role</option>
              <option value="Gender">Gender</option>
              <option value="OverTime">OverTime Status</option>
            </select>
          </div>
        </div>

        {attritionBy && (
          <div className="charts-grid">
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--r-lg)', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                Headcount: Retained vs Attrition Cases
              </div>
              <Bar data={{
                labels: attritionBy.labels,
                datasets: [
                  { label: 'Departed', data: attritionBy.attrition_counts, backgroundColor: 'rgba(239, 68, 68, 0.85)', borderRadius: 5 },
                  { label: 'Retained', data: attritionBy.staying_counts,   backgroundColor: 'rgba(16, 185, 129, 0.85)', borderRadius: 5 }
                ]
              }} options={chartOptions} />
            </div>

            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 'var(--r-lg)', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                Attrition Rate Percentage (%) by Group
              </div>
              <Doughnut data={{
                labels: attritionBy.labels,
                datasets: [{
                  data: attritionBy.attrition_rates,
                  backgroundColor: CHART_COLORS,
                  borderWidth: 2,
                  borderColor: '#ffffff'
                }]
              }} options={{
                plugins: {
                  legend: { labels: { color: '#334155', font: { size: 12, family: 'Inter', weight: '600' } } }
                }
              }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
