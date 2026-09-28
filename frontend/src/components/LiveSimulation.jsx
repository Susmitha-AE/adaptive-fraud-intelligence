import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Eye, ChevronRight } from 'lucide-react';

export function LiveSimulation({ onTransactionProcessed, currentTransactions }) {
  const [isRunning, setIsRunning] = useState(false);
  const [activeScenario, setActiveScenario] = useState("1");
  const [scenarioQueue, setScenarioQueue] = useState([]);
  const [selectedTx, setSelectedTx] = useState(null);
  const queueIndexRef = useRef(0);
  const intervalRef = useRef(null);

  const loadScenario = async (id) => {
    try {
      const res = await fetch(`/api/scenarios/${id}`);
      if (res.ok) {
        const data = await res.json();
        setScenarioQueue(data);
        queueIndexRef.current = 0;
      }
    } catch (e) {
      console.error("Failed to load scenario", e);
    }
  };

  useEffect(() => {
    loadScenario(activeScenario);
  }, [activeScenario]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(async () => {
        setScenarioQueue(currentQueue => {
          if (queueIndexRef.current < currentQueue.length) {
            const item = currentQueue[queueIndexRef.current];
            queueIndexRef.current += 1;

            fetch('/api/predict', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item)
            })
              .then(res => res.json())
              .then(result => {
                if (item.scenario_tag) {
                  result.scenario_type = item.scenario_tag;
                }
                onTransactionProcessed(result);
              })
              .catch(e => console.error("Predict call error", e));
          } else {
            setIsRunning(false);
          }
          return currentQueue;
        });
      }, 500);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleReset = () => {
    setIsRunning(false);
    queueIndexRef.current = 0;
    setSelectedTx(null);
  };

  return (
    <div className="card">
      <div className="card-title">
        <span>REAL-TIME TRANSACTION SIMULATION</span>
        <span className="card-subtitle">Historical dataset replay with live adaptive evaluation</span>
      </div>

      <div className="controls-bar">
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${isRunning ? 'btn-warning' : 'btn-primary'}`}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? <><Pause size={16} /> PAUSE</> : <><Play size={16} /> START SIMULATION</>}
          </button>

          <button className="btn btn-secondary" onClick={handleReset}>
            <RotateCcw size={16} /> RESET
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Select Scenario:</span>
          <select
            value={activeScenario}
            onChange={(e) => {
              setActiveScenario(e.target.value);
              handleReset();
            }}
            style={{
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              padding: '0.4rem 0.8rem',
              borderRadius: '0.375rem',
              fontSize: '0.85rem'
            }}
          >
            <option value="1">Scenario 1: Normal Transaction Activity</option>
            <option value="2">Scenario 2: Legitimate High-Volume Surge (Flash Sale)</option>
            <option value="3">Scenario 3: Suspicious High-Velocity Activity</option>
          </select>
        </div>
      </div>

      <div style={{ overflowX: 'auto', maxHeight: '350px' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Time (s)</th>
              <th>Amount ($)</th>
              <th>Fraud Prob</th>
              <th>Velocity Score</th>
              <th>Surge Score</th>
              <th>Final Risk</th>
              <th>Decision</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentTransactions.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', color: '#64748b', padding: '2rem' }}>
                  Click START SIMULATION to stream transaction events in real-time.
                </td>
              </tr>
            ) : (
              [...currentTransactions].reverse().slice(0, 15).map((tx, idx) => (
                <tr key={idx} onClick={() => setSelectedTx(tx)}>
                  <td className="mono">{tx.transaction_id || `tx_${idx}`}</td>
                  <td className="mono">{tx.Time}</td>
                  <td className="mono">${tx.Amount.toFixed(2)}</td>
                  <td className="mono">{(tx.fraud_probability * 100).toFixed(1)}%</td>
                  <td className="mono">{tx.velocity_score}</td>
                  <td className="mono">{tx.surge_score} ({tx.surge_multiplier}x)</td>
                  <td className="mono" style={{
                    fontWeight: 'bold',
                    color: tx.risk_score >= 70 ? '#ef4444' : tx.risk_score >= 30 ? '#f59e0b' : '#10b981'
                  }}>
                    {tx.risk_score}
                  </td>
                  <td>
                    <span className={`badge badge-${tx.decision.toLowerCase()}`}>
                      {tx.decision}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                      <Eye size={12} /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Selected Transaction Inspector Drawer */}
      {selectedTx && (
        <div className="detail-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ color: '#38bdf8', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ChevronRight size={18} /> TRANSACTION INSPECTOR — {selectedTx.transaction_id}
            </h4>
            <span className={`badge badge-${selectedTx.decision.toLowerCase()}`}>
              {selectedTx.decision}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '0.75rem', borderRadius: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>AMOUNT & TIME</span>
              <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                ${selectedTx.Amount.toFixed(2)} @ t={selectedTx.Time}s
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '0.75rem', borderRadius: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ML FRAUD PROBABILITY</span>
              <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: selectedTx.fraud_probability > 0.3 ? '#ef4444' : '#10b981' }}>
                {(selectedTx.fraud_probability * 100).toFixed(2)}%
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '0.75rem', borderRadius: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>SURGE MULTIPLIER</span>
              <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: selectedTx.surge_multiplier >= 2.0 ? '#fbbf24' : '#38bdf8' }}>
                {selectedTx.surge_multiplier}x baseline
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '0.75rem', borderRadius: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>FINAL FUSED RISK</span>
              <div className="mono" style={{ fontSize: '1.1rem', fontWeight: 'bold', color: selectedTx.risk_score >= 70 ? '#ef4444' : '#10b981' }}>
                {selectedTx.risk_score} / 100
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>AUTOMATED EXPLANATION / REASONS:</span>
            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem', color: '#f8fafc', fontSize: '0.85rem' }}>
              {selectedTx.reasons.map((r, i) => (
                <li key={i} style={{ marginBottom: '0.25rem' }}>{r}</li>
              ))}
            </ul>
          </div>

          <div>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>ANONYMIZED FEATURES (V1 – V28):</span>
            <div className="feature-grid">
              {Object.entries(selectedTx.raw_features || {}).map(([k, v]) => (
                <div key={k} className="feature-item">
                  <div className="feature-label">{k}</div>
                  <div className="feature-val">{typeof v === 'number' ? v.toFixed(3) : v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
