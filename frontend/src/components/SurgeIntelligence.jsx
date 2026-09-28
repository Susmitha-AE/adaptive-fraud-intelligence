import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend
} from 'recharts';

export function SurgeIntelligence({ currentTransactions, analytics }) {
  // Aggregate volume over time windows
  const chartData = currentTransactions.map((tx, idx) => ({
    time: tx.Time,
    rate: (tx.velocity_score * 60).toFixed(1),
    baseline: analytics?.model_metrics?.dataset_summary?.baseline_rate || 15,
    risk: tx.risk_score,
    fraudProb: (tx.fraud_probability * 100).toFixed(1)
  }));

  const lastTx = currentTransactions[currentTransactions.length - 1];
  const currentSurgeMult = lastTx ? lastTx.surge_multiplier : 1.0;
  const isSurge = currentSurgeMult >= 2.0;
  const avgFraudProb = currentTransactions.length > 0
    ? (currentTransactions.reduce((acc, t) => acc + t.fraud_probability, 0) / currentTransactions.length * 100).toFixed(1)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card">
        <div className="card-title">
          <span>ADAPTIVE SURGE INTELLIGENCE ANALYSIS</span>
          <span className="card-subtitle">Differentiating Legitimate Surges from Suspicious Velocity Spikes</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>SURGE STATUS</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.25rem', color: isSurge ? '#fbbf24' : '#10b981' }}>
              {isSurge ? `SURGE DETECTED (${currentSurgeMult}x Baseline)` : 'NORMAL VOLUME'}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Historical Baseline: {analytics?.model_metrics?.dataset_summary?.baseline_rate || 15} tx/min
            </p>
          </div>

          <div style={{ backgroundColor: '#0f172a', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #1e293b' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>PATERNAL DIAGNOSIS</span>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '0.25rem', color: avgFraudProb > 20 ? '#ef4444' : '#38bdf8' }}>
              {avgFraudProb > 20 ? 'SUSPICIOUS HIGH-VELOCITY ACTIVITY' : 'LEGITIMATE HIGH-VOLUME SURGE'}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              Average Fraud Pattern Score: {avgFraudProb}%
            </p>
          </div>
        </div>

        {/* Live Volume vs Baseline Chart */}
        <div style={{ height: '280px', width: '100%' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'block', marginBottom: '0.5rem' }}>
            Transaction Rate vs Baseline Over Simulation Timeline
          </span>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5 }} />
                <YAxis stroke="#64748b" />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#1e293b', color: '#f8fafc' }} />
                <Legend />
                <Line type="monotone" dataKey="rate" name="Current Rate (tx/min)" stroke="#38bdf8" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="baseline" name="Historical Baseline" stroke="#64748b" strokeDasharray="5 5" dot={false} />
                <Line type="monotone" dataKey="fraudProb" name="Fraud Prob (%)" stroke="#ef4444" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
              Start simulation to display real-time surge metrics chart.
            </div>
          )}
        </div>
      </div>

      {/* Analytical Comparison Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <h4 style={{ color: '#10b981', marginBottom: '0.5rem' }}>LEGITIMATE HIGH-VOLUME ACTIVITY</h4>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
            High transaction volume surge accompanied by low ML fraud risk scores. Occurs during flash sales, holiday events, or product launches.
          </p>
          <ul style={{ fontSize: '0.8rem', color: '#f8fafc', paddingLeft: '1.2rem' }}>
            <li>High Transaction Velocity (&gt;2x Baseline)</li>
            <li>Normal Feature Distributions (V1 - V28 within standard range)</li>
            <li>Action: <b>ALLOW</b> with adaptive threshold monitoring</li>
          </ul>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
          <h4 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>SUSPICIOUS HIGH-VELOCITY ACTIVITY</h4>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1rem' }}>
            High transaction rate paired with anomalous feature vectors (e.g. V12, V14 deviations). Indicates credential stuffing or coordinated bot attack.
          </p>
          <ul style={{ fontSize: '0.8rem', color: '#f8fafc', paddingLeft: '1.2rem' }}>
            <li>Rapid volume spike &amp; anomalous feature values</li>
            <li>Elevated fraud probability scores</li>
            <li>Action: <b>REVIEW</b> or <b>BLOCK</b> with automated audit reason</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
