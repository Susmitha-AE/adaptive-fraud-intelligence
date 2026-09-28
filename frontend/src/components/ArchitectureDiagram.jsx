import React from 'react';
import { Database, Cpu, Zap, Shield, GitMerge, CheckCircle, Server, LayoutDashboard, ArrowDown } from 'lucide-react';

export function ArchitectureDiagram() {
  const layers = [
    { title: "Historical Dataset", desc: "Time, V1–V28, Amount (No PII / fake fields)", icon: <Database size={18} color="#38bdf8" />, module: "Member 1 & Member 2" },
    { title: "ML Fraud Detection Pipeline", desc: "Random Forest Classifier / Preprocessing / Feature Engineering", icon: <Cpu size={18} color="#818cf8" />, module: "ml/" },
    { title: "Temporal & Surge Intelligence", desc: "Rolling Window Velocity, Deviation & Surge Multipliers", icon: <Zap size={18} color="#fbbf24" />, module: "intelligence/" },
    { title: "Risk Fusion Engine", desc: "Dynamic Risk Scoring (0–100) combining ML & Temporal Signals", icon: <GitMerge size={18} color="#c084fc" />, module: "backend/" },
    { title: "Decision Engine", desc: "Automated ALLOW / REVIEW / BLOCK with Explainable Reasons", icon: <Shield size={18} color="#34d399" />, module: "backend/" },
    { title: "FastAPI REST API", desc: "POST /predict, GET /analytics, GET /health, GET /scenarios", icon: <Server size={18} color="#06b6d4" />, module: "backend/" },
    { title: "React Cyber Banking Dashboard", desc: "Real-time stream, KPI Cards, Surge Analytics & Drawer Inspector", icon: <LayoutDashboard size={18} color="#f472b6" />, module: "frontend/" }
  ];

  return (
    <div className="card">
      <div className="card-title">
        <span>SYSTEM ARCHITECTURE & INTELLIGENCE PIPELINE</span>
        <span className="card-subtitle">4 Connected Layers + Decision Engine & UI</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '1rem 0' }}>
        {layers.map((layer, idx) => (
          <React.Fragment key={idx}>
            <div style={{
              width: '100%',
              maxWidth: '650px',
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '0.5rem',
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {layer.icon}
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#f8fafc' }}>{layer.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{layer.desc}</div>
                </div>
              </div>
              <span className="mono" style={{ fontSize: '0.7rem', color: '#64748b', backgroundColor: '#1e293b', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>
                {layer.module}
              </span>
            </div>
            {idx < layers.length - 1 && (
              <ArrowDown size={16} color="#38bdf8" style={{ opacity: 0.6 }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
