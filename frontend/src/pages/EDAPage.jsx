import { useState } from 'react';
import { getCorrelation, getDistributions, getAttritionBy } from '../api';
import { Bar, Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';

const CHART_COLORS = [
  'rgba(124,58,237,0.7)', 'rgba(37,99,235,0.7)', 'rgba(6,182,212,0.7)',
  'rgba(16,185,129,0.7)', 'rgba(245,158,11,0.7)', 'rgba(239,68,68,0.7)'
];

const chartOptions = {
  responsive: true,
  plugins: { legend: { labels: { color: '#94a3b8' } } },
  scales: {
    x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } }
  }
};

export default function EDAPage() {
  const [correlation, setCorrelation] = useState(null);
  const [distributions, setDistributions] = useState(null);
  const [attritionBy, setAttritionBy] = useState(null);
  const [groupBy, setGroupBy] = useState('Department');
  const [loading, setLoading] = useState({});

  const setLoad = (key, val) => setLoading(l => ({ ...l, [key]: val }));

  const loadCorrelation = async () => {
    setLoad('corr', true);
    try { const r = await getCorrelation(); setCorrelation(r.data.data); }
    catch { toast.error('Load correlation heatmap failed'); }
    finally { setLoad('corr', false); }
  };

  const loadDistributions = async () => {
    setLoad('dist', true);
    try { const r = await getDistributions(); setDistributions(r.data.data?.distributions); }
    catch { toast.error('Load distributions failed'); }
    finally { setLoad('dist', false); }
  };

  const loadAttritionBy = async () => {
    setLoad('att', true);
    try { const r = await getAttritionBy(groupBy); setAttritionBy(r.data.data); }
    catch { toast.error('Load attrition breakdown failed'); }
    finally { setLoad('att', false); }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Exploratory Data Analysis</h1>
        <p className="page-subtitle">Statistical patterns, correlations, and attrition breakdowns</p>
      </div>

      {/* Correlation Heatmap */}
      <div className="glass-card card-pad" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="chart-title">🌡️ Correlation Matrix</div>
          <button className="btn btn-primary btn-sm" onClick={loadCorrelation} disabled={loading.corr}>
            {loading.corr ? <span className="loading-spinner" /> : '🔄 Load'}
          </button>
        </div>

        {correlation ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ fontSize: 11, borderCollapse: 'collapse', minWidth: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '4px 6px', color: 'var(--text-muted)' }}></th>
                  {correlation.columns?.slice(0, 12).map(col => (
                    <th key={col} style={{
                      padding: '4px 6px', color: 'var(--text-secondary)', fontSize: 10,
                      transform: 'rotate(-30deg)', height: 50, verticalAlign: 'bottom', whiteSpace: 'nowrap'
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlation.matrix?.slice(0, 12).map((row, i) => (
                  <tr key={i}>
                    <td style={{ padding: '4px 6px', color: 'var(--text-secondary)', fontSize: 10, whiteSpace: 'nowrap' }}>
                      {correlation.columns?.[i]}
                    </td>
                    {row.slice(0, 12).map((val, j) => {
                      const intensity = Math.abs(val);
                      const r = val > 0 ? Math.round(124 + (131 * intensity)) : Math.round(124 - (80 * intensity));
                      const b = val > 0 ? Math.round(237 - (200 * intensity)) : Math.round(237 - (50 * intensity));
                      const bg = `rgba(${val > 0 ? 124 : 239},${58}, ${val > 0 ? 237 : 68}, ${Math.min(intensity, 0.9)})`;
                      return (
                        <td key={j} style={{
                          padding: '4px 6px', background: bg, color: intensity > 0.3 ? 'white' : 'var(--text-secondary)',
                          textAlign: 'center', borderRadius: 2, fontSize: 10
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
        ) : (
          <div className="empty-state">
            <span className="empty-icon">🌡️</span>
            <div className="empty-title">Click "Load" to compute correlation matrix</div>
          </div>
        )}
      </div>

      {/* Distributions */}
      <div className="glass-card card-pad" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div className="chart-title">📊 Feature Distributions</div>
          <button className="btn btn-primary btn-sm" onClick={loadDistributions} disabled={loading.dist}>
            {loading.dist ? <span className="loading-spinner" /> : '🔄 Load'}
          </button>
        </div>

        {distributions ? (
          <div className="charts-grid">
            {Object.entries(distributions).map(([col, data]) => (
              <div key={col} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>
                  {col}
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>
                    avg: {data.mean} | median: {data.median}
                  </span>
                </div>
                <Bar data={{
                  labels: data.labels,
                  datasets: [{ label: 'Count', data: data.values, backgroundColor: CHART_COLORS[0], borderRadius: 3 }]
                }} options={{ ...chartOptions, plugins: { legend: { display: false } } }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📊</span>
            <div className="empty-title">Click "Load" to generate distribution charts</div>
          </div>
        )}
      </div>

      {/* Attrition By */}
      <div className="glass-card card-pad">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div className="chart-title">⚖️ Attrition Comparison</div>
          <div style={{ display: 'flex', gap: 12 }}>
            <select className="form-select" value={groupBy} onChange={e => setGroupBy(e.target.value)}
              style={{ width: 180 }}>
              <option>Department</option>
              <option>Gender</option>
              <option>JobRole</option>
              <option>MaritalStatus</option>
              <option>BusinessTravel</option>
              <option>EducationField</option>
            </select>
            <button className="btn btn-primary btn-sm" onClick={loadAttritionBy} disabled={loading.att}>
              {loading.att ? <span className="loading-spinner" /> : '🔄 Load'}
            </button>
          </div>
        </div>

        {attritionBy ? (
          <div className="charts-grid">
            <div>
              <Bar data={{
                labels: attritionBy.labels,
                datasets: [
                  { label: 'Attrition', data: attritionBy.attrition_counts, backgroundColor: 'rgba(239,68,68,0.7)', borderRadius: 4 },
                  { label: 'Staying', data: attritionBy.staying_counts, backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 4 }
                ]
              }} options={chartOptions} />
            </div>
            <div>
              <Doughnut data={{
                labels: attritionBy.labels,
                datasets: [{
                  data: attritionBy.attrition_rates,
                  backgroundColor: CHART_COLORS,
                  borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)'
                }]
              }} options={{ plugins: { legend: { labels: { color: '#94a3b8' } } } }} />
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">⚖️</span>
            <div className="empty-title">Select a group and click "Load"</div>
          </div>
        )}
      </div>
    </div>
  );
}
