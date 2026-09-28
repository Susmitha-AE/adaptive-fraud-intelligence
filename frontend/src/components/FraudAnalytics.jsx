import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid, Legend
} from 'recharts';

export function FraudAnalytics({ analytics }) {
  const [datasetSummary, setDatasetSummary] = useState(null);

  useEffect(() => {
    fetch('/api/dataset/summary')
      .then(res => res.json())
      .then(data => setDatasetSummary(data))
      .catch(err => console.error(err));
  }, []);

  const metrics = analytics?.model_metrics?.metrics;
  const isAvailable = metrics && analytics?.model_metrics?.status !== 'unavailable';

  const classData = [
    { name: 'Legitimate (Class 0)', value: datasetSummary?.class_distribution?.legitimate_class_0 || 0, color: '#10b981' },
    { name: 'Fraudulent (Class 1)', value: datasetSummary?.class_distribution?.fraud_class_1 || 0, color: '#ef4444' }
  ];

  const cm = metrics?.confusion_matrix || [[0,0],[0,0]];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card">
        <div className="card-title">
          <span>MODEL EVALUATION & DATASET METRICS</span>
          <span className="card-subtitle">Source: {datasetSummary?.dataset_source || 'development_sample'}</span>
        </div>

        {!isAvailable ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#f59e0b', backgroundColor: '#1e293b', borderRadius: '0.5rem' }}>
            Metrics unavailable. ML model training has not been run or model artifacts are missing.
          </div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ backgroundColor: '#0f172a', padding: '0.85rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PRECISION</div>
                <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#38bdf8' }}>
                  {(metrics.precision * 100).toFixed(1)}%
                </div>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '0.85rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>RECALL</div>
                <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#34d399' }}>
                  {(metrics.recall * 100).toFixed(1)}%
                </div>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '0.85rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>F1 SCORE</div>
                <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fbbf24' }}>
                  {(metrics.f1_score * 100).toFixed(1)}%
                </div>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '0.85rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ROC-AUC</div>
                <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#818cf8' }}>
                  {(metrics.roc_auc * 100).toFixed(1)}%
                </div>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '0.85rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PR-AUC</div>
                <div className="mono" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#c084fc' }}>
                  {(metrics.pr_auc * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Confusion Matrix Visual */}
              <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
                <h4 style={{ color: '#f8fafc', fontSize: '0.9rem', marginBottom: '1rem' }}>CONFUSION MATRIX</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', textAlign: 'center' }}>
                  <div style={{ backgroundColor: '#111827', padding: '1rem', borderRadius: '0.375rem', border: '1px solid #10b981' }}>
                    <div style={{ fontSize: '0.7rem', color: '#10b981' }}>TRUE NEGATIVE</div>
                    <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{cm[0][0]}</div>
                  </div>
                  <div style={{ backgroundColor: '#111827', padding: '1rem', borderRadius: '0.375rem', border: '1px solid #ef4444' }}>
                    <div style={{ fontSize: '0.7rem', color: '#ef4444' }}>FALSE POSITIVE</div>
                    <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{cm[0][1]}</div>
                  </div>
                  <div style={{ backgroundColor: '#111827', padding: '1rem', borderRadius: '0.375rem', border: '1px solid #f59e0b' }}>
                    <div style={{ fontSize: '0.7rem', color: '#f59e0b' }}>FALSE NEGATIVE</div>
                    <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{cm[1][0]}</div>
                  </div>
                  <div style={{ backgroundColor: '#111827', padding: '1rem', borderRadius: '0.375rem', border: '1px solid #10b981' }}>
                    <div style={{ fontSize: '0.7rem', color: '#10b981' }}>TRUE POSITIVE</div>
                    <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{cm[1][1]}</div>
                  </div>
                </div>
              </div>

              {/* Class Distribution Chart */}
              <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
                <h4 style={{ color: '#f8fafc', fontSize: '0.9rem', marginBottom: '0.5rem' }}>HISTORICAL CLASS DISTRIBUTION</h4>
                <div style={{ height: '180px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={classData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                        {classData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1e293b', color: '#f8fafc' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
