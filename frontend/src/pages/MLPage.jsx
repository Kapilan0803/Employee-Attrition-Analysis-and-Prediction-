import { useState } from 'react';
import { trainModel, getMLMetrics, getFeatureImportance } from '../api';
import { Bar } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function MLPage() {
  const [metrics, setMetrics] = useState(null);
  const [features, setFeatures] = useState(null);
  const [training, setTraining] = useState(false);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const { isHR } = useAuth();

  const handleTrain = async () => {
    setTraining(true);
    toast.loading('Training model... This may take 30–60 seconds.', { id: 'train' });
    try {
      const res = await trainModel();
      const m = res.data.data?.metrics || res.data.data;
      setMetrics(m);
      toast.success('✅ Model trained successfully!', { id: 'train' });
      loadFeatures();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Training failed', { id: 'train' });
    } finally {
      setTraining(false);
    }
  };

  const loadMetricsOnly = async () => {
    setLoadingMetrics(true);
    try {
      const res = await getMLMetrics();
      setMetrics(res.data.data);
      loadFeatures();
    } catch { toast.error('No trained model found. Please train first.'); }
    finally { setLoadingMetrics(false); }
  };

  const loadFeatures = async () => {
    try {
      const res = await getFeatureImportance();
      setFeatures(res.data.data?.feature_importance);
    } catch { }
  };

  const featureLabels = features ? Object.keys(features).slice(0, 12) : [];
  const featureValues = features ? Object.values(features).slice(0, 12) : [];

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Machine Learning Models</h1>
        <p className="page-subtitle">Train and evaluate attrition prediction models</p>
      </div>

      {/* Controls */}
      <div className="glass-card card-pad" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {isHR() && (
            <button className="btn btn-primary btn-lg" onClick={handleTrain} disabled={training}>
              {training ? <><span className="loading-spinner" /> Training...</> : '🚀 Train Model'}
            </button>
          )}
          <button className="btn btn-secondary" onClick={loadMetricsOnly} disabled={loadingMetrics}>
            {loadingMetrics ? <span className="loading-spinner" /> : '📊 Load Existing Metrics'}
          </button>
          {training && (
            <div style={{
              padding: '10px 16px', background: 'rgba(139,92,246,0.08)',
              border: '1px solid rgba(139,92,246,0.25)', borderRadius: 8,
              fontSize: 13, color: 'var(--purple-light)'
            }}>
              ⏳ Training Random Forest + Logistic Regression with SMOTE balancing...
            </div>
          )}
        </div>
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
          Models: <strong style={{ color: 'var(--text-primary)' }}>Random Forest + Logistic Regression</strong> |
          Balancing: <strong style={{ color: 'var(--text-primary)' }}>SMOTE</strong> |
          Split: <strong style={{ color: 'var(--text-primary)' }}>80/20</strong>
        </div>
      </div>

      {metrics && (
        <>
          {/* Metric Cards */}
          <div className="metrics-grid" style={{ marginBottom: 24 }}>
            {[
              { label: 'Accuracy', val: `${(metrics.accuracy * 100).toFixed(1)}%`, color: 'green', icon: '🎯' },
              { label: 'Precision', val: `${(metrics.precision * 100).toFixed(1)}%`, color: 'blue', icon: '🔬' },
              { label: 'Recall', val: `${(metrics.recall * 100).toFixed(1)}%`, color: 'purple', icon: '📡' },
              { label: 'F1-Score', val: `${(metrics.f1_score * 100).toFixed(1)}%`, color: 'amber', icon: '⚖️' },
              { label: 'Train Size', val: metrics.train_size?.toLocaleString(), color: 'blue', icon: '📚' },
              { label: 'Test Size', val: metrics.test_size?.toLocaleString(), color: 'purple', icon: '🧪' },
            ].map(m => (
              <div key={m.label} className={`metric-card ${m.color}`}>
                <div className="metric-top">
                  <div className={`metric-icon ${m.color}`}>{m.icon}</div>
                </div>
                <div className={`metric-value ${m.color}`}>{m.val}</div>
                <div className="metric-label">{m.label}</div>
              </div>
            ))}
          </div>

          <div className="charts-grid">
            {/* Confusion Matrix */}
            {metrics.confusion_matrix && (
              <div className="glass-card chart-container">
                <div className="chart-title">🧩 Confusion Matrix</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 280, margin: '0 auto' }}>
                  {[
                    { label: 'True Negative', val: metrics.confusion_matrix[0]?.[0], color: '#10b981' },
                    { label: 'False Positive', val: metrics.confusion_matrix[0]?.[1], color: '#ef4444' },
                    { label: 'False Negative', val: metrics.confusion_matrix[1]?.[0], color: '#f59e0b' },
                    { label: 'True Positive', val: metrics.confusion_matrix[1]?.[1], color: '#7c3aed' },
                  ].map(cell => (
                    <div key={cell.label} style={{
                      padding: 20, borderRadius: 12, textAlign: 'center',
                      background: `${cell.color}22`, border: `2px solid ${cell.color}44`
                    }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: cell.color }}>{cell.val}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{cell.label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
                  <span>← Predicted Stayed | Predicted Left →</span>
                </div>
              </div>
            )}

            {/* Feature Importance */}
            {featureLabels.length > 0 && (
              <div className="glass-card chart-container">
                <div className="chart-title">📈 Feature Importance (Top 12)</div>
                <Bar data={{
                  labels: featureLabels,
                  datasets: [{
                    label: 'Importance',
                    data: featureValues.map(v => parseFloat(v.toFixed(4))),
                    backgroundColor: featureValues.map((_, i) =>
                      `hsla(${260 - i * 15}, 70%, 60%, 0.8)`
                    ),
                    borderRadius: 4
                  }]
                }} options={{
                  indexAxis: 'y',
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ticks: { color: '#94a3b8', font: { size: 11 } }, grid: { display: false } }
                  }
                }} />
              </div>
            )}
          </div>
        </>
      )}

      {!metrics && (
        <div className="glass-card card-pad">
          <div className="empty-state">
            <span className="empty-icon">🤖</span>
            <div className="empty-title">No Model Trained Yet</div>
            <div className="empty-description">
              Activate a dataset first, then click "Train Model" to build your attrition prediction model.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
