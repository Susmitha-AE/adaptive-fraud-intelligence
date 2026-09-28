import React, { useState, useEffect } from 'react';
import { KPICards } from './components/KPICards';
import { LiveSimulation } from './components/LiveSimulation';
import { SurgeIntelligence } from './components/SurgeIntelligence';
import { FraudAnalytics } from './components/FraudAnalytics';
import { ArchitectureDiagram } from './components/ArchitectureDiagram';
import { Shield, Activity, Zap, BarChart2, Cpu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('simulation');
  const [analytics, setAnalytics] = useState(null);
  const [processedTransactions, setProcessedTransactions] = useState([]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error("Analytics fetch error", e);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleTransactionProcessed = (txOutput) => {
    setProcessedTransactions(prev => [...prev, txOutput]);
    fetchAnalytics();
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo-group">
          <Shield className="logo-icon" />
          <div>
            <div className="logo-title">ADAPTIVE FRAUD INTELLIGENCE</div>
            <div className="logo-subtitle">Real-Time Surge & Velocity Security System</div>
          </div>
        </div>

        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'simulation' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulation')}
          >
            <Activity size={16} /> Real-Time Simulation
          </button>
          <button
            className={`nav-tab ${activeTab === 'surge' ? 'active' : ''}`}
            onClick={() => setActiveTab('surge')}
          >
            <Zap size={16} /> Surge Intelligence
          </button>
          <button
            className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart2 size={16} /> Fraud Analytics
          </button>
          <button
            className={`nav-tab ${activeTab === 'architecture' ? 'active' : ''}`}
            onClick={() => setActiveTab('architecture')}
          >
            <Cpu size={16} /> System Architecture
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <KPICards analytics={analytics} />

        {activeTab === 'simulation' && (
          <LiveSimulation
            onTransactionProcessed={handleTransactionProcessed}
            currentTransactions={processedTransactions}
          />
        )}

        {activeTab === 'surge' && (
          <SurgeIntelligence
            currentTransactions={processedTransactions}
            analytics={analytics}
          />
        )}

        {activeTab === 'analytics' && (
          <FraudAnalytics analytics={analytics} />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureDiagram />
        )}
      </main>
    </div>
  );
}
