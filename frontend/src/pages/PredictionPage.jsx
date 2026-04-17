import { useState } from 'react';
import { predict } from '../api';
import toast from 'react-hot-toast';

const defaultEmployee = {
  Age: 35, BusinessTravel: 'Travel_Rarely', DailyRate: 800,
  Department: 'Research & Development', DistanceFromHome: 5,
  Education: 3, EducationField: 'Life Sciences', EnvironmentSatisfaction: 3,
  Gender: 'Male', HourlyRate: 65, JobInvolvement: 3, JobLevel: 2,
  JobRole: 'Research Scientist', JobSatisfaction: 3, MaritalStatus: 'Single',
  MonthlyIncome: 5000, MonthlyRate: 15000, NumCompaniesWorked: 2,
  Over18: 'Y', OverTime: 'No', PercentSalaryHike: 12, PerformanceRating: 3,
  RelationshipSatisfaction: 3, StockOptionLevel: 1, TotalWorkingYears: 8,
  TrainingTimesLastYear: 3, WorkLifeBalance: 3, YearsAtCompany: 5,
  YearsInCurrentRole: 3, YearsSinceLastPromotion: 1, YearsWithCurrManager: 3
};

const DEPARTMENTS = ['Research & Development', 'Sales', 'Human Resources'];
const JOB_ROLES = ['Research Scientist', 'Laboratory Technician', 'Manufacturing Director',
  'Healthcare Representative', 'Manager', 'Sales Executive', 'Sales Representative',
  'Human Resources', 'Research Director'];
const TRAVEL = ['Travel_Rarely', 'Travel_Frequently', 'Non-Travel'];
const EDU_FIELDS = ['Life Sciences', 'Medical', 'Marketing', 'Technical Degree', 'Human Resources', 'Other'];
const MARITAL = ['Single', 'Married', 'Divorced'];

export default function PredictionPage() {
  const [form, setForm] = useState(defaultEmployee);
  const [result, setResult] = useState(null);
  const [predicting, setPredicting] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handlePredict = async () => {
    setPredicting(true);
    try {
      const res = await predict(form);
      setResult(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Prediction failed — ensure model is trained first.');
    } finally {
      setPredicting(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Attrition Prediction</h1>
        <p className="page-subtitle">Input employee details to predict attrition risk</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 24 }}>
        {/* Form */}
        <div className="glass-card card-pad">
          <div className="chart-title" style={{ marginBottom: 20 }}>👤 Employee Profile</div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Age</label>
              <input className="form-input" type="number" min={18} max={65}
                value={form.Age} onChange={e => set('Age', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select className="form-select" value={form.Gender} onChange={e => set('Gender', e.target.value)}>
                <option>Male</option><option>Female</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <select className="form-select" value={form.Department} onChange={e => set('Department', e.target.value)}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Job Role</label>
              <select className="form-select" value={form.JobRole} onChange={e => set('JobRole', e.target.value)}>
                {JOB_ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Monthly Income ($)</label>
              <input className="form-input" type="number" min={0}
                value={form.MonthlyIncome} onChange={e => set('MonthlyIncome', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">OverTime</label>
              <select className="form-select" value={form.OverTime} onChange={e => set('OverTime', e.target.value)}>
                <option>No</option><option>Yes</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Business Travel</label>
              <select className="form-select" value={form.BusinessTravel} onChange={e => set('BusinessTravel', e.target.value)}>
                {TRAVEL.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Marital Status</label>
              <select className="form-select" value={form.MaritalStatus} onChange={e => set('MaritalStatus', e.target.value)}>
                {MARITAL.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Education Field</label>
              <select className="form-select" value={form.EducationField} onChange={e => set('EducationField', e.target.value)}>
                {EDU_FIELDS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Years at Company</label>
              <input className="form-input" type="number" min={0}
                value={form.YearsAtCompany} onChange={e => set('YearsAtCompany', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Total Working Years</label>
              <input className="form-input" type="number" min={0}
                value={form.TotalWorkingYears} onChange={e => set('TotalWorkingYears', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Years Since Promotion</label>
              <input className="form-input" type="number" min={0}
                value={form.YearsSinceLastPromotion} onChange={e => set('YearsSinceLastPromotion', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Job Satisfaction (1-4)</label>
              <input className="form-input" type="number" min={1} max={4}
                value={form.JobSatisfaction} onChange={e => set('JobSatisfaction', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Work-Life Balance (1-4)</label>
              <input className="form-input" type="number" min={1} max={4}
                value={form.WorkLifeBalance} onChange={e => set('WorkLifeBalance', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Environment Satisfaction (1-4)</label>
              <input className="form-input" type="number" min={1} max={4}
                value={form.EnvironmentSatisfaction} onChange={e => set('EnvironmentSatisfaction', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Distance From Home</label>
              <input className="form-input" type="number" min={0}
                value={form.DistanceFromHome} onChange={e => set('DistanceFromHome', +e.target.value)} />
            </div>
          </div>

          <button className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            onClick={handlePredict} disabled={predicting}>
            {predicting ? <><span className="loading-spinner" /> Predicting...</> : '🎯 Predict Now'}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Main Result */}
            <div className={`glass-card prediction-result fade-in`}>
              <div style={{ fontSize: 56, marginBottom: 8 }}>
                {result.prediction === 1 ? '⚠️' : '✅'}
              </div>
              <div className={`prediction-label ${result.prediction === 1 ? 'prediction-leave' : 'prediction-stay'}`}>
                {result.label}
              </div>
              <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 12 }}>
                Confidence: <strong style={{ color: 'var(--text-primary)' }}>{result.probability_percent}%</strong>
              </div>
              <div className="probability-bar">
                <div
                  className={`probability-fill ${result.probability > 0.7 ? 'prob-high' : result.probability > 0.4 ? 'prob-medium' : 'prob-low'}`}
                  style={{ width: `${result.probability_percent}%` }}
                />
              </div>
              <span className={`badge ${result.risk_level === 'HIGH' ? 'badge-high' : result.risk_level === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}
                style={{ marginTop: 8, fontSize: 14 }}>
                {result.risk_level} RISK
              </span>
            </div>

            {/* XAI Explanation */}
            {result.explanation && (
              <div className="glass-card card-pad fade-in">
                <div className="chart-title" style={{ marginBottom: 16 }}>🔍 Why This Prediction?</div>
                {result.explanation.slice(0, 6).map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)'
                  }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.feature}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: `${Math.round(f.importance * 500)}px`, maxWidth: 80,
                        height: 6, borderRadius: 3, minWidth: 4,
                        background: `hsla(${260 - i * 20}, 70%, 60%, 0.8)`
                      }} />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 40 }}>
                        {(f.importance * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Retention Strategies */}
            {result.retention_strategies && (
              <div className="glass-card card-pad fade-in">
                <div className="chart-title" style={{ marginBottom: 16 }}>💡 Retention Strategies</div>
                {result.retention_strategies.map((s, i) => (
                  <div key={i} style={{
                    padding: 14, marginBottom: 10, borderRadius: 10,
                    background: s.priority === 'HIGH' ? 'rgba(239,68,68,0.08)' :
                      s.priority === 'MEDIUM' ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)',
                    border: `1px solid ${s.priority === 'HIGH' ? 'rgba(239,68,68,0.2)' :
                      s.priority === 'MEDIUM' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{s.issue}</strong>
                      <span className={`badge ${s.priority === 'HIGH' ? 'badge-high' : s.priority === 'MEDIUM' ? 'badge-medium' : 'badge-low'}`}>
                        {s.priority}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>{s.suggestion}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
