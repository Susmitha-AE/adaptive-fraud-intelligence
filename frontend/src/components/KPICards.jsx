import React from 'react';
import { Activity, ShieldCheck, ShieldAlert, Zap, TrendingUp, Layers } from 'lucide-react';

export function KPICards({ analytics }) {
  const total = analytics?.total_transactions || 0;
  const leg = analytics?.legitimate_count || 0;
  const fraud = analytics?.fraudulent_count || 0;
  const highRisk = analytics?.high_risk_count || 0;
  const vel = analytics?.current_velocity || 0;
  const riskLevel = analytics?.current_risk_level || 'NORMAL';

  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={16} color="#38bdf8" /> Total Transactions
        </div>
        <div className="kpi-value mono">{total.toLocaleString()}</div>
        <div className="kpi-sub">Dataset Source: {analytics?.dataset_source || 'development_sample'}</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={16} color="#34d399" /> Legitimate (Class 0)
        </div>
        <div className="kpi-value mono" style={{ color: '#34d399' }}>{leg.toLocaleString()}</div>
        <div className="kpi-sub">{total > 0 ? ((leg / total) * 100).toFixed(1) : 0}% of total volume</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={16} color="#f87171" /> Fraudulent (Class 1)
        </div>
        <div className="kpi-value mono" style={{ color: '#f87171' }}>{fraud.toLocaleString()}</div>
        <div className="kpi-sub">{total > 0 ? ((fraud / total) * 100).toFixed(2) : 0}% fraud rate</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={16} color="#fbbf24" /> High Risk / Blocked
        </div>
        <div className="kpi-value mono" style={{ color: '#fbbf24' }}>{highRisk.toLocaleString()}</div>
        <div className="kpi-sub">Risk Score &ge; 70</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={16} color="#818cf8" /> Current Velocity
        </div>
        <div className="kpi-value mono">{vel} <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>tx/min</span></div>
        <div className="kpi-sub">Surge Multiplier: {analytics?.surge_multiplier || 1.0}x</div>
      </div>

      <div className="kpi-card">
        <div className="kpi-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Layers size={16} color="#06b6d4" /> Current System Risk
        </div>
        <div className="kpi-value mono" style={{
          color: riskLevel === 'CRITICAL' ? '#ef4444' : riskLevel === 'ELEVATED' ? '#f59e0b' : '#10b981'
        }}>
          {riskLevel}
        </div>
        <div className="kpi-sub">Adaptive Threshold Active</div>
      </div>
    </div>
  );
}
